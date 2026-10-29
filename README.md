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
   - Telemetry simulation across campus microservices (LMS, Auth, Media).
   - Energy consumption (Joules/kWh) and grid carbon intensity calculations.
   - Baseline vs. eco-optimized load comparison.

4. **Module D: Privacy-Aware Digital Wellbeing**
   - Voluntary, client-side focus session timer.
   - Local heuristic domain classification without URL/content capture.
   - Full data sovereignty controls: Pause, Inspect Stored Data, and Purge.

5. **Module E: Responsible Examination Monitoring**
   - Controlled video stream event detection (head pose yaw/pitch, zone intrusion).
   - Timestamped confidence logging.
   - Dedicated human proctor review queue with strict non-punitive safeguards (no automated disqualifications).

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
