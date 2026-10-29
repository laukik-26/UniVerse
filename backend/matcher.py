"""
UniVerse Smart Campus Ride-Pooling: Matching & Savings Optimization Engine.
Implements route compatibility, sequential stop insertion, deterministic ranking,
travel cost savings, and documented carbon estimation.
"""

from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
from graph import CAMPUS_GRAPH, CAMPUS_LOCATIONS, dijkstra_shortest_path

# Documented Constant Assumptions
COST_PER_KM_INR = 8.50          # INR (₹) per vehicle-km for passenger cars (Fuel + Maintenance)
EMISSION_FACTOR_G_PER_KM = 120.0 # Grams CO2e per vehicle-km (EPA / UK DEFRA car standard)

def parse_time_to_minutes(time_str: str) -> int:
    """Converts 'HH:MM' 24-hour format string to integer minutes since midnight."""
    try:
        parts = time_str.strip().split(":")
        hours = int(parts[0])
        minutes = int(parts[1])
        return hours * 60 + minutes
    except Exception:
        return 0

def format_minutes_to_time(minutes: int) -> str:
    """Converts integer minutes since midnight to 'HH:MM' string."""
    h = (minutes // 60) % 24
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

def calculate_shared_route(
    driver_orig: str,
    driver_dest: str,
    passenger_pickup: str,
    passenger_drop: str,
    graph: Dict[str, List[Tuple[str, float]]] = CAMPUS_GRAPH
) -> Tuple[float, List[str], Dict[str, float]]:
    """
    Evaluates sequential route insertion:
    Stop Sequence: Driver Origin -> Passenger Pickup -> Passenger Drop-off -> Driver Destination
    
    Subpaths evaluated via Dijkstra:
      Leg 1: Driver Origin -> Passenger Pickup
      Leg 2: Passenger Pickup -> Passenger Drop-off
      Leg 3: Passenger Drop-off -> Driver Destination
      
    Returns:
      (total_shared_distance_km, combined_node_path, leg_distances_dict)
    """
    # Leg 1: Driver Origin to Passenger Pickup
    dist_1, path_1 = dijkstra_shortest_path(graph, driver_orig, passenger_pickup)
    if dist_1 == float("inf"):
        return float("inf"), [], {}

    # Leg 2: Passenger Pickup to Passenger Drop-off
    dist_2, path_2 = dijkstra_shortest_path(graph, passenger_pickup, passenger_drop)
    if dist_2 == float("inf"):
        return float("inf"), [], {}

    # Leg 3: Passenger Drop-off to Driver Destination
    dist_3, path_3 = dijkstra_shortest_path(graph, passenger_drop, driver_dest)
    if dist_3 == float("inf"):
        return float("inf"), [], {}

    total_dist = round(dist_1 + dist_2 + dist_3, 2)

    # Stitch composite path without duplicate joining nodes
    full_path: List[str] = []
    if path_1:
        full_path.extend(path_1)
    if path_2:
        # Avoid duplicate connecting node
        if full_path and path_2[0] == full_path[-1]:
            full_path.extend(path_2[1:])
        else:
            full_path.extend(path_2)
    if path_3:
        if full_path and path_3[0] == full_path[-1]:
            full_path.extend(path_3[1:])
        else:
            full_path.extend(path_3)

    legs = {
        "leg_1_pickup_km": dist_1,
        "leg_2_ride_km": dist_2,
        "leg_3_drop_km": dist_3,
    }

    return total_dist, full_path, legs

def match_passenger_to_rides(
    passenger_request: Dict[str, Any],
    active_driver_rides: List[Dict[str, Any]],
    graph: Dict[str, List[Tuple[str, float]]] = CAMPUS_GRAPH
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Evaluates all active driver rides against a passenger request.
    
    Filters & Criteria:
    1. Route reachability between all 4 stops
    2. Seat availability: driver available_seats >= requested seats
    3. Departure time compatibility: abs(T_driver - T_passenger) <= flexibility
    4. Detour constraint: (shared_distance - driver_direct_distance) <= driver.max_detour
    5. Ranking: Smallest detour first, then smallest time difference, then ride ID.
    
    Returns:
      (compatible_matches_ranked, rejected_candidates_with_reasons)
    """
    p_pickup = passenger_request["pickup_id"]
    p_drop = passenger_request["dropoff_id"]
    p_time_mins = parse_time_to_minutes(passenger_request["preferred_time"])
    p_flex = int(passenger_request.get("time_flexibility_mins", 15))
    p_seats = int(passenger_request.get("seats_needed", 1))
    p_max_detour = float(passenger_request.get("max_detour_km", 99.0))

    # Calculate passenger direct distance
    p_direct_dist, p_direct_path = dijkstra_shortest_path(graph, p_pickup, p_drop)

    valid_matches: List[Dict[str, Any]] = []
    rejected_candidates: List[Dict[str, Any]] = []

    for ride in active_driver_rides:
        ride_id = ride["id"]
        driver_name = ride["driver_name"]
        d_orig = ride["origin_id"]
        d_dest = ride["destination_id"]
        d_seats = int(ride["available_seats"])
        d_time_mins = parse_time_to_minutes(ride["departure_time"])
        d_max_detour = float(ride["max_detour_km"])

        candidate_base = {
            "ride_id": ride_id,
            "driver_name": driver_name,
            "driver_origin": d_orig,
            "driver_destination": d_dest,
            "departure_time": ride["departure_time"],
            "available_seats": d_seats,
            "driver_max_detour_km": d_max_detour,
        }

        # 1. Seat Availability Check
        if d_seats < p_seats:
            rejected_candidates.append({
                **candidate_base,
                "rejection_reason": "INSUFFICIENT_SEATS",
                "rejection_detail": f"Driver has {d_seats} seat(s) available; request requires {p_seats}.",
            })
            continue

        # 2. Departure Time Compatibility Check
        time_diff = abs(d_time_mins - p_time_mins)
        if time_diff > p_flex:
            rejected_candidates.append({
                **candidate_base,
                "time_difference_mins": time_diff,
                "rejection_reason": "TIME_INCOMPATIBLE",
                "rejection_detail": f"Departure time difference ({time_diff} mins) exceeds your {p_flex} min flexibility window.",
            })
            continue

        # 3. Direct Driver Distance Check
        d_direct_dist, d_direct_path = dijkstra_shortest_path(graph, d_orig, d_dest)
        if d_direct_dist == float("inf"):
            rejected_candidates.append({
                **candidate_base,
                "rejection_reason": "UNREACHABLE_ROUTE",
                "rejection_detail": "Driver origin and destination are topologically disconnected.",
            })
            continue

        # 4. Route Reachability & Shared Distance Calculation
        shared_dist, shared_path, legs = calculate_shared_route(d_orig, d_dest, p_pickup, p_drop, graph)
        if shared_dist == float("inf"):
            rejected_candidates.append({
                **candidate_base,
                "rejection_reason": "UNREACHABLE_ROUTE",
                "rejection_detail": "Passenger pickup or drop-off location is unreachable from driver's path.",
            })
            continue

        # 5. Detour Calculation
        detour_km = round(max(0.0, shared_dist - d_direct_dist), 2)

        # Check driver detour tolerance
        if detour_km > d_max_detour:
            rejected_candidates.append({
                **candidate_base,
                "detour_km": detour_km,
                "shared_distance_km": shared_dist,
                "driver_direct_distance_km": d_direct_dist,
                "rejection_reason": "EXCESSIVE_DETOUR",
                "rejection_detail": f"Detour of {detour_km} km exceeds driver's maximum limit of {d_max_detour} km.",
            })
            continue

        # Check passenger detour tolerance if specified
        if detour_km > p_max_detour:
            rejected_candidates.append({
                **candidate_base,
                "detour_km": detour_km,
                "rejection_reason": "EXCESSIVE_DETOUR",
                "rejection_detail": f"Detour of {detour_km} km exceeds your specified limit of {p_max_detour} km.",
            })
            continue

        # 6. Environmental & Cost Savings Calculations
        # Avoided vehicle distance: (driver direct + passenger direct) - shared distance
        net_saved_km = round(max(0.0, (d_direct_dist + p_direct_dist) - shared_dist), 2)
        cost_savings_inr = round(net_saved_km * COST_PER_KM_INR, 2)
        co2_avoided_grams = round(net_saved_km * EMISSION_FACTOR_G_PER_KM, 1)
        co2_avoided_kg = round(co2_avoided_grams / 1000.0, 3)

        match_record = {
            **candidate_base,
            "driver_direct_distance_km": d_direct_dist,
            "passenger_direct_distance_km": p_direct_dist,
            "shared_distance_km": shared_dist,
            "detour_km": detour_km,
            "time_difference_mins": time_diff,
            "net_saved_distance_km": net_saved_km,
            "estimated_cost_savings_inr": cost_savings_inr,
            "estimated_co2_avoided_kg": co2_avoided_kg,
            "estimated_co2_avoided_grams": co2_avoided_grams,
            "assumed_stop_order": [d_orig, p_pickup, p_drop, d_dest],
            "shared_path_nodes": shared_path,
            "legs": legs,
            "match_score": round(100.0 - (detour_km * 15.0 + time_diff * 1.5), 1),
            "methodology_disclaimer": (
                f"Assumes ₹{COST_PER_KM_INR}/km carpool operating baseline and EPA/DEFRA 120g/km passenger car benchmark. "
                "Route evaluates sequential 4-way topological insertion."
            ),
        }
        valid_matches.append(match_record)

    # Deterministic Ranking:
    # 1. Smallest detour_km
    # 2. Smallest time_difference_mins
    # 3. Alphabetical ride_id
    valid_matches.sort(key=lambda m: (m["detour_km"], m["time_difference_mins"], m["ride_id"]))

    return valid_matches, rejected_candidates
