# Contributing to UniVerse

Thank you for your interest in contributing to **UniVerse: An Intelligent, Sustainable, and Privacy-Aware Campus Ecosystem**! 

UniVerse is engineered as an academic and enterprise-grade campus operating platform. We welcome contributions from developers, researchers, and campus sustainability advocates. This document provides clear guidelines for setting up your development environment, adhering to code quality standards, and submitting pull requests.

---

## Table of Contents
1. [Guiding Architectural Principles](#1-guiding-architectural-principles)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Repository Structure](#3-repository-structure)
4. [Coding Standards & Conventions](#4-coding-standards--conventions)
   - [Backend (Python / FastAPI)](#backend-python--fastapi)
   - [Frontend (React 19 / TypeScript / Tailwind CSS)](#frontend-react-19--typescript--tailwind-css)
5. [Git Workflow & Commit Guidelines](#5-git-workflow--commit-guidelines)
6. [Testing & Quality Verification](#6-testing--quality-verification)
7. [Module-Specific Contribution Guidelines](#7-module-specific-contribution-guidelines)
8. [Pull Request (PR) Submission Checklist](#8-pull-request-pr-submission-checklist)
9. [Code of Conduct](#9-code-of-conduct)

---

## 1. Guiding Architectural Principles

All contributions to UniVerse must strictly preserve the following four architectural pillars:

1. **Privacy by Architecture (Zero Surveillance)**:
   - Module D (Digital Wellbeing) never collects, processes, or transmits raw URLs, search queries, or page contents to the server.
   - All domain normalization occurs client-side or on sanitized hostnames only.
   - Voluntary focus sessions and one-click database purge (`DELETE /api/wellbeing/purge`) must remain strictly functional.

2. **Non-Punitive Human-in-the-Loop AI**:
   - In Module E (Examination Monitoring), computer vision and geometric rules serve strictly as **preliminary indicators for human proctors**.
   - **Zero automated disqualifications or penalties** are permitted under any condition.
   - Every status transition must log an immutable audit record in `exam_audit_log`.

3. **Deterministic Mathematical & Algorithmic Foundations**:
   - Routing algorithms (Module B) must maintain deterministic behavior with min-heap priority queues (`heapq`).
   - Server power and carbon calculations (Module C) must adhere strictly to verified linear SPECpower models and authoritative grid factors (CEA Baseline Database v19.0).
   - Scope 2 server electricity and Scope 3 commuter vehicle emissions must remain partitioned with zero double-counting.

4. **Enterprise-Grade Clean UI (No Emojis)**:
   - All UI iconography must be rendered using vector SVGs from `lucide-react`.
   - Typography relies on Inter with tabular numeric alignments (`font-mono`) for metrics.
   - Color palettes follow accessible light enterprise ERP tokens with clear contrast ratios.

---

## 2. Development Environment Setup

### Prerequisites
- **Python**: Version `3.10` or newer (`python --version`)
- **Node.js**: Version `18.0` or newer (`node --version`, `npm --version`)
- **Git**: Installed and available in PATH

### Step-by-Step Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/UniVerse.git
   cd UniVerse
   ```

2. **Backend Setup**:
   ```powershell
   cd backend
   
   # Create and activate virtual environment
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1    # On Linux/macOS: source .venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Initialize and seed the SQLite database
   python database.py
   python seed.py
   
   # Launch FastAPI backend
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Verify backend health at `http://127.0.0.1:8000/api/health` and Swagger docs at `http://127.0.0.1:8000/docs`.

3. **Frontend Setup**:
   Open a separate terminal window:
   ```powershell
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start Vite dev server
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 3. Repository Structure

```text
UniVerse/
├── backend/
│   ├── routers/                # Sub-routers partitioned by functional module
│   │   ├── academic.py         # Module A: Placement & Mentorship API
│   │   ├── rides.py            # Module B: Carpool Route Matching API
│   │   ├── observatory.py      # Module C: Sustainable Computing Telemetry API
│   │   ├── wellbeing.py        # Module D: Digital Wellbeing Sessions API
│   │   ├── exam.py             # Module E: Proctoring Incidents & Audit Log API
│   │   └── activities.py       # Global Activity Ledger
│   ├── database.py             # SQLite DDL schema, table migrations, and helper connections
│   ├── energy_model.py         # SPECpower linear server energy & carbon conversion math
│   ├── exam_rules.py           # Temporal sliding-window & IoU bounding box geometric engines
│   ├── graph.py                # Campus road graph (12 nodes, 16 edges) & Dijkstra solver
│   ├── matcher.py              # Sequential 4-stop carpool detour and schedule optimizer
│   ├── models.py               # Pydantic schemas for request validation & response serialization
│   ├── seed.py                 # Idempotent database seeder with reproducible mock datasets
│   ├── test_*.py               # Pytest suite (62 unit & integration tests)
│   └── requirements.txt        # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable presentation widgets and layouts
│   │   ├── views/              # Full-page module views (Academic, Carpooling, Eco, Wellbeing, Exam)
│   │   ├── context/            # Shared demo persona context & role switcher
│   │   ├── api/                # Axios / fetch clients mapping to backend endpoints
│   │   └── types/              # TypeScript interface definitions matching backend Pydantic models
│   ├── package.json            # Frontend dependencies (React 19, Lucide, Tailwind, Vite)
│   └── vite.config.ts          # Vite build and proxy configuration
├── docs/                       # Complete architectural and technical documentation
└── README.md                   # Primary project readme
```

---

## 4. Coding Standards & Conventions

### Backend (Python / FastAPI)
- **Formatting & Style**: Follow PEP 8 guidelines. Keep line lengths under 100 characters where practical.
- **Type Annotations**: Always provide type hints for function signatures and API route parameters.
- **Data Validation**: Use Pydantic models (`models.py`) for all incoming request bodies and outgoing responses.
- **Database Access**: Ensure all database cursors are properly opened and closed via context managers or dedicated helper utilities. Parameterize all SQL queries to prevent injection vulnerabilities.
- **Async Endpoints**: Define route handlers as `async def` or standard `def` appropriately based on whether blocking I/O is invoked.

### Frontend (React 19 / TypeScript / Tailwind CSS)
- **Strict Typing**: No `any` types. Define strict TypeScript interfaces in `types/` for all backend communication.
- **Functional Components**: Use modern React 19 functional components with explicit hook dependencies (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Styling**: Use utility-first Tailwind CSS classes. Adhere to the established enterprise design system:
  - Neutral backgrounds (`bg-slate-50`, `bg-white`)
  - Crisp border accents (`border-slate-200`)
  - Subdued slate typography (`text-slate-900`, `text-slate-500`)
  - Accent colors for status: emerald for green/pass, amber for review/warning, rose for critical/alert.
- **Icons**: Use `lucide-react` icons exclusively. Do **not** use Unicode emojis in UI buttons, headings, or table cells.
- **Numerical Alignment**: Use `font-mono` on tabular numeric data, metrics, timestamps, and coordinates.

---

## 5. Git Workflow & Commit Guidelines

We enforce the **Conventional Commits** standard to maintain a clear, auditable git history.

### Commit Message Format
```text
<type>(<scope>): <short descriptive summary>

[optional detailed body explaining motivation and context]
```

### Allowed Types:
- `feat`: A new user-facing feature or API endpoint.
- `fix`: A bug fix in algorithms, routers, or UI components.
- `docs`: Documentation updates, additions, or markdown fixes.
- `test`: Adding or refactoring unit/integration tests.
- `refactor`: Code restructuring without modifying behavior or API contracts.
- `perf`: Performance optimizations (e.g., query tuning, memory footprint reduction).
- `chore`: Maintenance tasks, dependency updates, or configuration changes.

### Examples:
```text
feat(rides): add multi-criteria passenger sorting based on detour km and schedule
fix(energy_model): handle zero duration edge case in kWh calculation
docs(api): document query parameters for peer mentor search endpoint
test(exam): add unit tests for two-pointer sliding window boundary conditions
```

### Branch Naming Convention:
- `feature/<module>-<description>` (e.g., `feature/observatory-export-csv`)
- `fix/<module>-<description>` (e.g., `fix/wellbeing-pause-drift`)
- `docs/<description>` (e.g., `docs/add-developer-guide`)

---

## 6. Testing & Quality Verification

Before submitting any Pull Request, you **must** ensure all automated test suites pass cleanly.

### Running Backend Tests
Execute the complete 62-test Pytest suite:
```powershell
cd backend
python -m pytest -v
```
All tests must pass (`62 passed in X.XXs`). If you introduce a new feature or algorithm, you are required to add corresponding unit tests in `test_<module>.py`.

### Running Frontend Typecheck & Build
Validate TypeScript contracts and ensure production asset bundling succeeds:
```powershell
cd frontend
npm run build
```
The build must succeed with zero TypeScript or bundling errors.

---

## 7. Module-Specific Contribution Guidelines

- **Module A (Academic Hub)**:
  - Ensure dynamic preparation milestone calculations properly handle empty task lists without division by zero.
  - Mentorship requests must check for existing pending requests between the same student and mentor to prevent duplicates.

- **Module B (Ride-Pooling)**:
  - When modifying the campus graph in `graph.py`, ensure all new road segments are bidirectional unless specifically representing one-way campus gates.
  - Carpooling detour formulas must preserve non-negative delta constraints ($D_{\text{detour}} \ge 0$).

- **Module C (Computing Observatory)**:
  - Any new energy benchmark must cite an authoritative baseline emission factor or explicitly parameterize `grid_factor_kg_per_kwh`.
  - Maintain the strict separation of Scope 2 datacenter telemetry from Scope 3 vehicle emissions.

- **Module D (Digital Wellbeing)**:
  - Never add fields that log full URLs, query strings, or typed keystrokes.
  - Ensure dwell times honor the 300-second idle cap to avoid skewed concentration metrics.

- **Module E (Exam Monitoring)**:
  - Always route proctor status updates through `exam_audit_log`.
  - Never implement auto-flagging that directly alters exam results without human invigilator intervention.

---

## 8. Pull Request (PR) Submission Checklist

Before opening your Pull Request, verify:
- [ ] Code follows PEP 8 (Python) and strict TypeScript standards.
- [ ] Backend tests pass: `python -m pytest -v` (100% pass rate).
- [ ] Frontend build succeeds: `npm run build` (zero errors).
- [ ] No hardcoded absolute machine paths (`C:\Users\...` or `file:///...`) exist in documentation or code.
- [ ] No API keys, passwords, or personal credentials are committed.
- [ ] Commit messages follow the Conventional Commits specification.
- [ ] Relevant documentation in `docs/` has been updated to reflect changes.

---

## 9. Code of Conduct

UniVerse is committed to fostering a welcoming, collaborative, and harassment-free community. We ask all contributors to:
- Treat fellow contributors with respect, empathy, and professional courtesy.
- Provide constructive, clear, and actionable feedback during code reviews.
- Focus on what is best for the codebase, the student users, and the platform's core privacy and ethical values.
