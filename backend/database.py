"""
Database initialization and connection management for UniVerse.
Uses local SQLite with JSON field support and clean connection handling.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "universe.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Student Profile Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        student_id TEXT NOT NULL,
        department TEXT NOT NULL,
        term TEXT NOT NULL,
        cgpa REAL NOT NULL,
        placement_goal TEXT NOT NULL,
        skills TEXT NOT NULL,
        interests TEXT NOT NULL
    )
    """)

    # 2. Placement Tasks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS placement_tasks (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        due_date TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 3. Peer Mentors Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS peer_mentors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role_title TEXT NOT NULL,
        department TEXT NOT NULL,
        bio TEXT NOT NULL,
        skills TEXT NOT NULL,
        expertise TEXT NOT NULL,
        availability TEXT NOT NULL,
        rating REAL NOT NULL,
        sessions_count INTEGER NOT NULL
    )
    """)

    # 4. Mentorship Requests Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mentorship_requests (
        id TEXT PRIMARY KEY,
        mentor_id TEXT NOT NULL,
        mentor_name TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        topic TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 5. Academic Resources Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS academic_resources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        tags TEXT NOT NULL,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        is_placeholder INTEGER NOT NULL,
        uploaded_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        downloads_count INTEGER NOT NULL
    )
    """)

    # 6. Shared Activity Events Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_events (
        id TEXT PRIMARY KEY,
        module TEXT NOT NULL,
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    # 7. Driver Rides Table (Module B)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS driver_rides (
        id TEXT PRIMARY KEY,
        driver_id TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        origin_id TEXT NOT NULL,
        destination_id TEXT NOT NULL,
        departure_time TEXT NOT NULL,
        available_seats INTEGER NOT NULL,
        total_seats INTEGER NOT NULL,
        max_detour_km REAL NOT NULL,
        direct_distance_km REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 8. Passenger Requests Table (Module B)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS passenger_requests (
        id TEXT PRIMARY KEY,
        passenger_id TEXT NOT NULL,
        passenger_name TEXT NOT NULL,
        pickup_id TEXT NOT NULL,
        dropoff_id TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        time_flexibility_mins INTEGER NOT NULL,
        seats_needed INTEGER NOT NULL,
        max_detour_km REAL NOT NULL,
        status TEXT NOT NULL,
        matched_ride_id TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 9. Carpool Match Records Table (Module B)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS carpool_match_records (
        id TEXT PRIMARY KEY,
        ride_id TEXT NOT NULL,
        request_id TEXT NOT NULL,
        detour_km REAL NOT NULL,
        shared_distance_km REAL NOT NULL,
        saved_distance_km REAL NOT NULL,
        saved_cost_inr REAL NOT NULL,
        avoided_co2_kg REAL NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database tables initialized successfully at:", DB_PATH)
