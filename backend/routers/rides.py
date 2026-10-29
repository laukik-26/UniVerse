"""
Smart Campus Ride-Pooling router for UniVerse Module B.
Handles Campus Road Graph, Dijkstra routing, Driver rides, Passenger requests,
Compatibility matching, and Transport Energy/Cost Savings.
"""

from typing import List, Optional
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, status

from database import get_connection
from graph import CAMPUS_LOCATIONS, CAMPUS_GRAPH, dijkstra_shortest_path
from matcher import (
    match_passenger_to_rides, 
    calculate_shared_route,
    COST_PER_KM_INR, 
    EMISSION_FACTOR_G_PER_KM
)
from models import (
    CampusLocationResponse,
    DriverRideCreate,
    DriverRideResponse,
    PassengerRequestCreate,
    PassengerRequestResponse,
    RideSearchResult,
    TransportSavingsSummary,
)

router = APIRouter(prefix="/api/rides", tags=["Smart Campus Ride-Pooling"])

def log_activity_event(cursor, module: str, title: str, event_type: str = "info"):
    event_id = f"act-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """
        INSERT INTO activity_events (
            id, module, title, event_type, timestamp, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?)
        """,
        (event_id, module, title, event_type, "Just now", now_str)
    )

# ----------------- 1. Graph & Locations -----------------

@router.get("/locations", response_model=List[CampusLocationResponse])
def get_campus_locations():
    """Returns all 12 named campus locations and their coordinates for map visualization."""
    return [
        CampusLocationResponse(
            id=loc["id"],
            name=loc["name"],
            category=loc["category"],
            x=loc["x"],
            y=loc["y"]
        )
        for loc in CAMPUS_LOCATIONS.values()
    ]

@router.get("/routes/shortest-path")
def get_shortest_path(source_id: str, target_id: str):
    """Calculates shortest road distance and path nodes using Dijkstra algorithm."""
    if source_id not in CAMPUS_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Source node '{source_id}' does not exist.")
    if target_id not in CAMPUS_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Target node '{target_id}' does not exist.")

    dist, path = dijkstra_shortest_path(CAMPUS_GRAPH, source_id, target_id)
    if dist == float("inf"):
        return {
            "source_id": source_id,
            "target_id": target_id,
            "reachable": False,
            "distance_km": None,
            "path": [],
        }

    return {
        "source_id": source_id,
        "target_id": target_id,
        "reachable": True,
        "distance_km": dist,
        "path": path,
        "stops_count": len(path),
    }

# ----------------- 2. Driver Rides Workflow -----------------

@router.get("", response_model=List[DriverRideResponse])
def get_driver_rides(status_filter: Optional[str] = "active"):
    """Lists driver-offered rides, optionally filtered by status."""
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM driver_rides"
    params = []

    if status_filter and status_filter != "all":
        query += " WHERE status = ?"
        params.append(status_filter)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        orig_name = CAMPUS_LOCATIONS.get(r["origin_id"], {}).get("name", r["origin_id"])
        dest_name = CAMPUS_LOCATIONS.get(r["destination_id"], {}).get("name", r["destination_id"])
        _, direct_path = dijkstra_shortest_path(CAMPUS_GRAPH, r["origin_id"], r["destination_id"])

        results.append(
            DriverRideResponse(
                id=r["id"],
                driver_id=r["driver_id"],
                driver_name=r["driver_name"],
                origin_id=r["origin_id"],
                origin_name=orig_name,
                destination_id=r["destination_id"],
                destination_name=dest_name,
                departure_time=r["departure_time"],
                available_seats=r["available_seats"],
                total_seats=r["total_seats"],
                max_detour_km=r["max_detour_km"],
                direct_distance_km=r["direct_distance_km"],
                direct_path=direct_path,
                status=r["status"],
                created_at=r["created_at"],
            )
        )
    return results

@router.post("", response_model=DriverRideResponse, status_code=status.HTTP_201_CREATED)
def create_driver_ride(ride_in: DriverRideCreate):
    """Driver offers a new ride."""
    if ride_in.origin_id not in CAMPUS_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Origin location '{ride_in.origin_id}' not found.")
    if ride_in.destination_id not in CAMPUS_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Destination location '{ride_in.destination_id}' not found.")
    if ride_in.origin_id == ride_in.destination_id:
        raise HTTPException(status_code=400, detail="Origin and destination cannot be identical.")

    # Calculate direct driver distance via Dijkstra
    direct_dist, direct_path = dijkstra_shortest_path(CAMPUS_GRAPH, ride_in.origin_id, ride_in.destination_id)
    if direct_dist == float("inf"):
        raise HTTPException(status_code=400, detail="No road connection exists between origin and destination.")

    ride_id = f"ride-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    driver_name = ride_in.driver_name or "Marcus Vance (Transit Coordinator)"
    driver_id = ride_in.driver_id or "DRV-2026-104"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO driver_rides (
            id, driver_id, driver_name, origin_id, destination_id,
            departure_time, available_seats, total_seats, max_detour_km,
            direct_distance_km, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
        """,
        (
            ride_id,
            driver_id,
            driver_name,
            ride_in.origin_id,
            ride_in.destination_id,
            ride_in.departure_time,
            ride_in.available_seats,
            ride_in.available_seats, # total seats initial
            ride_in.max_detour_km,
            direct_dist,
            now_str,
        )
    )

    orig_name = CAMPUS_LOCATIONS[ride_in.origin_id]["name"]
    dest_name = CAMPUS_LOCATIONS[ride_in.destination_id]["name"]
    log_activity_event(
        cursor,
        module="ride-pooling",
        title=f"New carpool offered: {driver_name} ({orig_name} &rarr; {dest_name} at {ride_in.departure_time})",
        event_type="info"
    )

    conn.commit()
    conn.close()

    return DriverRideResponse(
        id=ride_id,
        driver_id=driver_id,
        driver_name=driver_name,
        origin_id=ride_in.origin_id,
        origin_name=orig_name,
        destination_id=ride_in.destination_id,
        destination_name=dest_name,
        departure_time=ride_in.departure_time,
        available_seats=ride_in.available_seats,
        total_seats=ride_in.available_seats,
        max_detour_km=ride_in.max_detour_km,
        direct_distance_km=direct_dist,
        direct_path=direct_path,
        status="active",
        created_at=now_str,
    )

@router.patch("/{ride_id}/cancel")
def cancel_driver_ride(ride_id: str):
    """Driver cancels an offered ride."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM driver_rides WHERE id = ?", (ride_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Ride '{ride_id}' not found.")

    cursor.execute("UPDATE driver_rides SET status = 'cancelled' WHERE id = ?", (ride_id,))
    log_activity_event(
        cursor,
        module="ride-pooling",
        title=f"Carpool ride '{ride_id}' cancelled by {row['driver_name']}",
        event_type="warning"
    )

    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Ride '{ride_id}' has been cancelled."}

# ----------------- 3. Passenger Requests & Search -----------------

@router.get("/requests", response_model=List[PassengerRequestResponse])
def get_passenger_requests():
    """Lists passenger ride requests."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passenger_requests ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        p_name = CAMPUS_LOCATIONS.get(r["pickup_id"], {}).get("name", r["pickup_id"])
        d_name = CAMPUS_LOCATIONS.get(r["dropoff_id"], {}).get("name", r["dropoff_id"])
        direct_dist, _ = dijkstra_shortest_path(CAMPUS_GRAPH, r["pickup_id"], r["dropoff_id"])

        results.append(
            PassengerRequestResponse(
                id=r["id"],
                passenger_id=r["passenger_id"],
                passenger_name=r["passenger_name"],
                pickup_id=r["pickup_id"],
                pickup_name=p_name,
                dropoff_id=r["dropoff_id"],
                dropoff_name=d_name,
                preferred_time=r["preferred_time"],
                time_flexibility_mins=r["time_flexibility_mins"],
                seats_needed=r["seats_needed"],
                max_detour_km=r["max_detour_km"],
                direct_distance_km=direct_dist if direct_dist != float("inf") else 0.0,
                status=r["status"],
                matched_ride_id=r["matched_ride_id"],
                created_at=r["created_at"],
            )
        )
    return results

@router.post("/requests", response_model=PassengerRequestResponse, status_code=status.HTTP_201_CREATED)
def create_passenger_request(req_in: PassengerRequestCreate):
    """Registers a passenger ride search request."""
    if req_in.pickup_id not in CAMPUS_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Pickup location '{req_in.pickup_id}' not found.")
    if req_in.dropoff_id not in CAMPUS_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Drop-off location '{req_in.dropoff_id}' not found.")
    if req_in.pickup_id == req_in.dropoff_id:
        raise HTTPException(status_code=400, detail="Pickup and drop-off cannot be identical.")

    direct_dist, _ = dijkstra_shortest_path(CAMPUS_GRAPH, req_in.pickup_id, req_in.dropoff_id)
    if direct_dist == float("inf"):
        raise HTTPException(status_code=400, detail="No road connection exists between pickup and drop-off.")

    req_id = f"req-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    passenger_name = req_in.passenger_name or "Alex Rivera (Student)"
    passenger_id = req_in.passenger_id or "STU-2026-0842"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO passenger_requests (
            id, passenger_id, passenger_name, pickup_id, dropoff_id,
            preferred_time, time_flexibility_mins, seats_needed, max_detour_km,
            status, matched_ride_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?)
        """,
        (
            req_id,
            passenger_id,
            passenger_name,
            req_in.pickup_id,
            req_in.dropoff_id,
            req_in.preferred_time,
            req_in.time_flexibility_mins,
            req_in.seats_needed,
            req_in.max_detour_km,
            now_str,
        )
    )

    p_name = CAMPUS_LOCATIONS[req_in.pickup_id]["name"]
    d_name = CAMPUS_LOCATIONS[req_in.dropoff_id]["name"]
    log_activity_event(
        cursor,
        module="ride-pooling",
        title=f"Carpool request logged by {passenger_name}: {p_name} &rarr; {d_name} ({req_in.preferred_time})",
        event_type="info"
    )

    conn.commit()
    conn.close()

    return PassengerRequestResponse(
        id=req_id,
        passenger_id=passenger_id,
        passenger_name=passenger_name,
        pickup_id=req_in.pickup_id,
        pickup_name=p_name,
        dropoff_id=req_in.dropoff_id,
        dropoff_name=d_name,
        preferred_time=req_in.preferred_time,
        time_flexibility_mins=req_in.time_flexibility_mins,
        seats_needed=req_in.seats_needed,
        max_detour_km=req_in.max_detour_km,
        direct_distance_km=direct_dist,
        status="pending",
        matched_ride_id=None,
        created_at=now_str,
    )

# ----------------- 4. Matching Algorithm Endpoint -----------------

@router.post("/match", response_model=RideSearchResult)
def search_ride_matches(req_in: PassengerRequestCreate):
    """
    Executes algorithmic ride matching against all active driver rides.
    Calculates reachability, seats, schedule window, detour tolerance,
    and returns deterministic ranking + diagnostic rejection reasons.
    """
    if req_in.pickup_id not in CAMPUS_LOCATIONS or req_in.dropoff_id not in CAMPUS_LOCATIONS:
        raise HTTPException(status_code=400, detail="Invalid campus pickup or drop-off location specified.")
    if req_in.pickup_id == req_in.dropoff_id:
        raise HTTPException(status_code=400, detail="Pickup and drop-off cannot be identical.")

    # Calculate passenger direct distance
    p_direct_dist, _ = dijkstra_shortest_path(CAMPUS_GRAPH, req_in.pickup_id, req_in.dropoff_id)

    # Fetch active driver rides from database
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM driver_rides WHERE status = 'active' AND available_seats > 0")
    ride_rows = cursor.fetchall()
    conn.close()

    active_rides = [dict(row) for row in ride_rows]

    passenger_payload = {
        "pickup_id": req_in.pickup_id,
        "dropoff_id": req_in.dropoff_id,
        "preferred_time": req_in.preferred_time,
        "time_flexibility_mins": req_in.time_flexibility_mins,
        "seats_needed": req_in.seats_needed,
        "max_detour_km": req_in.max_detour_km,
    }

    valid_matches, rejected_candidates = match_passenger_to_rides(
        passenger_request=passenger_payload,
        active_driver_rides=active_rides,
        graph=CAMPUS_GRAPH
    )

    return RideSearchResult(
        passenger_request=passenger_payload,
        passenger_direct_distance_km=p_direct_dist if p_direct_dist != float("inf") else 0.0,
        matches_count=len(valid_matches),
        compatible_matches=valid_matches,
        rejected_candidates=rejected_candidates,
    )

# ----------------- 5. Confirm Match & Persist Savings -----------------

@router.post("/match/confirm")
def confirm_carpool_match(
    ride_id: str,
    passenger_name: str = "Alex Rivera (Student)",
    pickup_id: str = "node-hostel-north",
    dropoff_id: str = "node-south-gate",
    seats_needed: int = 1
):
    """
    Confirms and books a carpool match:
    1. Decrements available seats in driver_rides.
    2. Calculates and writes verified energy & cost savings to carpool_match_records.
    3. Emits a shared activity event.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM driver_rides WHERE id = ? AND status = 'active'", (ride_id,))
    ride = cursor.fetchone()

    if not ride:
        conn.close()
        raise HTTPException(status_code=404, detail="Active driver ride not found.")

    if ride["available_seats"] < seats_needed:
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient seats available on this ride.")

    # Calculate shared route and savings
    d_orig = ride["origin_id"]
    d_dest = ride["destination_id"]
    shared_dist, _, _ = calculate_shared_route(d_orig, d_dest, pickup_id, dropoff_id, CAMPUS_GRAPH)
    d_direct_dist = ride["direct_distance_km"]
    p_direct_dist, _ = dijkstra_shortest_path(CAMPUS_GRAPH, pickup_id, dropoff_id)

    detour_km = round(max(0.0, shared_dist - d_direct_dist), 2)
    saved_vkt = round(max(0.0, (d_direct_dist + p_direct_dist) - shared_dist), 2)
    saved_cost = round(saved_vkt * COST_PER_KM_INR, 2)
    avoided_co2_kg = round((saved_vkt * EMISSION_FACTOR_G_PER_KM) / 1000.0, 3)

    new_seats = ride["available_seats"] - seats_needed
    match_record_id = f"match-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Update driver available seats
    cursor.execute("UPDATE driver_rides SET available_seats = ? WHERE id = ?", (new_seats, ride_id))

    # Insert carpool match record
    cursor.execute(
        """
        INSERT INTO carpool_match_records (
            id, ride_id, request_id, detour_km, shared_distance_km,
            saved_distance_km, saved_cost_inr, avoided_co2_kg, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            match_record_id,
            ride_id,
            "instant-book",
            detour_km,
            shared_dist,
            saved_vkt,
            saved_cost,
            avoided_co2_kg,
            now_str,
        )
    )

    log_activity_event(
        cursor,
        module="ride-pooling",
        title=f"Carpool confirmed! {passenger_name} pooled with {ride['driver_name']} ({saved_vkt} km saved, ₹{saved_cost} cost offset)",
        event_type="success"
    )

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "match_record_id": match_record_id,
        "ride_id": ride_id,
        "remaining_seats": new_seats,
        "saved_distance_km": saved_vkt,
        "saved_cost_inr": saved_cost,
        "avoided_co2_kg": avoided_co2_kg,
        "methodology_disclaimer": f"Assumes ₹{COST_PER_KM_INR}/km and EPA/DEFRA 120g/km car emissions factor."
    }

# ----------------- 6. Transport Savings Aggregate Summary -----------------

@router.get("/summary/savings", response_model=TransportSavingsSummary)
def get_transport_savings_summary():
    """
    Returns aggregate transport savings metrics:
    Accumulated vehicle-km avoided, monetary savings, and estimated CO2 reduction.
    Designed to be consumable by Module C (Sustainable Computing Observatory) separately.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Total rides offered and active count
    cursor.execute("SELECT COUNT(*) FROM driver_rides")
    total_rides = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM driver_rides WHERE status = 'active'")
    active_rides = cursor.fetchone()[0]

    # Completed / confirmed carpool records
    cursor.execute(
        """
        SELECT 
            COUNT(*), 
            COALESCE(SUM(saved_distance_km), 0.0),
            COALESCE(SUM(saved_cost_inr), 0.0),
            COALESCE(SUM(avoided_co2_kg), 0.0)
        FROM carpool_match_records
        """
    )
    m_row = cursor.fetchone()
    conn.close()

    total_carpools = m_row[0]
    total_saved_vkt = round(m_row[1], 2)
    total_cost_saved = round(m_row[2], 2)
    total_co2_kg = round(m_row[3], 3)

    return TransportSavingsSummary(
        total_rides_offered=total_rides,
        active_rides_count=active_rides,
        total_carpools_completed=total_carpools,
        total_saved_vkt_km=total_saved_vkt,
        total_cost_saved_inr=total_cost_saved,
        total_co2_avoided_kg=total_co2_kg,
        assumed_cost_per_km_inr=COST_PER_KM_INR,
        assumed_emission_factor_g_km=EMISSION_FACTOR_G_PER_KM,
        methodology_note=(
            f"Evaluates avoided single-occupancy vehicle-kilometres using ₹{COST_PER_KM_INR}/km baseline "
            f"and EPA/DEFRA passenger car emission factor of {EMISSION_FACTOR_G_PER_KM} g CO2e/km. "
            "Values represent algorithmic estimates, not measured tailpipe sensors."
        )
    )
