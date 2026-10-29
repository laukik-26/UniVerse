# UniVerse — Database Schema & Data Retention Architecture

UniVerse utilizes an embedded SQLite3 relational database (`backend/universe.db`) configured with `sqlite3.Row` dictionary mapping, indexed primary keys, foreign key relationships, and automated idempotent initialization on application startup.

---

## 1. Table Definitions & Constraints

### 1.1 `student_profiles`
Stores student career profiles, academic term standings, and skills.
```sql
CREATE TABLE IF NOT EXISTS student_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    department TEXT NOT NULL,
    term TEXT NOT NULL,
    cgpa REAL NOT NULL,
    placement_goal TEXT NOT NULL,
    skills TEXT NOT NULL,       -- JSON/CSV array of verified skills
    interests TEXT NOT NULL     -- JSON/CSV array of technical interests
);
```

### 1.2 `placement_tasks`
Tracks student milestones for career preparation checklists.
```sql
CREATE TABLE IF NOT EXISTS placement_tasks (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,     -- 'DSA', 'Development', 'CS Fundamentals', 'Aptitude', 'Interview Prep'
    status TEXT NOT NULL,       -- 'pending', 'completed'
    due_date TEXT,
    created_at TEXT NOT NULL
);
```

### 1.3 `peer_mentors`
Stores senior student mentor profiles, ratings, and areas of expertise.
```sql
CREATE TABLE IF NOT EXISTS peer_mentors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    department TEXT NOT NULL,
    bio TEXT NOT NULL,
    skills TEXT NOT NULL,
    expertise TEXT NOT NULL,
    availability TEXT NOT NULL, -- 'available', 'busy', 'away'
    rating REAL NOT NULL,
    sessions_count INTEGER NOT NULL
);
```

### 1.4 `mentorship_requests`
Maintains mentorship booking state and junior-to-senior student interactions.
```sql
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL,
    mentor_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL,       -- 'pending', 'accepted', 'declined'
    created_at TEXT NOT NULL
);
```

### 1.5 `academic_resources`
Centralized repository of student-contributed study materials and past exam papers.
```sql
CREATE TABLE IF NOT EXISTS academic_resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    resource_type TEXT NOT NULL,-- 'Lecture Notes', 'Question Paper', 'Practice Exercise', 'Reference Guide'
    tags TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    is_placeholder INTEGER NOT NULL, -- 1 for synthetic reference, 0 for direct URL
    uploaded_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    downloads_count INTEGER NOT NULL
);
```

### 1.6 `driver_rides` (Module B)
Stores carpool offerings published by campus commuters.
```sql
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
    status TEXT NOT NULL,       -- 'active', 'completed', 'cancelled'
    created_at TEXT NOT NULL
);
```

### 1.7 `passenger_requests` (Module B)
Stores ride requests submitted by student passengers.
```sql
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
    status TEXT NOT NULL,       -- 'pending', 'matched', 'cancelled'
    matched_ride_id TEXT,
    created_at TEXT NOT NULL
);
```

### 1.8 `carpool_match_records` (Module B)
Records confirmed carpool pairings and calculates cumulative vehicle-km savings.
```sql
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
);
```

### 1.9 `wellbeing_sessions` (Module D)
**Privacy Boundary**: Stores only high-level numerical summaries. Never stores URLs, domains, queries, or page text.
```sql
CREATE TABLE IF NOT EXISTS wellbeing_sessions (
    id TEXT PRIMARY KEY,
    session_duration_seconds INTEGER NOT NULL,
    paused_seconds INTEGER NOT NULL,
    effective_duration_seconds INTEGER NOT NULL,
    context_switches INTEGER NOT NULL,
    distraction_dwell_seconds INTEGER NOT NULL,
    productivity_score_pct REAL NOT NULL,
    created_at TEXT NOT NULL
);
```

### 1.10 `exam_incidents` (Module E)
Stores invigilation behavioral cues awaiting certified human proctor determination.
```sql
CREATE TABLE IF NOT EXISTS exam_incidents (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    desk_label TEXT NOT NULL,
    source TEXT NOT NULL,       -- 'Synthetic Demo', 'Local CV Model'
    event_type TEXT NOT NULL,   -- 'Repeated Head-Turn Cues', 'Restricted Zone Intrusion', etc.
    confidence REAL NOT NULL,
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL,       -- 'pending_review', 'in_review', 'dismissed', 'resolved'
    reviewer_notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### 1.11 `exam_audit_log` (Module E)
Append-only immutable audit trail recording every state transition, proctor identity, and justification note.
```sql
CREATE TABLE IF NOT EXISTS exam_audit_log (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    action TEXT NOT NULL,       -- 'status_change', 'dismissal', 'resolution'
    actor_role TEXT NOT NULL,   -- e.g. 'Proctor Meaghan'
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    notes TEXT NOT NULL,
    timestamp TEXT NOT NULL
);
```

### 1.12 `activity_events` (Cross-Module Event Sinking)
Unified activity feed powering the frontend global notification drawer.
```sql
CREATE TABLE IF NOT EXISTS activity_events (
    id TEXT PRIMARY KEY,
    module TEXT NOT NULL,       -- 'academic-hub', 'ride-pooling', 'sustainable-compute', etc.
    title TEXT NOT NULL,
    event_type TEXT NOT NULL,   -- 'info', 'success', 'alert', 'warning'
    timestamp TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);
```

---

## 2. Seed Data Strategy

When the backend server starts, `backend/main.py` invokes `init_db()` and `seed_database()`. The seeding process is **strictly idempotent**:
- It checks for existing primary keys before inserting initial demonstration data.
- Seeds include:
  1. Default student profile (`Alex Rivera`, CGPA 8.74, 8 checklist items).
  2. 4 senior peer mentors across Algorithms, Distributed Systems, ML, and Product.
  3. 6 academic syllabus resources (DSA notes, OS past question papers, System Design guides).
  4. 3 active driver carpool offerings across the campus road network.
  5. 4 initial exam incidents showcasing each status (`pending_review`, `in_review`, `dismissed`, `resolved`) with corresponding proctor audit entries.

---

## 3. Data Retention & Sovereignty Policies

| Table Category | Retention Policy | Purge Mechanism |
| :--- | :--- | :--- |
| **Academic Records** | Academic term lifetime (retrievable until graduation). | Soft/hard delete via `DELETE /api/academic/tasks/{id}`. |
| **Ride-Pooling Logs** | 30 days post-ride completion for dispute resolution, then anonymized into cumulative savings. | Automatic aggregation into `carpool_match_records`. |
| **Wellbeing Metrics** | **Immediate client sovereignty**. No raw data is ever stored on the server. Aggregates retained only at user discretion. | Instant permanent purge via `DELETE /api/wellbeing/purge`. |
| **Exam Proctor Audit Logs** | **Permanent immutable retention** for academic integrity compliance and grade contestation hearings. | Read-only; cannot be updated or purged by proctors. |
| **Activity Feed** | Rolling 30-day window or user mark-as-read clearing. | Read state updated via `PATCH /api/activities/{id}/read`. |
