"""
Idempotent Database Seeding Script for UniVerse.
Running this script multiple times guarantees no duplicate records.
"""

import json
import sqlite3
from datetime import datetime
from database import get_connection, init_db

def seed_database():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Seed Student Profile
    cursor.execute("SELECT COUNT(*) FROM student_profiles WHERE id = ?", ("STU-2026-0842",))
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            """
            INSERT INTO student_profiles (
                id, name, student_id, department, term, cgpa, placement_goal, skills, interests
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "STU-2026-0842",
                "Alex Rivera",
                "STU-2026-0842",
                "Computer Science & Engineering",
                "Fall 2026 (Semester 7)",
                8.72,
                "Full-Stack & Distributed Systems Software Engineer",
                json.dumps(["Python", "TypeScript", "React", "FastAPI", "Distributed Systems", "SQL", "Git"]),
                json.dumps(["Cloud Systems", "Sustainability Tech", "Graph Theory", "AI Engineering"])
            )
        )

    # 2. Seed Placement Tasks
    sample_tasks = [
        ("task-01", "STU-2026-0842", "Solve 30 Medium Graph & DP Problems on LeetCode", "DSA", "completed", "2026-10-25"),
        ("task-02", "STU-2026-0842", "Review Dijkstra and A* Shortest Path Graph Implementations", "DSA", "pending", "2026-11-05"),
        ("task-03", "STU-2026-0842", "Build Full-Stack FastAPI & SQLite RESTful API Microservice", "Development", "completed", "2026-10-27"),
        ("task-04", "STU-2026-0842", "Optimize React State Management & Component Render Latency", "Development", "pending", "2026-11-10"),
        ("task-05", "STU-2026-0842", "Review OS Virtual Memory, Page Tables, and Concurrency Primitives", "CS Fundamentals", "completed", "2026-10-24"),
        ("task-06", "STU-2026-0842", "Study Relational Database ACID Properties & B-Tree Indexing", "CS Fundamentals", "pending", "2026-11-12"),
        ("task-07", "STU-2026-0842", "Complete 5 Quantitative Aptitude & Speed Mathematics Drills", "Aptitude", "completed", "2026-10-26"),
        ("task-08", "STU-2026-0842", "Conduct Peer Mock Interview on Scalable System Architecture", "Interview Prep", "pending", "2026-11-14"),
    ]

    for task in sample_tasks:
        cursor.execute("SELECT COUNT(*) FROM placement_tasks WHERE id = ?", (task[0],))
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                """
                INSERT INTO placement_tasks (
                    id, student_id, title, category, status, due_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (task[0], task[1], task[2], task[3], task[4], task[5], datetime.now().isoformat())
            )

    # 3. Seed Peer Mentors
    sample_mentors = [
        (
            "mentor-1",
            "Sarah Lin",
            "Final Year Senior &bull; Incoming SWE at CloudScale",
            "Computer Science",
            "Passionate about graph traversal algorithms, distributed databases, and helping peers conquer technical interviews.",
            ["Graph Algorithms", "System Design", "Python", "FastAPI"],
            ["DSA Coding Rounds", "Mock Interviews", "Resume Critique"],
            "available",
            4.95,
            28
        ),
        (
            "mentor-2",
            "Dev Patel",
            "4th Year CSE &bull; Ex-Fintech Platform Intern",
            "Computer Science",
            "Experienced with enterprise full-stack development, modern frontend architectures, and deployment pipelines.",
            ["React", "TypeScript", "SQL", "Docker"],
            ["Full-Stack Project Reviews", "Git Workflows", "Portfolio Audits"],
            "available",
            4.88,
            19
        ),
        (
            "mentor-3",
            "Priya Sharma",
            "M.Tech Data Science &bull; Green Computing Fellow",
            "Data Science",
            "Specializes in algorithmic efficiency, sustainability telemetry, and statistical analysis for tech interviews.",
            ["PyTorch", "Energy Modeling", "Data Structures"],
            ["ML & Data Engineering Roles", "Research Publications"],
            "busy",
            4.92,
            34
        ),
        (
            "mentor-4",
            "Kevin Zhang",
            "4th Year Systems &bull; Open Source Kernel Contributor",
            "Computer Engineering",
            "Focuses on core CS fundamentals: OS internals, network sockets, compilers, and low-latency programming.",
            ["C++", "Linux Kernel", "Concurrency", "Networks"],
            ["Core CS Fundamentals", "Low-Level Coding", "System Debugging"],
            "available",
            4.85,
            15
        ),
    ]

    for mentor in sample_mentors:
        cursor.execute("SELECT COUNT(*) FROM peer_mentors WHERE id = ?", (mentor[0],))
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                """
                INSERT INTO peer_mentors (
                    id, name, role_title, department, bio, skills, expertise, availability, rating, sessions_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    mentor[0],
                    mentor[1],
                    mentor[2],
                    mentor[3],
                    mentor[4],
                    json.dumps(mentor[5]),
                    json.dumps(mentor[6]),
                    mentor[7],
                    mentor[8],
                    mentor[9]
                )
            )

    # 4. Seed Mentorship Requests
    cursor.execute("SELECT COUNT(*) FROM mentorship_requests WHERE id = ?", ("req-seed-01",))
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            """
            INSERT INTO mentorship_requests (
                id, mentor_id, mentor_name, student_id, student_name, topic, message, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "req-seed-01",
                "mentor-1",
                "Sarah Lin",
                "STU-2026-0842",
                "Alex Rivera",
                "Graph Shortest Path & Detour Routing Prep",
                "Hi Sarah, I would love to schedule a mock session focusing on Dijkstra edge constraints and system design.",
                "accepted",
                "2026-10-28 14:30:00"
            )
        )

    # 5. Seed Academic Resources
    sample_resources = [
        (
            "res-01",
            "CS301: Advanced Data Structures & Graph Algorithms Notes",
            "Algorithms",
            "Lecture Notes",
            ["Graphs", "Dijkstra", "Trees", "Dynamic Programming"],
            "Comprehensive semester lecture notes covering adjacency representations, shortest path algorithms, and NP-completeness.",
            "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-notes/",
            0,
            "Prof. Kelling (Dept Chair)",
            "2026-10-15 10:00:00",
            342
        ),
        (
            "res-02",
            "CS302: Operating Systems Final Examination Question Papers (2023-2025)",
            "Operating Systems",
            "Question Paper",
            ["PYQ", "Concurrency", "Virtual Memory", "Semaphores"],
            "Archived mid-term and end-semester university examination papers with detailed solutions and rubric breakdowns.",
            "https://cs.stanford.edu/people/eroberts/courses/cs106b/",
            0,
            "Academic Affairs Archive",
            "2026-10-18 11:20:00",
            512
        ),
        (
            "res-03",
            "CS303: Database Normalization & B+ Tree Indexing Practice Set",
            "Database Systems",
            "Practice Exercise",
            ["B-Trees", "SQL", "Transactions", "ACID"],
            "Curated problem set containing 25 normalization proofs (3NF, BCNF) and B+ tree insertion/deletion drill problems.",
            "placeholder://university-resources/db-exercises-sheet.pdf",
            1,
            "Sarah Lin (Peer Mentor)",
            "2026-10-20 16:45:00",
            189
        ),
        (
            "res-04",
            "CS304: Computer Networks Socket Programming & RFC Reference Guide",
            "Computer Networks",
            "Reference Guide",
            ["TCP/IP", "Sockets", "HTTP/3", "Flow Control"],
            "Practical laboratory reference guide detailing POSIX socket programming, packet headers, and sliding window protocols.",
            "placeholder://university-resources/networks-socket-lab.pdf",
            1,
            "Kevin Zhang (Peer Mentor)",
            "2026-10-22 09:15:00",
            214
        ),
        (
            "res-05",
            "CS305: Distributed Consensus Protocols (Raft & Paxos Simplified)",
            "Algorithms",
            "Lecture Notes",
            ["Distributed Systems", "Raft", "Consensus", "Fault Tolerance"],
            "Visual step-by-step primer on leader election, log replication, and heartbeat fault recovery in distributed systems.",
            "https://pdos.csail.mit.edu/6.824/schedule.html",
            0,
            "Dev Patel (Peer Mentor)",
            "2026-10-24 14:30:00",
            295
        ),
        (
            "res-06",
            "CS306: Quantitative Aptitude Speed Drill Question Bank",
            "Aptitude",
            "Practice Exercise",
            ["Speed Math", "Permutations", "Logic", "Probability"],
            "100 timed aptitude questions curated from top tech campus placement screening rounds with analytical shortcuts.",
            "placeholder://university-resources/aptitude-speed-drill.pdf",
            1,
            "Placement Training Cell",
            "2026-10-26 18:00:00",
            428
        ),
    ]

    for res in sample_resources:
        cursor.execute("SELECT COUNT(*) FROM academic_resources WHERE id = ?", (res[0],))
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                """
                INSERT INTO academic_resources (
                    id, title, subject, resource_type, tags, description, url, is_placeholder, uploaded_by, created_at, downloads_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    res[0],
                    res[1],
                    res[2],
                    res[3],
                    json.dumps(res[4]),
                    res[5],
                    res[6],
                    res[7],
                    res[8],
                    res[9],
                    res[10]
                )
            )

    # 6. Seed Activity Events
    sample_activities = [
        ("act-01", "academic-hub", "Sarah Lin accepted mentorship request on Graph Shortest Path", "success", "3 hours ago"),
        ("act-02", "academic-hub", "Completed task: Build Full-Stack FastAPI & SQLite RESTful API", "info", "1 day ago"),
        ("act-03", "academic-hub", "New resource published: CS306 Quantitative Aptitude Speed Drill", "info", "2 days ago"),
        ("act-04", "ride-pooling", "Marcus Vance created morning route: Main Gate to South Gate", "info", "4 hours ago"),
        ("act-05", "ride-pooling", "Carpool matched: 3.2 vehicle-km saved (0.38 kg CO2e avoided)", "success", "5 hours ago"),
    ]

    for act in sample_activities:
        cursor.execute("SELECT COUNT(*) FROM activity_events WHERE id = ?", (act[0],))
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                """
                INSERT INTO activity_events (
                    id, module, title, event_type, timestamp, is_read, created_at
                ) VALUES (?, ?, ?, ?, ?, 0, ?)
                """,
                (act[0], act[1], act[2], act[3], act[4], datetime.now().isoformat())
            )

    # 7. Seed Driver Rides (Module B)
    from graph import dijkstra_shortest_path, CAMPUS_GRAPH
    sample_rides = [
        ("ride-01", "DRV-101", "Marcus Vance (Transit Coordinator)", "node-main-gate", "node-south-gate", "08:30", 3, 4, 1.5),
        ("ride-02", "DRV-102", "Sarah Lin (Peer Mentor)", "node-hostel-north", "node-eng-cluster", "08:45", 2, 3, 1.0),
        ("ride-03", "DRV-103", "Dev Patel (Student)", "node-student-center", "node-tech-incubator", "14:00", 3, 4, 1.5),
        ("ride-04", "DRV-104", "Prof. Kelling (Faculty)", "node-admin", "node-hostel-south", "17:15", 2, 4, 2.0),
    ]

    for r in sample_rides:
        cursor.execute("SELECT COUNT(*) FROM driver_rides WHERE id = ?", (r[0],))
        if cursor.fetchone()[0] == 0:
            direct_dist, _ = dijkstra_shortest_path(CAMPUS_GRAPH, r[3], r[4])
            cursor.execute(
                """
                INSERT INTO driver_rides (
                    id, driver_id, driver_name, origin_id, destination_id,
                    departure_time, available_seats, total_seats, max_detour_km,
                    direct_distance_km, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
                """,
                (r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], direct_dist, datetime.now().isoformat())
            )

    # 8. Seed Passenger Requests (Module B)
    sample_requests = [
        ("req-pool-01", "STU-2026-0842", "Alex Rivera (Student)", "node-hostel-north", "node-south-gate", "08:35", 15, 1, 2.0),
        ("req-pool-02", "STU-2026-0512", "Priya Sharma (Student)", "node-admin", "node-tech-incubator", "14:10", 20, 1, 1.5),
    ]

    for pr in sample_requests:
        cursor.execute("SELECT COUNT(*) FROM passenger_requests WHERE id = ?", (pr[0],))
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                """
                INSERT INTO passenger_requests (
                    id, passenger_id, passenger_name, pickup_id, dropoff_id,
                    preferred_time, time_flexibility_mins, seats_needed, max_detour_km,
                    status, matched_ride_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?)
                """,
                (pr[0], pr[1], pr[2], pr[3], pr[4], pr[5], pr[6], pr[7], pr[8], datetime.now().isoformat())
            )

    # 9. Seed Initial Completed Carpool Match Record for historical savings
    cursor.execute("SELECT COUNT(*) FROM carpool_match_records WHERE id = ?", ("match-seed-01",))
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            """
            INSERT INTO carpool_match_records (
                id, ride_id, request_id, detour_km, shared_distance_km,
                saved_distance_km, saved_cost_inr, avoided_co2_kg, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "match-seed-01",
                "ride-01",
                "req-pool-01",
                0.8,
                4.2,
                3.2,
                27.20,
                0.384,
                "2026-10-28 09:00:00"
            )
        )

    conn.commit()
    conn.close()
    print("Database seeding completed idempotently.")

if __name__ == "__main__":
    seed_database()
