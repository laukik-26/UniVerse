# UniVerse: Quality Assurance & System Verification Report

**Evaluation Date**: 2026-10-29  
**Platform**: Windows 11 (PowerShell)  
**Execution Environment**: Python 3.14.4 + Node.js v24.21.0 + Vite 8.3.5  
**Target Repository**: `https://github.com/laukik-26/UniVerse.git`  
**Test Suite**: 62 Automated Unit & Integration Tests (100% Passed)

---

## 1. Executive Summary

As QA Engineer for the UniVerse platform, an end-to-end verification of all five core modules, database persistence, algorithms, API endpoints, and frontend production bundles was conducted. All 62 backend test cases passed, and the frontend compiled cleanly with strict TypeScript type-checking.

| Component | Target Coverage | Automated Tests | Result |
| :--- | :--- | :--- | :--- |
| **Module A** | Student Intelligence & Academic Hub | 8 tests | **PASS (100%)** |
| **Module B** | Smart Campus Ride-Pooling (Dijkstra) | 11 tests | **PASS (100%)** |
| **Module C** | Sustainable Computing Observatory (SPECpower) | 18 tests | **PASS (100%)** |
| **Module D** | Privacy-Aware Digital Wellbeing | 10 tests | **PASS (100%)** |
| **Module E** | Responsible Examination Monitoring | 10 tests | **PASS (100%)** |
| **Integration** | Cross-Module Contracts, Partitioning & Feed | 5 tests | **PASS (100%)** |
| **Frontend** | React 19 + TypeScript Production Build | `npm run build` | **PASS (0 errors)** |

---

## 2. Module-by-Module Verification Matrix

### MODULE A: Student Intelligence & Academic Hub

| Requirement | Test Method | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Placement Progress Calculation** | `test_academic.py::test_placement_progress_dynamic_calculation` | Dynamically updates completion % when tasks are created or marked complete | Computed dynamically: 4/8 tasks = 50.0%, 5/9 tasks = 55.6% | **PASS** |
| **Empty Task-List Behavior** | `test_academic.py::test_empty_task_list_progress_behavior` | Safely handles students with 0 tasks without zero-division errors | Returns `total_tasks=0`, `completed_tasks=0`, `completion_percentage=0.0%`, all category percentages `0.0%` | **PASS** |
| **Duplicate Mentorship Prevention** | `test_academic.py::test_prevent_duplicate_pending_mentorship_requests` | Rejects second pending request to same mentor with 400 Bad Request | HTTP 400 with detail `"Already have an active pending mentorship request"` | **PASS** |
| **Mentor Status Workflow** | `test_academic.py::test_mentor_accept_and_decline_workflow` | Mentor can transition request between `pending`, `accepted`, and `declined` | Status transitions persist in SQLite and update response | **PASS** |
| **Resource Search & Filtering** | `test_academic.py::test_academic_resource_search_and_validation` | Filters by subject and increments download counters | Subject filtering returns matching resources; downloads count increments | **PASS** |

---

### MODULE B: Smart Campus Ride-Pooling

| Requirement | Test Method | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Dijkstra Shortest Path** | `test_ride_pooling.py::test_dijkstra_shortest_path_known_distances` | Correct distance & path reconstruction with non-negative edge weights | Returns exact known shortest path on 12-node campus road graph | **PASS** |
| **Unreachable Destinations** | `test_ride_pooling.py::test_dijkstra_unreachable_node_handling` | Returns `inf` distance and empty path without crashing | Safely returns `distance=inf` and `path=[]` | **PASS** |
| **Seat Availability** | `test_ride_pooling.py::test_rejection_reason_insufficient_seats` | Rejects match candidates when passenger count exceeds available seats | Excludes candidate and logs rejection reason `"insufficient_seats"` | **PASS** |
| **Departure Constraints** | `test_ride_pooling.py::test_rejection_reason_departure_time_mismatch` | Rejects candidates outside preferred departure time flexibility window | Excludes candidate and logs rejection reason `"time_mismatch"` | **PASS** |
| **Maximum Detour** | `test_ride_pooling.py::test_rejection_reason_excessive_detour` | Rejects candidate when insertion detour exceeds max permitted detour | Excludes candidate and logs rejection reason `"excessive_detour"` | **PASS** |
| **Deterministic Ranking** | `test_ride_pooling.py::test_deterministic_ranking_by_smallest_detour_then_time` | Deterministically ranks compatible candidates by smallest detour, then time delta | Candidates ranked deterministically by detour distance, then time | **PASS** |
| **Savings Calculations & Units** | `test_ride_pooling.py::test_confirm_match_and_transport_savings_aggregate` | Computes saved distance (km), fuel cost (₹), and avoided CO2 (kg) | Saved distance: 6.4 km, cost: ₹54.40, avoided CO2: 0.768 kg per match | **PASS** |

---

### MODULE C: Sustainable Computing Observatory

| Requirement | Test Method | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Linear Power Model** | `test_observatory.py::test_linear_interpolation_utilization` | $P_{\text{avg}} = P_{\text{idle}} + (P_{\text{max}} - P_{\text{idle}}) \times u$ | Exact linear interpolation verified: 45W + (220W - 45W) * 0.50 = 132.5W | **PASS** |
| **Energy Unit Conversion** | `test_observatory.py::test_energy_kwh_conversion_exact` | $E_{\text{kWh}} = (P_{\text{avg}} \times t) / 3{,}600{,}000$ Joules | Exact conversion: 1000W for 3600s = 1.0 kWh | **PASS** |
| **Emissions Estimation & Citation** | `test_observatory.py::test_co2_calculation_exact` | $\text{CO}_2 = E_{\text{kWh}} \times f_{\text{grid}}$ with CEA v19.0 citation (0.716 kg/kWh) | Exact multiplication: 1.0 kWh * 0.716 kg/kWh = 0.716 kg CO2 | **PASS** |
| **Input Range Validation** | `test_observatory.py::test_invalid_negative_power` to `test_invalid_negative_grid_factor` | Rejects negative power, negative grid factor, $P_{\text{max}} < P_{\text{idle}}$, $u \notin [0, 1]$ | Raises `ValueError` with descriptive validation messages | **PASS** |
| **Zero Baseline Division** | `test_observatory.py::test_percentage_change_zero_baseline_safe` | Safely handles 0 baseline without ZeroDivisionError | Returns `(0.0, 0.0%)` cleanly | **PASS** |
| **Baseline vs. Optimized** | `test_observatory.py::test_scenario_comparisons_calculated_from_inputs` | Computes delta and percentage change dynamically from inputs (no hardcoding) | Dynamic savings computed across all 3 services: Placement API, Search, Matcher | **PASS** |

---

### MODULE D: Privacy-Aware Digital Wellbeing

| Requirement | Test Method | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Domain Normalization** | `test_wellbeing.py::test_normalize_domain_clean` | Strips protocols, `www.`, ports, paths, query strings, credentials | `https://WWW.GitHub.com:443/torvalds/linux?q=1#readme` $\rightarrow$ `github.com` | **PASS** |
| **Rule-Based Categorization** | `test_wellbeing.py::test_categorize_domain_default_and_custom` | Categorizes domains with user-override precedence | Productive, neutral, and distracting classified with custom overrides | **PASS** |
| **Pause-Excluding Focus Timer** | `test_wellbeing.py::test_calculate_focus_duration_with_pauses` | Excludes paused intervals from total session duration: $T_{\text{eff}} = T_{\text{tot}} - \sum T_{\text{pause}}$ | Elapsed 1000s with 300s paused = 700.0s effective focus | **PASS** |
| **Context Switch Counting** | `test_wellbeing.py::test_calculate_context_switches` | Counts category transitions between consecutive events ($C_i \neq C_{i+1}$) | Transitions counted accurately across event sequence | **PASS** |
| **300s Dwell Cap Heuristic** | `test_wellbeing.py::test_calculate_dwell_and_distraction_capped` | Caps inter-event dwell time at 300s (5m) to avoid idle overcounting | Gaps exceeding 300s capped at 300.0s with documented explanation | **PASS** |
| **Data Sovereignty & Purge** | `test_wellbeing.py::test_wellbeing_data_purge` | Permanently deletes saved session records upon user command | SQLite records deleted; `list_aggregate_sessions()` returns empty list | **PASS** |
| **Minimal Data Principle** | `test_wellbeing.py::test_wellbeing_minimal_data_principle` | Table schema contains zero URL, query, or keystroke columns | Verified: `wellbeing_sessions` table contains only aggregate metrics | **PASS** |

---

### MODULE E: Responsible Examination Monitoring

| Requirement | Test Method | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Sliding Window Counting** | `test_exam.py::test_sliding_window_event_counting_triggers` | Triggers alert when $\ge 3$ head-turns occur within 30-second window | Triggers alert for clustered timestamps; ignores sparse timestamps | **PASS** |
| **2D Zone Geometry & IoU** | `test_exam.py::test_box_intersection_iou_overlap` | Cartesian intersection area and IoU calculation for overlapping boxes | Intersection area and IoU calculated accurately with margin tolerance | **PASS** |
| **Restricted Zone Intrusion** | `test_exam.py::test_zone_intrusion_rule` | Triggers intrusion flag when detected object enters restricted zone box | Evaluates penetration threshold $\ge 0.01$ and triggers intrusion flag | **PASS** |
| **Proctor Status Transitions** | `test_exam.py::test_incident_status_transition_with_proctor_notes` | Proctor can mark incident as in_review, dismissed, or resolved with notes | Status updated; reviewer evaluation notes persisted | **PASS** |
| **Immutable Audit Trail** | `test_exam.py::test_mandatory_proctor_audit_log_entry` | Every status transition automatically writes an immutable record to audit log | Audit log records actor, timestamp, previous status, new status, and note | **PASS** |
| **Non-Punitive Safeguard** | `test_exam.py::test_ethical_non_punitive_safeguard` | No automated penalties, disqualifications, or accusations in the schema | Verified: statuses strictly restricted to non-punitive review states | **PASS** |

---

### SYSTEM INTEGRATION

| Requirement | Test Method | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **API Health & Modules** | `test_integration.py::test_api_health_and_root_modules` | Health check returns healthy and root lists all 5 active modules | Health returns healthy; all 5 modules active in root manifest | **PASS** |
| **Seed Reproducibility** | `test_integration.py::test_database_seed_reproducibility` | Running `seed_database()` idempotently maintains baseline records | Tables populated with deterministic demonstration baseline data | **PASS** |
| **Activity Feed Privacy** | `test_integration.py::test_shared_activity_feed_consistency_and_privacy` | Connects cross-module events without leaking raw browsing URLs | All events use standard schema; zero URLs or private queries present | **PASS** |
| **Scope Partitioning** | `test_integration.py::test_transport_vs_compute_separation_contract` | Strictly isolates Scope 2 server energy from Scope 3 commuter savings | Clear separation with zero double-counting guarantee verified | **PASS** |
| **Purge Isolation** | `test_integration.py::test_data_sovereignty_purge_isolation` | Purging wellbeing data leaves exam, carpool, and academic data intact | Wellbeing table cleared; all other tables unchanged | **PASS** |

---

## 3. Exact Commands Run

### Command 1: Backend Automated Test Suite
```bash
cd backend
python -m pytest -v
```
**Output**:
```
============================= 62 passed in 2.44s ==============================
```

### Command 2: Frontend Production Build
```bash
cd frontend
npm run build
```
**Output**:
```
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 2065 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.14 kB │ gzip:   0.64 kB
dist/assets/index-VnTazjua.css   35.42 kB │ gzip:   6.97 kB
dist/assets/index-CdDVV27x.js   528.45 kB │ gzip: 132.30 kB
✓ built in 5.99s
```

### Command 3: Frontend Code Linter
```bash
cd frontend
npm run lint
```
**Output**:
```
Finished in 205ms on 47 files with 116 rules using 16 threads.
Found 0 errors.
```

---

## 4. Defects Found and Fixed During QA Pass

1. **Defect #1: Empty Task-List Behavior in Academic Hub**:
   - *Issue*: If a student had zero tasks, calculating progress percentage had the potential for zero division if not guarded.
   - *Fix*: Verified and codified `total_tasks > 0` condition returning `0.0%` cleanly; added automated test `test_empty_task_list_progress_behavior`.
2. **Defect #2: Unused React Component Imports**:
   - *Issue*: Production build failed under TypeScript strict mode (`noUnusedLocals: true`) due to unreferenced imports in `ControlledCameraFeed.tsx`, `IncidentReviewTable.tsx`, `ObservableRulesVisualizer.tsx`, and `BrowsingInspectorCard.tsx`.
   - *Fix*: Removed all unreferenced imports and verified zero TypeScript warnings.
3. **Defect #3: Hardcoded Executive Dashboard KPIs**:
   - *Issue*: `OverviewView.tsx` previously contained hardcoded static counters that contradicted live module telemetry.
   - *Fix*: Refactored `OverviewView.tsx` to asynchronously fetch live metrics from backend APIs and local storage (`academicApi.getPlacementProgress()`, `ridesApi.getDriverRides()`, `observatoryApi.getScenarios()`, `observatoryApi.getTransportComparison()`, `examApi.getIncidents()`).
4. **Defect #4: Missing Simulated Persona Disclosure**:
   - *Issue*: Role switching had no explicit label distinguishing it from secure enterprise authentication.
   - *Fix*: Added `DEMO ONLY` badge and explanatory subtext in `Sidebar.tsx` and `TopNavbar.tsx` clarifying that role-switching is a simulated evaluation workflow.

---

## 5. Known Limitations & Local Verification Instructions

1. **Hardware Camera Constraints in Sandbox**:
   - *Limitation*: Physical USB webcams cannot be directly initialized from headless automated CLI runners.
   - *Verification*: Open `http://localhost:5173`, navigate to **Exam Proctoring** &rarr; **Live Proctor Station**, and click **"Enable Local Webcam Feed"** to grant in-browser camera permission, or test with the built-in synthetic desk simulator.
2. **Synthetic Telemetry Transparency**:
   - *Limitation*: Application microservice telemetry (Placement API, Resource Search, Dijkstra Matcher) is generated using reproducible analytical profiles. Motherboard sensor probes (Intel RAPL/IPMI) are not used.
   - *Verification*: Disclosed explicitly in UI disclaimer banners.
3. **Local Startup Commands**:
   - Backend:
     ```bash
     cd backend
     python -m uvicorn main:app --reload --port 8000
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```
   - Navigate browser to: `http://localhost:5173`
   - API Docs: `http://localhost:8000/docs`
