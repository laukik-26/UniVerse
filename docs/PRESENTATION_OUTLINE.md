# UniVerse — Eight-Slide Evaluation Presentation Outline

This outline structures the formal project presentation for faculty evaluators and academic examination committees.

---

## Slide 1: Title & Problem Statement
- **Title**: UniVerse: An Intelligent, Sustainable, and Privacy-Aware Campus Ecosystem
- **Subtitle**: A Unified Operating Platform for Higher Education Operations
- **Presenter**: Project Team
- **Core Problems Addressed**:
  - Siloed student academic preparedness and mentorship tracking.
  - Inefficient single-occupancy campus commuting causing congestion and avoidable Scope 3 carbon emissions.
  - Lack of visibility into campus IT infrastructure electricity draw and Scope 2 carbon footprint.
  - Intrusive student surveillance in commercial digital wellbeing tools.
  - Opaque, punitive "black-box" examination proctoring algorithms that issue automated disqualifications for benign physical movements.

---

## Slide 2: Objectives & System Scope
- **Project Objectives**:
  - Deliver an integrated 5-module platform within a unified, light enterprise ERP interface.
  - Implement mathematically verified algorithms (Dijkstra routing, SPECpower server energy modeling, sliding-window temporal analysis).
  - Enforce privacy-by-architecture: zero raw URL tracking, client-side data sovereignty, and voluntary focus timers.
  - Enforce responsible, non-punitive AI: mandatory human-in-the-loop invigilation with append-only audit trails.
- **Scope Boundaries**:
  - *Implemented*: Full-stack React 19 + FastAPI + SQLite platform, 62 unit/integration tests, 12-landmark campus road graph, deterministic mathematical calculators.
  - *Simulated*: Seeded reproducible microservice workloads and synthetic domain browsing traces.

---

## Slide 3: System Architecture & Technology Stack
- **Architecture**: Multi-tier decoupled SPA + async REST API + embedded ACID persistence.
- **Frontend Stack**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React icons.
- **Backend Stack**: FastAPI, Python 3.10+, SQLite3, Uvicorn ASGI server.
- **Design Philosophy**:
  - 56px sticky enterprise header with view title and role avatar.
  - Full-width responsive layout with 220px collapsible sidebar.
  - Reusable design tokens: 1px neutral borders, tabular numerals, semantic status dots.
  - Cross-module event-sinking notification architecture.

---

## Slide 4: Module A — Student Intelligence & Academic Hub
- **Dynamic Placement Readiness Checklist**:
  - Categorized checklist milestones (DSA, Development, CS Fundamentals, Aptitude, HR).
  - Dynamic score calculation: $P = (N_{\text{completed}} / N_{\text{total}}) \times 100\%$, with safe zero-task handling.
- **Peer Mentor Directory**:
  - Senior peer mentor discovery with ratings, skills, and availability tags.
  - Structured request workflow (`pending` $\to$ `accepted` / `declined`) with duplicate prevention.
- **Academic Syllabus Repository**:
  - Tagged lecture notes, question papers, and study guides with download tracking.

---

## Slide 5: Module B — Smart Campus Ride-Pooling & Dijkstra Routing
- **Campus Road Graph Engine**:
  - 12 named landmarks and 16 bidirectional road segments weighted in kilometers.
- **Dijkstra Shortest Path Implementation**:
  - Min-heap priority queue ($\mathcal{O}((V + E) \log V)$) with deterministic path reconstruction.
- **Sequential 4-Stop Insertion**:
  - Evaluates $D_{\text{orig}} \to P_{\text{pickup}} \to P_{\text{drop}} \to D_{\text{dest}}$ composite trip.
  - Calculates driver detour $\Delta D$ and rejects rides exceeding threshold with explicit diagnostic codes.
- **Commuter Savings Calculations**:
  - Avoided Vehicle Kilometers Traveled (VKT) translated to fuel savings ($\text{₹}8.50/\text{km}$) and avoided tailpipe emissions ($120\text{ g CO}_2/\text{km}$).

---

## Slide 6: Modules C & D — Sustainability & Privacy-Aware Wellbeing
- **Sustainable Computing Observatory (Module C)**:
  - Linear SPECpower power model: $P_{\text{avg}} = P_{\text{idle}} + (P_{\text{max}} - P_{\text{idle}}) \times u$.
  - Energy conversion: $E_{\text{kWh}} = (P_{\text{avg}} \times t) / 3,600,000$.
  - Scope 2 grid emissions factor: $0.716\text{ kg CO}_2/\text{kWh}$ (cited from India Central Electricity Authority 2024 database).
  - Strict Scope Partitioning: Clear separation of Scope 2 datacenter energy from Scope 3 vehicle commuting with zero double-counting.
- **Privacy-Aware Digital Wellbeing (Module D)**:
  - Focus session timer with drift-free wall-clock epoch math ($T_{\text{effective}} = [T_{\text{stop}} - T_{\text{start}}] - T_{\text{paused}}$).
  - Context switch detection and 300-second capped dwell time to eliminate idle inflation.
  - Absolute data sovereignty: zero raw URL tracking and one-click permanent SQLite purge.

---

## Slide 7: Module E — Responsible Examination Monitoring & Verification
- **Strict Ethical Architecture (Non-Punitive Policy)**:
  - Detections are behavioral cues for proctor review, not proof of dishonesty.
  - Zero automated disqualifications or grade penalties.
- **Observable Geometric & Temporal Rules**:
  - *Rule 1*: Temporal sliding window ($\ge 3$ head-turn events within 30 seconds).
  - *Rule 2*: 2D bounding box intersection and Intersection-over-Union (IoU) perimeter testing.
- **60/40 Master-Detail Invigilation Queue**:
  - Instant side-panel review of evidence context without disruptive full-screen modals.
- **Immutable Proctor Audit Trail**:
  - Mandatory justification notes recorded in append-only SQLite audit ledger.
- **Test Verification Suite**:
  - 62 automated unit and integration tests passing in 4.82s (100% pass rate).

---

## Slide 8: Results, Limitations, Future Scope & AI Disclosure
- **Key Project Outcomes**:
  - Fully integrated, responsive campus operating system delivered with light ERP styling.
  - Zero high-severity defects; clean production build in 3.14s.
- **Known Limitations**:
  - Static campus graph distances; simulated telemetry workloads and browsing traces.
- **Future Roadmap**:
  - Real-time mobile GPS tracking for campus shuttles.
  - Integration with bare-metal server IPMI / RAPL hardware energy sensors.
  - PostgreSQL deployment with connection pooling for enterprise multi-tenancy.
- **AI Attribution & Disclosure**:
  - Development assisted by Antigravity (Google DeepMind) for type contracts, testing fixtures, and UI decluttering.
  - All algorithms, mathematical formulas, and business rules verified and cross-checked against source code.
