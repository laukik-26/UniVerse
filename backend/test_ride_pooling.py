"""
Automated unit and integration test suite for UniVerse Module B (Smart Campus Ride-Pooling).
Verifies Dijkstra shortest path, unreachable nodes, route insertion, matching filters,
diagnostic rejection reasons, deterministic ranking, and travel/carbon savings models.
"""

import pytest
from database import init_db
from seed import seed_database
from graph import (
    CAMPUS_GRAPH, 
    CAMPUS_LOCATIONS, 
    dijkstra_shortest_path, 
    build_adjacency_list
)
from matcher import (
    match_passenger_to_rides,
    calculate_shared_route,
    COST_PER_KM_INR,
    EMISSION_FACTOR_G_PER_KM
)
from routers.rides import (
    get_campus_locations,
    get_shortest_path,
    get_driver_rides,
    create_driver_ride,
    cancel_driver_ride,
    search_ride_matches,
    confirm_carpool_match,
    get_transport_savings_summary
)
from models import DriverRideCreate, PassengerRequestCreate

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    seed_database()

# ----------------- 1. Dijkstra & Graph Tests -----------------

def test_dijkstra_shortest_path_known_distances():
    """Verify Dijkstra finds the exact optimal distance and path on the campus graph."""
    # Direct road: Main Gate -> Admin Block (weight 1.0 km)
    dist, path = dijkstra_shortest_path(CAMPUS_GRAPH, "node-main-gate", "node-admin")
    assert dist == 1.0
    assert path == ["node-main-gate", "node-admin"]

    # Two-hop road: Main Gate -> Admin -> Engineering (1.0 + 1.1 = 2.1 km)
    dist2, path2 = dijkstra_shortest_path(CAMPUS_GRAPH, "node-main-gate", "node-eng-cluster")
    assert dist2 == 2.1
    assert path2 == ["node-main-gate", "node-admin", "node-eng-cluster"]

    # Zero distance for identical origin and target
    dist_zero, path_zero = dijkstra_shortest_path(CAMPUS_GRAPH, "node-admin", "node-admin")
    assert dist_zero == 0.0
    assert path_zero == ["node-admin"]

def test_dijkstra_unreachable_node_handling():
    """Verify disconnected / unreachable nodes safely return infinite distance and empty path."""
    disconnected_graph = {
        "node-A": [("node-B", 1.5)],
        "node-B": [("node-A", 1.5)],
        "node-ISOLATED": [] # No edges
    }
    dist, path = dijkstra_shortest_path(disconnected_graph, "node-A", "node-ISOLATED")
    assert dist == float("inf")
    assert path == []

    # Non-existent node ID
    dist_none, path_none = dijkstra_shortest_path(CAMPUS_GRAPH, "node-main-gate", "node-non-existent")
    assert dist_none == float("inf")
    assert path_none == []

def test_dijkstra_negative_edge_prevention():
    """Verify builder rejects negative edge weights."""
    test_nodes = {"A": {}, "B": {}}
    bad_edges = [("A", "B", -1.5)]
    with pytest.raises(ValueError):
        build_adjacency_list(test_nodes, bad_edges)

# ----------------- 2. Route Insertion & Matching Tests -----------------

def test_route_insertion_calculation():
    """
    Verify sequential stop insertion calculation:
    Driver: Main Gate -> South Gate
    Passenger: Hostel North -> Central Library
    """
    total_shared, full_path, legs = calculate_shared_route(
        driver_orig="node-main-gate",
        driver_dest="node-south-gate",
        passenger_pickup="node-hostel-north",
        passenger_drop="node-central-lib",
        graph=CAMPUS_GRAPH
    )
    assert total_shared != float("inf")
    assert len(full_path) >= 4
    # Verify leg distances sum up to total shared distance
    expected_sum = round(legs["leg_1_pickup_km"] + legs["leg_2_ride_km"] + legs["leg_3_drop_km"], 2)
    assert total_shared == expected_sum

def test_ride_matching_valid_candidate():
    """Verify compatible ride is matched, detours computed, and rankings generated."""
    active_rides = [
        {
            "id": "ride-test-01",
            "driver_name": "Marcus Vance",
            "origin_id": "node-main-gate",
            "destination_id": "node-south-gate",
            "departure_time": "08:30",
            "available_seats": 3,
            "max_detour_km": 1.5,
        }
    ]

    passenger_req = {
        "pickup_id": "node-hostel-north",
        "dropoff_id": "node-south-gate",
        "preferred_time": "08:35",
        "time_flexibility_mins": 15,
        "seats_needed": 1,
        "max_detour_km": 2.0,
    }

    valid_matches, rejected = match_passenger_to_rides(passenger_req, active_rides, CAMPUS_GRAPH)
    assert len(valid_matches) == 1
    assert len(rejected) == 0

    match = valid_matches[0]
    assert match["ride_id"] == "ride-test-01"
    assert match["time_difference_mins"] == 5
    assert match["detour_km"] <= 1.5
    # Verify savings formulas
    expected_cost = round(match["net_saved_distance_km"] * COST_PER_KM_INR, 2)
    assert match["estimated_cost_savings_inr"] == expected_cost
    expected_co2 = round((match["net_saved_distance_km"] * EMISSION_FACTOR_G_PER_KM) / 1000.0, 3)
    assert match["estimated_co2_avoided_kg"] == expected_co2

def test_rejection_reason_insufficient_seats():
    """Verify rejection when passenger requires more seats than available."""
    active_rides = [
        {
            "id": "ride-test-full",
            "driver_name": "Full Driver",
            "origin_id": "node-main-gate",
            "destination_id": "node-south-gate",
            "departure_time": "08:30",
            "available_seats": 1,
            "max_detour_km": 2.0,
        }
    ]
    passenger_req = {
        "pickup_id": "node-admin",
        "dropoff_id": "node-south-gate",
        "preferred_time": "08:30",
        "time_flexibility_mins": 15,
        "seats_needed": 3, # Requires 3, only 1 available
        "max_detour_km": 2.0,
    }
    valid, rejected = match_passenger_to_rides(passenger_req, active_rides, CAMPUS_GRAPH)
    assert len(valid) == 0
    assert len(rejected) == 1
    assert rejected[0]["rejection_reason"] == "INSUFFICIENT_SEATS"

def test_rejection_reason_departure_time_mismatch():
    """Verify rejection when driver and passenger schedules diverge beyond flexibility window."""
    active_rides = [
        {
            "id": "ride-test-evening",
            "driver_name": "Evening Driver",
            "origin_id": "node-main-gate",
            "destination_id": "node-south-gate",
            "departure_time": "18:00", # 18:00 vs 08:30
            "available_seats": 3,
            "max_detour_km": 2.0,
        }
    ]
    passenger_req = {
        "pickup_id": "node-admin",
        "dropoff_id": "node-south-gate",
        "preferred_time": "08:30",
        "time_flexibility_mins": 30, # Exceeds 30 mins
        "seats_needed": 1,
        "max_detour_km": 2.0,
    }
    valid, rejected = match_passenger_to_rides(passenger_req, active_rides, CAMPUS_GRAPH)
    assert len(valid) == 0
    assert len(rejected) == 1
    assert rejected[0]["rejection_reason"] == "TIME_INCOMPATIBLE"

def test_rejection_reason_excessive_detour():
    """Verify rejection when detour exceeds driver's max limit."""
    active_rides = [
        {
            "id": "ride-test-strict-detour",
            "driver_name": "Strict Driver",
            "origin_id": "node-main-gate",
            "destination_id": "node-admin",
            "departure_time": "09:00",
            "available_seats": 3,
            "max_detour_km": 0.1, # Extremely strict 0.1 km limit
        }
    ]
    passenger_req = {
        "pickup_id": "node-sports-arena", # Will require big detour
        "dropoff_id": "node-tech-incubator",
        "preferred_time": "09:00",
        "time_flexibility_mins": 15,
        "seats_needed": 1,
        "max_detour_km": 5.0,
    }
    valid, rejected = match_passenger_to_rides(passenger_req, active_rides, CAMPUS_GRAPH)
    assert len(valid) == 0
    assert len(rejected) == 1
    assert rejected[0]["rejection_reason"] == "EXCESSIVE_DETOUR"

def test_deterministic_ranking_by_smallest_detour_then_time():
    """Verify matches are sorted deterministically: smallest detour first, then smallest time difference."""
    active_rides = [
        {
            "id": "ride-large-detour",
            "driver_name": "Driver B",
            "origin_id": "node-main-gate",
            "destination_id": "node-south-gate",
            "departure_time": "08:30",
            "available_seats": 3,
            "max_detour_km": 3.0,
        },
        {
            "id": "ride-small-detour",
            "driver_name": "Driver A",
            "origin_id": "node-hostel-north",
            "destination_id": "node-south-gate",
            "departure_time": "08:35",
            "available_seats": 3,
            "max_detour_km": 3.0,
        }
    ]
    passenger_req = {
        "pickup_id": "node-hostel-north",
        "dropoff_id": "node-south-gate",
        "preferred_time": "08:35",
        "time_flexibility_mins": 20,
        "seats_needed": 1,
        "max_detour_km": 3.0,
    }
    valid, _ = match_passenger_to_rides(passenger_req, active_rides, CAMPUS_GRAPH)
    assert len(valid) == 2
    # Ride A starts exactly at passenger pickup -> detour is 0.0 km
    assert valid[0]["ride_id"] == "ride-small-detour"
    assert valid[0]["detour_km"] < valid[1]["detour_km"]

# ----------------- 3. API Endpoints & Persistence Tests -----------------

def test_driver_ride_create_and_cancel_workflow():
    """Test driver creating a ride, persisting to SQLite, and cancelling."""
    ride_in = DriverRideCreate(
        origin_id="node-sports-arena",
        destination_id="node-central-lib",
        departure_time="11:15",
        available_seats=3,
        max_detour_km=1.2,
        driver_name="Test Driver"
    )
    created = create_driver_ride(ride_in)
    assert created.status == "active"
    assert created.direct_distance_km > 0
    assert created.available_seats == 3

    # Cancel ride
    cancel_res = cancel_driver_ride(created.id)
    assert cancel_res["status"] == "success"

    # Verify status in DB
    all_rides = get_driver_rides(status_filter="all")
    cancelled = [r for r in all_rides if r.id == created.id][0]
    assert cancelled.status == "cancelled"

def test_confirm_match_and_transport_savings_aggregate():
    """Test booking a carpool match, decrementing seats, and updating aggregate transport savings."""
    # Fetch initial savings summary
    summary_before = get_transport_savings_summary()

    # Create active ride
    ride = create_driver_ride(DriverRideCreate(
        origin_id="node-main-gate",
        destination_id="node-south-gate",
        departure_time="15:00",
        available_seats=2,
        max_detour_km=2.0,
        driver_name="Savings Driver"
    ))

    # Confirm carpool match
    confirm_res = confirm_carpool_match(
        ride_id=ride.id,
        passenger_name="Alex Rivera",
        pickup_id="node-hostel-north",
        dropoff_id="node-south-gate",
        seats_needed=1
    )
    assert confirm_res["status"] == "success"
    assert confirm_res["remaining_seats"] == 1
    assert confirm_res["saved_distance_km"] > 0

    # Verify aggregate savings summary updated
    summary_after = get_transport_savings_summary()
    assert summary_after.total_carpools_completed == summary_before.total_carpools_completed + 1
    assert summary_after.total_saved_vkt_km > summary_before.total_saved_vkt_km
    assert summary_after.total_cost_saved_inr > summary_before.total_cost_saved_inr
    assert summary_after.total_co2_avoided_kg > summary_before.total_co2_avoided_kg
