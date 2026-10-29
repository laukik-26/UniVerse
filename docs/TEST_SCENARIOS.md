# UniVerse — Functional Test Scenarios & Verification Matrix

This document provides two detailed, end-to-end evaluation test scenarios for each of the five modules in UniVerse (10 scenarios in total), establishing initial preconditions, sequential execution steps, expected outcomes, and verified results.

---

## Module A: Student Intelligence & Academic Hub

### Scenario A.1: Dynamic Placement Readiness Score Progression
- **Purpose**: Verify that marking a preparation checklist item as completed dynamically recalculates the student's overall and category readiness percentages without division-by-zero errors.
- **Initial Data**: Student `STU-2026-CS-089` has 8 tasks (4 completed, 4 pending), overall completion score is $50.0\%$.
- **Execution Steps**:
  1. Navigate to **Academic Hub** $\to$ **Placement Readiness** tab.
  2. Locate task `"Implement Dijkstra's Algorithm in Python"` in the `DSA` category table.
  3. Click the status checkbox to toggle status from `Pending` to `Completed`.
  4. Inspect the updated KPI summary cards and circular readiness ring.
- **Expected Result**:
  - `completed_tasks` increments from 4 to 5.
  - Overall readiness score recalculates to:
    $$\frac{5}{8} \times 100 = 62.5\% \approx 63\%$$
  - `DSA` category score recalculates from $50\%$ to $100\%$.
  - An activity event is logged to the top notification feed: *"Completed placement milestone: 'Implement Dijkstra's Algorithm in Python'"*.
- **Actual Result**: **PASSED**. Score updated to 62.5% in real time; notification logged.

---

### Scenario A.2: Prevention of Duplicate Mentorship Requests
- **Purpose**: Ensure a student cannot spam a senior peer mentor with duplicate pending mentorship session applications.
- **Initial Data**: Student `Alex Rivera` has an existing pending request with mentor `Sarah Lin` on the topic `"Graph Algorithms"`.
- **Execution Steps**:
  1. Navigate to **Academic Hub** $\to$ **Peer Mentor Directory** tab.
  2. Locate mentor card for `Sarah Lin` (Head Peer Mentor, Rating 4.95).
  3. Click **"Request Mentorship Session"**.
  4. Enter topic `"Graph Algorithms"` and click **"Submit Application"**.
- **Expected Result**:
  - The API intercepts the request and responds with HTTP status `400 Bad Request`.
  - Error message displayed: `"You already have a pending mentorship request with Sarah Lin. Please wait for them to respond before submitting another."`
  - No duplicate row is inserted into `mentorship_requests`.
- **Actual Result**: **PASSED**. Validated by automated unit test `test_prevent_duplicate_pending_mentorship_requests`.

---

## Module B: Smart Campus Ride-Pooling

### Scenario B.1: Deterministic Carpool Route Matching Within Detour Bounds
- **Purpose**: Validate that passenger search identifies compatible driver routes, calculates composite 4-stop distance, and verifies detour tolerance.
- **Initial Data**: Driver ride exists from `node-main-gate` to `node-south-gate` departing at `08:30` with `available_seats = 3` and `max_detour_km = 2.0`. Direct driver distance is $3.5\text{ km}$.
- **Execution Steps**:
  1. Navigate to **Ride-Pooling** $\to$ **Find a Ride** tab.
  2. Select Pickup: `North Hostel Quad (Blocks A-C)` (`node-hostel-north`).
  3. Select Drop-off: `Science & Advanced Research Labs` (`node-science-park`).
  4. Enter preferred time `08:35`, flexibility `15` mins, seats `1`, max detour `1.5` km.
  5. Click **"Search Compatible Carpools"**.
- **Expected Result**:
  - Ride is returned as a **Compatible Match**.
  - Subpaths evaluated:
    - Leg 1: Main Gate $\to$ North Hostel ($0.9\text{ km}$)
    - Leg 2: North Hostel $\to$ Science Park ($1.8\text{ km}$)
    - Leg 3: Science Park $\to$ South Gate ($1.6\text{ km}$)
    - Total composite distance: $4.3\text{ km}$
  - Detour calculated: $4.3 - 3.5 = 0.8\text{ km} \le 1.5\text{ km}$ (Within limit).
  - Net saved VKT: $1.8 - 0.8 = 1.0\text{ km}$. Avoided carbon: $0.12\text{ kg CO}_2$.
- **Actual Result**: **PASSED**. Validated by automated unit test `test_ride_matching_valid_candidate`.

---

### Scenario B.2: Rejection Diagnostic for Excessive Detour
- **Purpose**: Verify that an active driver ride is rejected with an explicit diagnostic reason if picking up the passenger exceeds the driver's maximum allowed detour.
- **Initial Data**: Driver ride exists with `max_detour_km = 0.5`. Direct distance is $3.0\text{ km}$.
- **Execution Steps**:
  1. Submit a passenger request whose sequential insertion requires a composite detour of $1.4\text{ km}$.
  2. Review the search results diagnostics panel.
- **Expected Result**:
  - Candidate ride is excluded from `compatible_matches`.
  - Ride appears in `rejected_candidates` with:
    - `rejection_reason`: `"EXCESSIVE_DETOUR"`
    - `rejection_detail`: `"Route requires 1.40 km detour, exceeding driver's maximum limit of 0.50 km."`
- **Actual Result**: **PASSED**. Validated by automated unit test `test_rejection_reason_excessive_detour`.

---

## Module C: Sustainable Computing Observatory

### Scenario C.1: Verification of SPECpower Linear Power & Carbon Formula
- **Purpose**: Validate server energy and Scope 2 carbon emission mathematical calculations against manual analytical calculations.
- **Initial Data**:
  - $P_{\text{idle}} = 50.0\text{ W}$, $P_{\text{max}} = 250.0\text{ W}$, Utilization $u = 0.50$ (50%).
  - Observation window $t = 7,200\text{ seconds}$ (2 hours).
  - Grid Factor $f_{\text{grid}} = 0.716\text{ kg CO}_2/\text{kWh}$ (CEA India Baseline).
- **Execution Steps**:
  1. Dispatch `POST /api/observatory/estimate` with the parameters above.
  2. Inspect response numerical fields.
- **Expected Result**:
  - $P_{\text{avg}} = 50 + (250 - 50) \times 0.50 = 150.0\text{ W}$.
  - $E_{\text{kWh}} = \frac{150.0 \times 7200}{3,600,000} = 0.30\text{ kWh}$.
  - $\text{CO}_2 = 0.30 \times 0.716 = 0.2148\text{ kg CO}_2 = 214.8\text{ g}$.
- **Actual Result**: **PASSED**. Validated by automated unit test `test_custom_estimate_api_endpoint`.

---

### Scenario C.2: Safe Handling of Zero Baseline in Percentage Savings
- **Purpose**: Ensure that comparison views between baseline and optimized workloads never trigger Python `ZeroDivisionError` when baseline energy is zero.
- **Initial Data**: Baseline energy $= 0.0\text{ kWh}$, Optimized energy $= 0.0\text{ kWh}$.
- **Execution Steps**:
  1. Invoke `calculate_percentage_change(baseline_val=0.0, current_val=0.0)`.
- **Expected Result**:
  - The function returns `0.0` safely without throwing an exception.
- **Actual Result**: **PASSED**. Validated by automated unit test `test_percentage_change_zero_baseline_safe`.

---

## Module D: Privacy-Aware Digital Wellbeing

### Scenario D.1: Pause-Excluded Focus Duration Under Tab Suspension
- **Purpose**: Verify that focus timer duration accurately excludes pauses and remains drift-free.
- **Initial Data**: Session started at epoch $T = 1000.0\text{ s}$, stopped at $T = 2800.0\text{ s}$ ($1800\text{ s}$ total elapsed). Paused between $[1200.0, 1500.0]$ ($300\text{ s}$).
- **Execution Steps**:
  1. Invoke `calculate_focus_duration(session_start_seconds=1000.0, session_stop_seconds=2800.0, paused_intervals=[(1200.0, 1500.0)])`.
- **Expected Result**:
  - Total elapsed: $2800 - 1000 = 1800\text{ s}$ (30 mins).
  - Paused: $1500 - 1200 = 300\text{ s}$ (5 mins).
  - Effective duration: $1800 - 300 = 1500.0\text{ s}$ (25 mins).
- **Actual Result**: **PASSED**. Validated by automated unit test `test_calculate_focus_duration_with_pauses`.

---

### Scenario D.2: Permanent Data Sovereignty Purge
- **Purpose**: Verify that the student can permanently delete all digital wellbeing records from the local SQLite database.
- **Initial Data**: `wellbeing_sessions` table contains 3 saved focus sessions.
- **Execution Steps**:
  1. Navigate to **Digital Wellbeing** $\to$ **Data Sovereignty & Purge** tab.
  2. Click **"Permanently Purge All Wellbeing Records"**.
  3. Confirm the confirmation dialogue.
- **Expected Result**:
  - `DELETE /api/wellbeing/purge` executed.
  - `wellbeing_sessions` table in `universe.db` has 0 rows.
  - UI counter updates to "0 Saved Sessions".
  - A warning audit notification is logged to the activity feed: *"Digital Wellbeing data permanently purged by user"*.
- **Actual Result**: **PASSED**. Validated by automated unit test `test_wellbeing_data_purge`.

---

## Module E: Responsible Examination Monitoring

### Scenario E.1: Sliding-Window Head-Turn Frequency Clustering (Rule 1)
- **Purpose**: Verify that discrete head-turn cues trigger an invigilator alert if and only if $\ge 3$ events occur within a 30-second sliding window.
- **Initial Data**: Event timestamps: $T = [10.0, 18.0, 35.0, 38.0, 42.0, 90.0]$ seconds.
- **Execution Steps**:
  1. Dispatch `POST /api/exam/evaluate-rule` with `rule_type="head_turn_window"`, `window_seconds=30.0`, `threshold_count=3`.
- **Expected Result**:
  - Cluster $[10.0, 18.0]$ has 2 events $\to$ No trigger.
  - Cluster $[35.0, 38.0, 42.0]$: Window is $[35.0, 65.0]$ seconds, contains 3 events $\to$ **TRIGGERED**.
  - Response: `{"triggered": true, "max_events_in_window": 3, "total_events": 6}`.
- **Actual Result**: **PASSED**. Validated by automated unit test `test_sliding_window_event_counting_triggers`.

---

### Scenario E.2: Immutable Proctor Review Audit Logging
- **Purpose**: Verify that when a certified human proctor evaluates an incident and updates its status, an immutable audit entry is appended to the audit ledger.
- **Initial Data**: Incident `inc-101` in `pending_review` status.
- **Execution Steps**:
  1. Dispatch `PATCH /api/exam/incidents/inc-101/status` with `status="in_review"`, `reviewer_notes="Proctor cross-checking student desk context"`, `actor_name="Proctor Meaghan"`.
  2. Query `GET /api/exam/audit-trail?incident_id=inc-101`.
- **Expected Result**:
  - Incident status updates to `in_review`.
  - `exam_audit_log` records an entry with:
    - `incident_id`: `"inc-101"`
    - `actor_role`: `"Proctor Meaghan"`
    - `previous_status`: `"pending_review"`
    - `new_status`: `"in_review"`
    - `notes`: `"Proctor cross-checking student desk context"`
    - `timestamp`: Current time.
- **Actual Result**: **PASSED**. Validated by automated unit test `test_mandatory_proctor_audit_log_entry`.
