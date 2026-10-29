# UniVerse — Project Implementation Plan & Architecture Specification

## 1. Executive Summary & Problem Scope

Modern academic institutions operate with fragmented legacy systems: students prepare for careers in siloes, commute inefficiently with single-occupancy vehicles, host computing workloads without sustainability observability, struggle with unmonitored digital focus, and encounter high-friction, punitive exam monitoring.

**UniVerse** unifies these disparate workflows into a single, cohesive, high-density SaaS ecosystem structured around 5 interconnected modules:
1. **Module A — Student Intelligence & Academic Hub**: Skills tracking, placement preparation readiness index, peer mentorship network, and academic resource repository.
2. **Module B — Smart Campus Ride-Pooling**: Directed campus location graph, route compatibility matching, seat availability, maximum detour constraints, and commute carbon offset analytics.
3. **Module C — Sustainable Computing Observatory**: Live telemetry simulation for 3 campus microservices, hardware energy estimation (Joules & kWh), grid carbon intensity modeling, and baseline vs. eco-optimized workload comparisons.
4. **Module D — Privacy-Aware Digital Wellbeing**: Voluntary, client-side focus sessions, local heuristic event categorization, distraction metrics, and transparent user controls (Pause, Inspect, Delete).
5. **Module E — Responsible Examination Monitoring**: Computer vision proctoring simulation, observable event detection (head turns, unauthorized zone intrusions), timestamped confidence logging, and a proctor review queue with strict non-punitive safeguards.

---

## 2. Integrated Architecture & Data Flow

```
                                      +---------------------------------------------+
                                      |          UniVerse Web Application           |
                                      |     (React 19 + TypeScript + Tailwind)     |
                                      +----------------------+----------------------+
                                                             |
                     +---------------------------------------+---------------------------------------+
                     |                                       |                                       |
           +---------v---------+                   +---------v---------+                   +---------v---------+
           |   Executive Shell |                   | Shared Activity & |                   | Role & Persona    |
           |   Sidebar & Topbar|                   | Notifications Hub |                   | Switcher (Student/|
           +---------+---------+                   +---------+---------+                   | Admin / Proctor)  |
                     |                                       |                             +-------------------+
    +----------------+---------------------------------------+---------------------------------------+
    |                |                       |                               |                       |
+---v----+      +----v---+              +----v----+                     +----v----+             +----v----+
| Mod A: |      | Mod B: |              | Mod C:  |                     | Mod D:  |             | Mod E:  |
|Academic|      |Ride    |              |Compute  |                     |Digital  |             |Exam     |
| Hub    |      |Pooling |              |Observ.  |                     |Wellbeing|             |Integrity|
+---+----+      +----+---+              +----+----+                     +----+----+             +----+----+
    |                |                       |                               |                       |
    +----------------+-----------------------+-------------------------------+-----------------------+
                                             |
                                  +----------v----------+
                                  |   FastAPI Backend   |
                                  | (REST APIs & SQLite)|
                                  +----------+----------+
                                             |
             +--------------------+----------+----------+--------------------+
             |                    |                     |                    |
       +-----v-----+        +-----v-----+         +-----v-----+        +-----v-----+
       | Academic  |        | Campus    |         | Telemetry |         | Exam Review|
       | & Mentor  |        | Route     |         | & Energy  |         | Log & Flag |
       | DB Store  |        | Graph     |         | Simulator |         | Repository |
       +-----------+        +-----------+         +-----------+         +-----------+
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Foundation, Design System & Navigation Shell *(Current Phase)*
- [x] Establish design tokens, typography, and ERP-inspired layout rules (`DESIGN.md`).
- [x] Initialize frontend project (React + TypeScript + Tailwind CSS + Lucide Icons).
- [x] Build persistent enterprise layout shell:
  - Collapsible left sidebar with 5 module navigation links + system status.
  - Top header with context greetings, term selector, quick filter/export triggers, notification drawer, and role switcher.
  - Executive Overview dashboard with unified cross-module KPI cards and summary visualizers.
- [x] Provide runnable starter instructions and preview capabilities.

### Phase 2: Module A — Student Intelligence & Academic Hub
- **Core Entities:** `StudentProfile`, `SkillSet`, `PlacementMilestone`, `PeerMentor`, `AcademicResource`.
- **Key Features:**
  - Placement Readiness Index calculation (formula weighting CGPA, completed skill assessments, and mock interviews).
  - Searchable, tag-filtered Academic Resource Repository (lecture notes, exam papers, lab guides with download counters).
  - Peer Mentor Discovery directory with filterable specializations, availability slots, and structured request modal.
- **Verification:** Unit tests for readiness scoring algorithm and resource query filters.

### Phase 3: Module B — Smart Campus Ride-Pooling
- **Core Entities:** `CampusNode`, `RouteEdge`, `RideOffer`, `RideRequest`, `CarpoolMatch`.
- **Key Algorithms:**
  - Campus network graph representation with adjacency matrix and edge distance/time weights.
  - Route Compatibility & Detour Algorithm: Greedy / Dijkstra path calculation verifying driver deviation does not exceed a parameterized threshold (e.g., maximum 15% or 1.5 km detour).
  - Travel Cost & Carbon Offset Estimator: Calculates vehicle-kilometers saved and translates into grams of avoided CO2.
- **Verification:** Test scenarios with 4 simultaneous rider requests against 2 driver routes showing optimal matching and detour rejection.

### Phase 4: Module C — Sustainable Computing Observatory
- **Core Entities:** `CampusService` (Auth API, LMS Portal, Media Server), `TelemetrySnapshot`, `EnergyLog`.
- **Key Algorithms:**
  - Synthetic workload generator simulating dynamic request rates, CPU utilization, and memory pressure.
  - Energy & Carbon Estimator: Uses SPECpower / server TDP models:
    $$\text{Power (Watts)} = P_{\text{idle}} + (P_{\text{peak}} - P_{\text{idle}}) \times U_{\text{cpu}}$$
    $$\text{CO}_2e = \text{Energy (kWh)} \times \text{Regional Grid Carbon Intensity (gCO}_2/\text{kWh)}$$
  - Scenario Comparison: Side-by-side interactive switch showing "Baseline Provisioning" vs "Eco-Scaled Workload Optimization".
- **Verification:** Validate formula accuracy with boundary inputs (0% load, 100% load) and check responsive charts.

### Phase 5: Module D — Privacy-Aware Digital Wellbeing
- **Core Entities:** `FocusSession`, `BrowsingCategoryRule`, `FocusMetricRecord`.
- **Key Safeguards & Features:**
  - Voluntary, user-controlled focus timer (Start, Pause, Resume, Stop).
  - Privacy-Preserving Heuristic Categorizer: Rules-based local classification of domains (e.g., educational, research, social media, entertainment) without recording full URLs, document contents, or keystrokes.
  - Digital Sovereignty Controls: Explicit "Inspect Raw Stored Data" viewer and "Purge Session History" button.
- **Verification:** Verify that deleting local records immediately updates all metrics and that no plaintext URL paths persist.

### Phase 6: Module E — Responsible Examination Monitoring
- **Core Entities:** `ExamSession`, `CVEventLog`, `ProctorReviewIncident`.
- **Key Safeguards & Algorithms:**
  - Controlled sample footage / simulated proctor stream with computer vision event triggers:
    1. Repeated lateral head turns (pose deviation).
    2. Unauthorized secondary person or object in restricted boundary.
  - Timestamped confidence logging with bounding box visualizer.
  - **Ethical Human Review Queue:** Interface that presents flagged snippets to human proctors with actions: `Confirm Review`, `Dismiss as False Positive`, or `Request Clarification`. System explicitly disallows automatic academic penalties.
- **Verification:** Verify that all incidents require human proctor sign-off and contain an audit trail of decisions.

### Phase 7: Cross-Module Integration, Testing & Submission Polish
- Integrate unified telemetry drawer and global search.
- Package demonstration test scenarios with quick-fill sample buttons.
- Finalize documentation: `README.md`, setup instructions, architecture schematics, and presentation script.
