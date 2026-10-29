# UniVerse: An Intelligent, Sustainable, and Privacy-Aware Campus Ecosystem

UniVerse is an integrated university SaaS platform that combines student placement readiness, peer mentorship, campus ride-pooling, sustainable computing observability, privacy-preserving digital wellbeing, and responsible computer-vision exam monitoring into a unified enterprise interface.

---

## 1. Project Overview & Five Integrated Modules

UniVerse brings together 5 core campus capabilities into one shared interface:

1. **Module A: Student Intelligence & Academic Hub**
   - Placement readiness tracking and skill scoring.
   - Peer mentor directory and mentorship request scheduling.
   - Tagged academic resource repository (notes, past papers, guides).

2. **Module B: Smart Campus Ride-Pooling**
   - Directed graph representation of campus routes and hostels.
   - Compatibility matching with strict maximum detour thresholds.
   - Travel cost and avoided vehicle-kilometer carbon calculations.

3. **Module C: Sustainable Computing Observatory**
   - Telemetry simulation across 3 core campus microservices (Placement API, Resource Search, Ride Matcher).
   - Linear SPECpower server energy model: `P_avg = P_idle + (P_max - P_idle) * u`.
   - Energy conversion: `E_kWh = P_avg * t / 3,600,000`.
   - Carbon emissions estimation with verified grid factors: `CO2 = E_kWh * f_grid` (default 0.716 kg/kWh, cited from CEA CO2 Baseline Database for Indian Power Sector v19.0, 2024).
   - Baseline vs. optimized scenario differential calculations (dynamic percentage reductions, safe zero-baseline division).
   - Strict operational boundary partitioning between Scope 2 datacenter compute emissions and Scope 3 commuter transport emissions with zero double-counting guarantee.
   - Interactive what-if workload sandbox with configurable idle/peak power, observation windows, and grid presets.

4. **Module D: Privacy-Aware Digital Wellbeing**
   - Voluntary, student-controlled focus session timer with accurate wall-clock epoch persistence (drift-free across tab suspensions).
   - Strict mathematical pause exclusion rule: `T_effective = (T_now - T_start) - Σ T_paused`.
   - Client-side domain normalization and rule-based categorization (`Productive`, `Neutral`, `Distracting`) with user override support.
   - Context switches calculated as consecutive category transitions.
   - Dwell time estimation with a documented 300-second (5-minute) cap per transition to prevent idle overcounting.
   - Zero-surveillance data minimization: no raw URLs, search queries, keystrokes, or page contents collected.
   - Full data sovereignty: raw JSON payload inspection and real permanent SQLite/client data purge.

5. **Module E: Responsible Examination Monitoring**
   - Strict non-punitive ethical architecture: automated cues are behavioral signals for certified proctor review, NOT proof of academic dishonesty.
   - Predefined observable event rules tested independently of CV hardware:
     - Rule 1: Sliding-window temporal frequency clustering (e.g. ≥3 head-turn cues in 30s).
     - Rule 2: 2D Cartesian bounding box intersection & IoU zone intrusion testing.
   - Certified proctor review queue with status workflows: `Pending Review` → `In Review` → `Dismissed (False Positive)` or `Resolved`.
   - Mandatory proctor audit log: every status transition and evaluation note is written to an immutable audit trail (`exam_audit_log`).
   - Controlled local camera station with zero cloud video storage (in-browser volatile frame processing).

---

## 2. Technology Stack

- **Frontend**:
  - React 19 + TypeScript + Vite
  - Tailwind CSS (high-density enterprise styling)
  - Lucide React (clean SVG enterprise iconography)
- **Backend**:
  - FastAPI (Python 3.10+)
  - SQLite (zero-configuration local persistence)
  - Uvicorn (ASGI web server)

---

## 3. Directory Structure

```
UniVerse/
├── DESIGN.md                 # UI design tokens, color palette, layout rules
├── PROJECT_PLAN.md           # 7-phase implementation plan and evaluation milestones
├── README.md                 # Project documentation and startup guide
├── frontend/                 # React + TypeScript + Vite + Tailwind application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Shared UI (NotificationDrawer, Badges)
│   │   │   ├── dashboard/    # Executive Overview (KPI Cards, SVG Charts, Tables)
│   │   │   ├── layout/       # Enterprise Sidebar, Top Navigation Bar
│   │   │   └── modules/      # Module foundation views and blueprints
│   │   ├── types/            # Navigation, persona roles, telemetry schemas
│   │   ├── App.tsx           # Main application shell with module routing
│   │   ├── index.css         # Tailwind CSS directives
│   │   └── main.tsx          # Application entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── backend/                  # FastAPI backend server
    ├── main.py               # REST API entry point
    └── requirements.txt      # Python dependencies
```

---

## 4. How to Run & Preview the Application

### Frontend (User Interface)

1. Open a terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Backend (API Server)

1. Open a second terminal in the `backend` folder:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
2. View the interactive API documentation at:
   ```
   http://localhost:8000/docs
   ```

### Running Test Suites

1. Backend Unit Tests (Modules A, B, C, D, and E):
   ```bash
   cd backend
   python -m pytest -v
   ```
   Runs 56 comprehensive tests covering:
   - Module A: Dynamic task progress, mentor matching, deduplication.
   - Module B: Dijkstra shortest-path, non-negative weights, detour ranking, carpool match persistence.
   - Module C: Linear SPECpower modeling, kWh conversion, CEA grid factor citation, Scope 2 vs Scope 3 separation.
   - Module D: Domain normalization, custom classification rules, pause-excluding focus timers, context-switch computation, 300s capped dwell math, and permanent data purge.
   - Module E: Sliding-window event counting rules, 2D Cartesian bounding box IoU zone intrusion, proctor review transitions, immutable audit logs, and non-punitive safeguards.

2. Frontend Build Verification:
   ```bash
   cd frontend
   npm run build
   ```
   Validates strict TypeScript types, component interfaces, and generates production bundles.
