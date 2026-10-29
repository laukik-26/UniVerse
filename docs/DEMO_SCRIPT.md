# UniVerse — 4–5 Minute Evaluation Demonstration Script

This script provides an exact, step-by-step presentation walkthrough for evaluators, detailing the specific UI actions to perform, talking points, and explicit disclosures of simulated versus implemented functionality.

---

## Timing Breakdown

| Timestamp | Section | Key Feature Demonstrated |
| :--- | :--- | :--- |
| **0:00 – 0:45** | 1. Introduction & Executive Dashboard | Unified platform, light ERP UI, Scope 2 vs Scope 3 partitioning |
| **0:45 – 1:30** | 2. Student Intelligence (Module A) | Placement checklist math, reactive progress ring, peer mentor booking |
| **1:30 – 2:30** | 3. Smart Ride-Pooling (Module B) | Campus road graph, Dijkstra shortest path, detour-constrained matching |
| **2:30 – 3:15** | 4. Computing Observatory (Module C) | SPECpower server energy math, CEA grid factor, scenario comparison |
| **3:15 – 4:00** | 5. Digital Wellbeing (Module D) | Focus timer epoch math, non-surveillance rule, permanent data purge |
| **4:00 – 4:45** | 6. Exam Monitoring (Module E) | Non-punitive safeguard, 60/40 master-detail proctor queue, audit log |
| **4:45 – 5:00** | 7. Conclusion & Q&A | Summary of test coverage (62 tests), privacy by design, open for questions |

---

## Detailed Step-by-Step Script

### 1. Introduction & Executive Dashboard (0:00 – 0:45)
- **Action**: Open browser at `http://localhost:5173`. Point to the top 56px header and left 220px collapsible sidebar.
- **Talking Points**:
  > *"Good morning evaluators. This is **UniVerse**, an intelligent, sustainable, and privacy-aware campus ecosystem. Rather than disjointed apps, UniVerse unifies five critical campus capabilities into a clean enterprise ERP interface. Here on the executive dashboard, you see real-time cross-module metrics: student placement progress, active carpool routes, datacenter compute energy avoided, and proctor review queues. Notice our carbon disclosure banner: we strictly partition Scope 2 datacenter electricity from Scope 3 commuter vehicle emissions to prevent double-counting."*

---

### 2. Student Intelligence & Academic Hub (0:45 – 1:30)
- **Action**: Click **"Academic Hub"** in the sidebar. Stay on the **Placement Readiness** tab.
- **Demonstration**:
  1. Scroll to the task checklist. Click the checkbox next to `"Review System Design Core Concepts"` to mark it completed.
  2. Watch the top progress card and circular SVG ring dynamically update from $50\%$ to $63\%$.
  3. Click the **"Peer Mentor Directory"** tab.
  4. Locate `Sarah Lin` (Head Peer Mentor). Click **"Request Mentorship Session"**.
  5. Enter topic `"Graph Algorithms"` and submit. Show that the request appears in the review queue.
- **Talking Points**:
  > *"In Module A, readiness scores are evaluated dynamically from completed milestones—never hardcoded. Students can book peer mentorship sessions with senior peers, which immediately updates the shared activity feed."*

---

### 3. Smart Campus Ride-Pooling (1:30 – 2:30)
- **Action**: Click **"Ride-Pooling"** in the sidebar.
- **Demonstration**:
  1. Click the **"Campus Road Graph"** tab to display the 12 named landmarks and 16 connecting road segments.
  2. Switch to the **"Find a Ride"** tab.
  3. Select Pickup: `North Hostel Quad` (`node-hostel-north`); Drop-off: `Science & Advanced Research Labs` (`node-science-park`).
  4. Enter preferred time `08:35`, flexibility `15` mins, max detour `1.5` km. Click **"Search Compatible Carpools"**.
  5. Show the matching candidate: point out the sequential 4-stop route, the calculated driver detour of $0.8\text{ km}$, and the net saved distance of $1.0\text{ km}$.
  6. Click **"Confirm Carpool Booking"**.
- **Talking Points**:
  > *"Module B runs Dijkstra's algorithm over our campus graph. When a passenger searches for a ride, the engine evaluates a sequential 4-stop insertion sequence: Driver Origin to Pickup, Pickup to Drop, and Drop to Driver Destination. If the detour is within the driver's threshold, it calculates avoided vehicle kilometers and fuel cost savings in Indian Rupees."*

---

### 4. Sustainable Computing Observatory (2:30 – 3:15)
- **Action**: Click **"Eco Observatory"** in the sidebar.
- **Demonstration**:
  1. Point to the 4 KPI cards showing total energy in kWh and carbon avoided.
  2. Click the **"Scenario Comparisons"** tab to show the Baseline vs. Optimized telemetry comparison.
  3. Click **"Configurable Assumptions"** tab. Show the idle power ($45\text{ W}$), peak power ($220\text{ W}$), and grid emissions factor ($0.716\text{ kg CO}_2/\text{kWh}$).
  4. Select the `"Campus Solar Mix (0.430 kg/kWh)"` preset and click **"Apply Benchmarks"**.
- **Talking Points**:
  > *"In Module C, we avoid assuming servers draw full TDP. We implement the SPECpower linear model: $P_{\text{avg}} = P_{\text{idle}} + (P_{\text{max}} - P_{\text{idle}}) \times u$. Our default grid emission factor of 0.716 kg CO₂/kWh is cited directly from India's Central Electricity Authority 2024 database."*

---

### 5. Privacy-Aware Digital Wellbeing (3:15 – 4:00)
- **Action**: Click **"Digital Wellbeing"** in the sidebar.
- **Demonstration**:
  1. On the **Focus Timer** tab, click **"Start Focus Session"**.
  2. Let it run for 3 seconds, click **"Pause"**, wait 2 seconds, and click **"Resume"**.
  3. Point out that the pause duration is strictly excluded using wall-clock epoch timestamps ($T_{\text{effective}} = [T_{\text{stop}} - T_{\text{start}}] - T_{\text{paused}}$).
  4. Click the **"Data Sovereignty & Purge"** tab.
  5. Click **"Permanently Purge All Wellbeing Records"** and confirm.
- **Talking Points**:
  > *"Module D enforces strict privacy by architecture. We do not track raw URLs or keystrokes. Browsing events are categorized client-side into productive or distracting, dwell times are capped at 300 seconds to prevent idle overcounting, and students have complete sovereignty to permanently purge their database records in one click."*

---

### 6. Responsible Examination Monitoring (4:00 – 4:45)
- **Action**: Click **"Exam Proctoring"** in the sidebar.
- **Demonstration**:
  1. Point out the single-line ethical notice: *"Presumption of Integrity: Automated vision signals are preliminary behavioral pointers for human review. Zero automated penalties."*
  2. Look at the **Incident Review Queue**. Note the 60/40 master-detail layout.
  3. Click incident `inc-101` (`Desk 04 - Repeated Head-Turn Cues`).
  4. The right side detail panel instantly opens. Select status **"Dismissed (False Positive)"**, type note: *"Student looked toward supervisor for supplemental question paper"*, and click **"Save Determination"**.
  5. Show that the status updates to Dismissed, and the entry appears in the append-only **Audit Trail**.
- **Talking Points**:
  > *"In Module E, we uphold a strict ethical standard: no automated disqualifications or grade penalties. Detections are behavioral cues placed in a human proctor review queue. When the invigilator inspects the cue and dismisses it, an immutable audit log is generated for student contestation compliance."*

---

### 7. Explicit Technical Disclosure (4:45 – 5:00)
- **Talking Points**:
  > *"To conclude with complete academic honesty: our routing algorithms, energy formulas, pause math, and 62 automated tests are 100% fully implemented and verified in code. Microservice workloads and browsing traces use reproducible synthetic data to guarantee reproducible evaluations and protect student privacy. Thank you, and we welcome your questions."*
