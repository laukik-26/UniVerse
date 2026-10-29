# UniVerse — REST API Specification & Endpoint Catalogue

All endpoints run on the FastAPI backend (default: `http://127.0.0.1:8000`). Interactive Swagger/OpenAPI documentation is auto-generated and accessible at `/docs`.

---

## 1. System & Health Endpoints

### 1.1 Root Status
- **Method**: `GET /`
- **Response**: `200 OK`
```json
{
  "platform": "UniVerse Campus Ecosystem",
  "status": "online",
  "version": "1.0.0",
  "modules": [
    "A: Student Intelligence & Academic Hub (Active)",
    "B: Smart Campus Ride-Pooling (Active)",
    "C: Sustainable Computing Observatory (Active)",
    "D: Privacy-Aware Digital Wellbeing (Active)",
    "E: Responsible Examination Monitoring (Active)"
  ]
}
```

### 1.2 Health Check
- **Method**: `GET /api/health`
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "environment": "development",
  "database": "sqlite_local"
}
```

---

## 2. Module A: Student Intelligence & Academic Hub (`/api/academic`)

### 2.1 Get Student Profile
- **Method**: `GET /api/academic/profile?student_id={id}`
- **Default**: `STU-2026-CS-089` (Alex Rivera)
- **Response**: `200 OK`
```json
{
  "id": "STU-2026-CS-089",
  "name": "Alex Rivera",
  "student_id": "STU-2026-CS-089",
  "department": "Computer Science & Engineering",
  "term": "Fall 2026 (Year 3, Term 5)",
  "cgpa": 8.74,
  "placement_goal": "Full Stack / Distributed Systems Engineer",
  "skills": ["Algorithms", "TypeScript", "React", "Python", "FastAPI"],
  "interests": ["System Architecture", "Green Computing", "Ride-Pooling"]
}
```

### 2.2 Task Checklist Operations
- **`GET /api/academic/tasks`**: Returns placement preparation checklist items.
- **`POST /api/academic/tasks`**: Creates a milestone item.
  - **Payload**: `{"title": "Implement Dijkstra Priority Queue", "category": "DSA", "due_date": "2026-11-15"}`
  - **Validation**: Title $\ge 3$ characters; category must be one of `DSA`, `Development`, `CS Fundamentals`, `Aptitude`, `Interview Prep`.
  - **Response**: `201 Created`
- **`PATCH /api/academic/tasks/{task_id}`**: Updates status (`pending` or `completed`), title, or category.
- **`DELETE /api/academic/tasks/{task_id}`**: Removes milestone. Returns `200 OK`.

### 2.3 Dynamic Readiness Progress
- **Method**: `GET /api/academic/tasks/progress?student_id={id}`
- **Response**: `200 OK`
```json
{
  "student_id": "STU-2026-CS-089",
  "total_tasks": 8,
  "completed_tasks": 4,
  "completion_percentage": 50.0,
  "tasks_by_category": {
    "DSA": { "total": 2, "completed": 1, "percent": 50.0 },
    "Development": { "total": 2, "completed": 1, "percent": 50.0 },
    "CS Fundamentals": { "total": 2, "completed": 1, "percent": 50.0 },
    "Aptitude": { "total": 1, "completed": 1, "percent": 100.0 },
    "Interview Prep": { "total": 1, "completed": 0, "percent": 0.0 }
  }
}
```

### 2.4 Peer Mentor Directory
- **`GET /api/academic/mentors`**: Search with query parameters `?q={query}&availability={available|busy|all}`.
- **`GET /api/academic/mentors/{mentor_id}`**: Returns individual mentor bio and rating.
- **`POST /api/academic/mentorship-requests`**: Schedules session.
  - **Payload**: `{"mentor_id": "mentor-101", "topic": "Graph Algorithms", "message": "Need review on Dijkstra"}`
  - **Validation**: Topic and message $\ge 3$ chars; duplicate pending requests for the same mentor are rejected with `400 Bad Request`.
- **`PATCH /api/academic/mentorship-requests/{request_id}`**: Accepts or declines (`accepted`, `declined`).

### 2.5 Academic Resources
- **`GET /api/academic/resources`**: Filters by `?q={search}&subject={subject}&resource_type={type}`.
- **`POST /api/academic/resources`**: Contributes new syllabus resource.
- **`POST /api/academic/resources/{resource_id}/download`**: Increments download counter.

---

## 3. Module B: Smart Campus Ride-Pooling (`/api/rides`)

### 3.1 Landmark Locations & Graph
- **`GET /api/rides/locations`**: Returns 12 named landmarks with 2D coordinates for rendering.
- **`GET /api/rides/routes/shortest-path?source_id={src}&target_id={tgt}`**: Computes shortest path via Dijkstra.
  - **Response**: `{"reachable": true, "distance_km": 2.0, "path": ["node-main-gate", "node-hostel-north", "node-eng-cluster"], "stops_count": 3}`

### 3.2 Driver Ride Workflow
- **`GET /api/rides?status_filter={active|completed|cancelled|all}`**: Lists driver offerings.
- **`POST /api/rides`**: Driver creates carpool offering.
  - **Payload**:
    ```json
    {
      "driver_id": "DRV-101",
      "driver_name": "Marcus Vance",
      "origin_id": "node-main-gate",
      "destination_id": "node-south-gate",
      "departure_time": "08:30",
      "available_seats": 3,
      "max_detour_km": 1.5
    }
    ```
  - **Validation**: Origin $\ne$ Destination; seats $\in [1, 6]$; Max detour $\ge 0.1\text{ km}$.
- **`PATCH /api/rides/{ride_id}/cancel`**: Cancels active ride offering.

### 3.3 Passenger Compatibility Matching
- **`POST /api/rides/match`**: Evaluates active rides against passenger constraints.
  - **Payload**:
    ```json
    {
      "pickup_id": "node-hostel-north",
      "dropoff_id": "node-tech-incubator",
      "preferred_time": "08:35",
      "time_flexibility_mins": 15,
      "seats_needed": 1,
      "max_detour_km": 1.5
    }
    ```
  - **Response**: Returns `compatible_matches` (ranked by detour km and time delta) and `rejected_candidates` with diagnostic rejection reasons.

### 3.4 Confirm Carpool Booking
- **`POST /api/rides/confirm-match`**:
  - **Payload**: `{"ride_id": "ride-001", "passenger_id": "STU-089", "passenger_name": "Alex Rivera", "pickup_id": "...", "dropoff_id": "..."}`
  - **Persistence**: Decrements `available_seats`, inserts into `carpool_match_records`, logs event to `activity_events`.

### 3.5 Cumulative Transport Savings
- **`GET /api/rides/savings/summary`**: Returns aggregated VKT reductions, INR fuel cost savings, and avoided tailpipe CO₂ kilograms.

---

## 4. Module C: Sustainable Computing Observatory (`/api/observatory`)

### 4.1 Workload Telemetry
- **`GET /api/observatory/services`**: Returns catalog of demonstrable services (Placement API, Resource Search, Ride Matcher) with CPU utilization, memory, and baseline vs. optimized profiles.

### 4.2 Custom Energy Estimation
- **`POST /api/observatory/estimate`**:
  - **Payload**:
    ```json
    {
      "idle_power_w": 45.0,
      "max_power_w": 220.0,
      "utilization_fraction": 0.65,
      "duration_seconds": 3600,
      "grid_factor_kg_per_kwh": 0.716
    }
    ```
  - **Validation**: $P_{\text{idle}} \ge 0$, $P_{\text{max}} \ge P_{\text{idle}}$, $0.0 \le u \le 1.0$, $t > 0$, $f_{\text{grid}} \ge 0$.
  - **Response**:
    ```json
    {
      "average_power_w": 158.75,
      "energy_kwh": 0.15875,
      "co2_kg": 0.113665,
      "co2_grams": 113.665
    }
    ```

### 4.3 Scenario Comparison
- **`GET /api/observatory/scenarios`**: Returns energy differential ($\Delta\text{kWh}$, $\Delta\text{CO}_2$) across baseline and optimized workloads.

### 4.4 Scope Boundary Partitioning
- **`GET /api/observatory/transport-vs-compute`**: Demonstrates strict separation between Scope 2 datacenter energy and Scope 3 commuter transport emissions.

---

## 5. Module D: Privacy-Aware Digital Wellbeing (`/api/wellbeing`)

### 5.1 Categorization Rules
- **`GET /api/wellbeing/default-rules`**: Returns built-in domain dictionary (`productive`, `neutral`, `distracting`).

### 5.2 Evaluate Browsing Trace (Stateless)
- **`POST /api/wellbeing/evaluate-events`**:
  - **Payload**: List of `{ "raw_domain_or_url": "...", "timestamp_seconds": ... }`.
  - **Privacy**: Normalizes hosts on-the-fly; returns dwell metrics and context switches. **Zero raw URLs persisted.**

### 5.3 Focus Session Persistence
- **`POST /api/wellbeing/session`**: Stores voluntary aggregate session record.
  - **Payload**: `{"session_duration_seconds": 1800, "paused_seconds": 120, "effective_duration_seconds": 1680, "context_switches": 2, "distraction_dwell_seconds": 60, "productivity_score_pct": 96.5}`
- **`GET /api/wellbeing/sessions`**: Lists student's anonymous aggregate sessions.
- **`DELETE /api/wellbeing/purge`**: Permanently deletes all records from `wellbeing_sessions`.

---

## 6. Module E: Responsible Examination Monitoring (`/api/exam`)

### 6.1 Invigilation Queue
- **`GET /api/exam/incidents?status={status}&event_type={type}`**: Lists flagged cues for human proctor review.
- **`GET /api/exam/incidents/{incident_id}`**: Retrieves incident details, evidence metadata, and review status.

### 6.2 Proctor Determination & Status Transition
- **`PATCH /api/exam/incidents/{incident_id}/status`**:
  - **Payload**:
    ```json
    {
      "status": "dismissed",
      "reviewer_notes": "Student dropped pen; physical desk inspection confirmed benign action.",
      "actor_name": "Proctor Meaghan"
    }
    ```
  - **Validation**: Status must be `pending_review`, `in_review`, `dismissed`, or `resolved`.
  - **Audit Guarantee**: Updates `exam_incidents` and automatically writes an immutable log to `exam_audit_log`.

### 6.3 Proctor Audit Trail
- **`GET /api/exam/audit-trail?incident_id={id}`**: Returns immutable chronological determinations for legal and student contestation review.

### 6.4 Rule Evaluation Testbed
- **`POST /api/exam/evaluate-rule`**:
  - Evaluates Rule 1 (sliding-window frequency) or Rule 2 (2D IoU box intrusion) without requiring webcam hardware.

---

## 7. Shared Activity Stream (`/api/activities`)

- **`GET /api/activities?limit=20`**: Returns combined notification stream across all 5 modules.
- **`PATCH /api/activities/{event_id}/read`**: Marks individual notification as read.
- **`POST /api/activities/mark-all-read`**: Marks all notifications as read.
