# UniVerse: An Intelligent, Sustainable, and Privacy-Aware Campus Ecosystem

> **Compulsory Evaluation MVP & Engineering Platform**  
> A unified, privacy-conscious university operating system integrating placement intelligence, graph-optimized carpooling, datacenter carbon telemetry, self-sovereign digital wellbeing, and human-audited exam proctoring.

---

## 1. Problem Statement & Motivation
Modern higher education campuses manage fragmented digital solutions for student career preparedness, student transit, computational infrastructure, student mental wellbeing, and examination monitoring. These systems typically operate in isolation:
1. Academic readiness and peer mentoring are siloed in disconnected spreadsheets or ad-hoc forums.
2. Daily campus commuting relies on single-occupancy vehicles, increasing local congestion and commuter emissions without safe, verifiable carpooling.
3. Campus IT clusters run server workloads with zero visibility into computational energy draw or Scope 2 carbon footprint.
4. Digital wellbeing tools frequently enforce intrusive surveillance or transmit sensitive student browsing histories to remote third-party servers.
5. Examination proctoring software often relies on opaque, punitive black-box computer vision algorithms that trigger automated disqualifications, penalizing benign head movements or lighting anomalies.

**UniVerse** solves this by delivering an integrated, five-module platform with verifiable algorithmic foundations, deterministic mathematical formulas, strict data sovereignty guarantees, and mandatory human-in-the-loop ethical invigilation.

---

## 2. Objectives and Scope

### Key Objectives
- **Integrated Campus Operations**: Single-pane dashboard connecting student intelligence, carpooling, carbon accounting, digital health, and examination oversight.
- **Mathematical & Algorithmic Rigor**: Implemented Dijkstra shortest path routing, linear SPECpower server energy models, and temporal sliding-window frequency analysis with 100% unit test coverage.
- **Privacy by Architecture**: Client-side domain normalization, voluntary focus sessions, and absolute exclusion of raw URLs, search terms, and page contents from server-side feeds.
- **Responsible Human-in-the-Loop AI**: Automated vision cues treated as preliminary indicators for human invigilator review, backed by an immutable proctor audit trail with zero automated penalties.
- **Strict Scope Partitioning**: Separate accounting of Scope 2 server electricity emissions from Scope 3 vehicle commuting emissions with zero double-counting.

### Scope Boundaries
- **In-Scope**: Full-stack web application (React 19, FastAPI, SQLite), 62 unit and integration tests, campus road graph with 12 named landmarks, simulated SPECpower server telemetry, client-side synthetic browsing events, local web camera integration for exam monitoring, and role-based persona evaluation workflows.
- **Out-of-Scope (Evaluation Baseline)**: Heavy server-side deep learning inference clusters, production OAuth/SAML SSO federation (simulated via authenticated persona state), native mobile wrappers, and production payment gateways.

---

## 3. Technology Stack & Component Roles

| Layer | Technology | Version | Architectural Role |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 19.x | Declarative component UI and reactive state management |
| **Language (Client)** | TypeScript | 5.x | Strict type contracts matching backend Pydantic schemas |
| **Build Tool** | Vite | 8.x | High-performance bundling and Hot Module Replacement |
| **Styling & Design** | Tailwind CSS | 3.4.x | Light enterprise ERP design tokens, responsive typography |
| **Client Icons** | Lucide React | 1.x | Clean, consistent SVG iconography (zero UI emojis) |
| **Backend Framework** | FastAPI | 0.110+ | Asynchronous REST API, automatic OpenAPI validation |
| **Language (Server)** | Python | 3.10+ / 3.14 | Algorithmic routing, energy modeling, testbed rules |
| **Database** | SQLite3 | 3.x | Lightweight, zero-configuration local ACID persistence |
| **Web Server (ASGI)** | Uvicorn | 0.28+ | High-throughput async ASGI server |
| **Testing Harness** | Pytest + AnyIO | 9.x | Comprehensive unit and integration test suite |

---

## 4. Five-Module Feature Overview

### Module A: Student Intelligence and Academic Hub
- **Placement Readiness Milestone Tracking**: Categorized preparation checklists (DSA, System Design, CS Fundamentals, Aptitude, HR). Dynamically calculates readiness percentages with safe zero-task handling.
- **Peer Mentor Directory**: Searchable mentor profiles with verified ratings, skill tags, and booking workflows (request, accept, decline).
- **Academic Resource Repository**: Tagged lecture notes, past exam papers, and syllabus guides with subject/type filters and download tracking.

### Module B: Smart Campus Ride-Pooling
- **Campus Road Graph Engine**: 12 named landmarks, stable node IDs, and 16 bidirectional weighted road segments measured in kilometers.
- **Dijkstra Shortest Path Algorithm**: Min-heap priority queue implementation calculating optimal road distances and deterministic path reconstruction.
- **Sequential 4-Stop Insertion**: Computes composite routes ($D_{orig} \to P_{pickup} \to P_{drop} \to D_{dest}$) and evaluates driver detour limits.
- **Transport Carbon & Cost Savings**: Avoided vehicle-kilometer travel (VKT) savings evaluated at ₹8.50/km and 120 g CO₂/km.

### Module C: Sustainable Computing Observatory
- **SPECpower Linear Energy Model**: Calculates active power:
  $$\text{Power}_{\text{avg}} = P_{\text{idle}} + (P_{\text{max}} - P_{\text{idle}}) \times \text{utilization}$$
- **Energy & Carbon Conversion**: Calculates kilowatt-hours and Scope 2 emissions:
  $$\text{Energy}_{\text{kWh}} = \frac{\text{Power}_{\text{avg}} \times \text{duration}}{3,600,000}, \quad \text{CO}_{2\text{, kg}} = \text{Energy}_{\text{kWh}} \times \text{GridFactor}$$
- **Demonstrable Workloads**: Placement API, Resource Search, and Ride Matcher telemetry across Baseline and Optimized configurations.
- **Authoritative Emissions Factor**: Default grid factor of $0.716\text{ kg CO}_2/\text{kWh}$ cited from India Central Electricity Authority (CEA) Baseline Database v19.0 (2024).
- **Scope Partitioning**: Guarantees zero double-counting between Scope 2 datacenter energy and Scope 3 commuter tailpipe emissions.

### Module D: Privacy-Aware Digital Wellbeing
- **Voluntary Focus Timer**: Wall-clock epoch timestamp calculations excluding paused intervals ($T_{\text{effective}} = [T_{\text{stop}} - T_{\text{start}}] - \sum T_{\text{paused}}$). Resilient to browser tab background throttling.
- **Transparent Domain Categorization**: Normalizes URLs and applies user-editable rules (`productive`, `neutral`, `distracting`).
- **Context Switch & Dwell Calculation**: Detects transitions across category types; caps dwell time at 300 seconds to eliminate idle inflation.
- **Data Sovereignty & Purge**: Zero transmission of raw browsing history; full client JSON export and permanent one-click database deletion.

### Module E: Responsible Examination Monitoring
- **Non-Punitive Invigilation Safeguard**: Machine learning vision detections treated strictly as preliminary pointers for human review. Zero automated penalties or disqualifications.
- **Observable Geometric Testbed**:
  - *Rule 1*: Sliding-window temporal frequency analysis ($\ge 3$ head-turn events within 30 seconds).
  - *Rule 2*: 2D bounding box intersection and Intersection-over-Union (IoU) perimeter intrusion analysis.
- **Human Review Queue**: Proctor workflow (`pending_review` $\to$ `in_review` $\to$ `dismissed` / `resolved`) with required justification notes.
- **Immutable Proctor Audit Trail**: Every status change and reviewer note is logged to an immutable SQLite audit ledger (`exam_audit_log`).
- **Local Camera Station**: In-browser video stream for local verification with zero cloud video upload.

---

## 5. Prerequisites

Before setting up UniVerse, ensure you have the following installed on your machine:
- **Operating System**: Windows 10/11, macOS, or Linux.
- **Python**: Version `3.10` or newer (verified on Python 3.10 to 3.14). Verify with:
  ```powershell
  python --version
  ```
- **Node.js**: Version `18.0` or newer (LTS recommended). Verify with:
  ```powershell
  node --version
  npm --version
  ```
- **Git**: Installed and available in your environment path.

---

## 6. Windows PowerShell Setup & Startup Guide

### Step 1: Clone the Repository
Open Windows PowerShell:
```powershell
git clone https://github.com/laukik-26/UniVerse.git
cd UniVerse
```

### Step 2: Backend Setup & Initialization
From the root repository directory:
```powershell
cd backend

# Create a virtual environment (recommended)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install required Python dependencies
pip install -r requirements.txt

# Initialize the SQLite database and seed initial reproducible records
python database.py
python seed.py

# Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000`. You can inspect the interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

### Step 3: Frontend Setup & Startup
Open a **second** Windows PowerShell terminal:
```powershell
cd UniVerse\frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 7. Verification and Testing Commands

### Backend Automated Test Suite
Run the complete 62-test suite covering all 5 modules and integration boundaries:
```powershell
# From the backend/ folder (or root with backend on PYTHONPATH)
python -m pytest -v
```
Expected output:
```text
============================= 62 passed in 4.82s ==============================
```

### Frontend Typecheck & Production Build
Validate TypeScript contracts and bundle the frontend for production:
```powershell
cd frontend
npm run build
```
Expected output:
```text
✓ 2070 modules transformed.
dist/index.html                   1.14 kB
dist/assets/index-DJJy5Zs6.css   36.51 kB
dist/assets/index-Cw_8oztt.js   507.66 kB
✓ built in 3.14s
```

---

## 8. Implemented vs. Simulated vs. Future Work

| Component / Feature | Current Implementation Status | Technical Mechanism & Notes |
| :--- | :--- | :--- |
| **Dijkstra Shortest Path** | **Fully Implemented** | Python `heapq` min-heap priority queue over 12-node campus road graph |
| **Carpool Route Matching** | **Fully Implemented** | Sequential 4-stop insertion with detour constraints & ranking |
| **SPECpower Energy Modeling** | **Fully Implemented** | Validated mathematical formulas for average power, kWh, and CO₂ |
| **Focus Timer & Pause Rule** | **Fully Implemented** | Wall-clock epoch subtraction excluding paused intervals |
| **Data Sovereignty Purge** | **Fully Implemented** | Real SQL deletion across `wellbeing_sessions` and client state |
| **Sliding Window & IoU Rules** | **Fully Implemented** | Python geometric and temporal frequency evaluation functions |
| **Proctor Review & Audit Log** | **Fully Implemented** | Real status workflow backed by immutable `exam_audit_log` table |
| **Campus Microservice Telemetry** | **Simulated (Documented)** | Deterministic seeded workloads to allow reproducible benchmarks |
| **Digital Browsing Events** | **Simulated (Documented)** | Synthetic representative domain trace to preserve student privacy |
| **Exam Vision Ingestion** | **Simulated / Local Browser** | Synthetic benchmark cues + optional local HTML5 camera element |
| **User Authentication / SSO** | **Simulated Demo Personas** | Switcher tests 5 distinct roles without requiring live OAuth server |
| **Live Vehicle Telematics (GPS)** | **Future Proposed Work** | Native mobile GPS stream integration for real-time driver tracking |
| **Edge Hardware Power Meters** | **Future Proposed Work** | Integration with IPMI / RAPL hardware sensors on bare-metal servers |

---

## 9. Known Limitations
1. **In-Memory Graph State**: The campus road graph is defined as a static topology in code (`backend/graph.py`). Dynamic road closures or real-time traffic weighting are not yet supported.
2. **Demo Persona Simulation**: The role switcher modifies persona state in client memory and API headers for evaluation demonstration; it does not enforce cryptographic JWT auth boundaries.
3. **Synthetic Browsing Trace**: Browsing history evaluation runs against synthetic demonstration traces or voluntary uploads. Full browser integration requires an authorized browser extension.
4. **Local SQLite Concurrency**: SQLite is utilized for zero-configuration local deployment. Under multi-tenant enterprise loads, migration to PostgreSQL with connection pooling is recommended.

---

## 10. Technical Documentation Index
Full architectural, algorithmic, and operational documentation is available in the [`docs/`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/) folder:
- [`docs/SYSTEM_ARCHITECTURE.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/SYSTEM_ARCHITECTURE.md) — System architecture, component data flows, and Mermaid diagrams.
- [`docs/ALGORITHMS.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/ALGORITHMS.md) — Mathematical derivations, pseudocode, complexities, and test files for all implemented algorithms.
- [`docs/ALGORITHMIC_DECISIONS.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/ALGORITHMIC_DECISIONS.md) — Engineering trade-offs, alternative approaches considered, and student viva guide.
- [`docs/API_DOCUMENTATION.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/API_DOCUMENTATION.md) — Comprehensive OpenAPI route catalogue, request/response payloads, and error codes.
- [`docs/DATABASE_SCHEMA.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/DATABASE_SCHEMA.md) — SQLite table schemas, constraints, field types, and data retention policies.
- [`docs/TESTING_REPORT.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/TESTING_REPORT.md) — Pytest execution logs, frontend build verification, and coverage breakdown.
- [`docs/TEST_SCENARIOS.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/TEST_SCENARIOS.md) — 10 manual and automated evaluation test scenarios across all 5 modules.
- [`docs/PRIVACY_AND_RESPONSIBLE_AI.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/PRIVACY_AND_RESPONSIBLE_AI.md) — Ethical safeguards, non-punitive policies, and data minimization guarantees.
- [`docs/AI_USAGE.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/AI_USAGE.md) — Transparent disclosure of AI assistance, libraries, and licenses.
- [`docs/DEMO_SCRIPT.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/DEMO_SCRIPT.md) — Step-by-step 4–5 minute evaluation presentation walkthrough.
- [`docs/PRESENTATION_OUTLINE.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/PRESENTATION_OUTLINE.md) — Eight-slide presentation structure for academic review.
- [`docs/FINAL_SUBMISSION_CHECKLIST.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/FINAL_SUBMISSION_CHECKLIST.md) — Pre-evaluation verification checklist.
- [`docs/UI_POLISH_REPORT.md`](file:///c:/Users/lauki/OneDrive/Desktop/UniVerse/UniVerse/docs/UI_POLISH_REPORT.md) — Phase 9 UI consistency and decluttering audit.
