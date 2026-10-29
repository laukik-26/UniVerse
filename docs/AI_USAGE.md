# UniVerse — AI Usage & Attribution Disclosure

In compliance with academic evaluation standards and institutional policies regarding AI transparency, this document transparently records the use of artificial intelligence tools, third-party libraries, and dataset sources during the design, implementation, and verification of UniVerse.

---

## 1. Statement of AI Assistance

This project was developed with the assistance of **Antigravity (Google DeepMind)**, an agentic AI pair programming environment. In accordance with honest academic reporting guidelines, we disclose that AI was utilized as an assistive engineering accelerator rather than a replacement for algorithmic design or technical comprehension.

### Specific Tasks Assisted by AI
1. **Scaffolding and Type Boilerplate**:
   - Generating TypeScript interfaces matching backend Python Pydantic models.
   - Structuring FastAPI router definitions and CORS middleware boilerplate.
2. **Algorithmic Implementation & Refactoring**:
   - Implementing Dijkstra's algorithm with Python's `heapq` module based on established computer science formulations.
   - Refactoring the sequential 4-stop carpool route insertion algorithm.
   - Deriving mathematical test cases for the SPECpower linear power equation ($P_{\text{avg}} = P_{\text{idle}} + (P_{\text{max}} - P_{\text{idle}}) \times u$).
3. **Automated Test Suite Creation**:
   - Drafting initial pytest fixtures and parameter sets across all 5 modules (resulting in 62 automated unit and integration tests).
4. **UI Decluttering & Architectural Standardization (Phase 9)**:
   - Extracting reusable React primitives (`PageHeader`, `StatCard`, `DetailPanel`, `Button`, `StatusBadge`).
   - Removing template badges (`MVP`, `Mod A–E`, `Module X Active`) and decorative icon containers to adhere to enterprise ERP design guidelines.
5. **Documentation Generation**:
   - Compiling technical documentation, OpenAPI specifications, and architecture diagrams cross-checked against the codebase.

---

## 2. Third-Party Libraries & Verified Licenses

All external open-source packages utilized in UniVerse are free and open-source under permissive licenses:

### 2.1 Backend Dependencies (`backend/requirements.txt`)
| Library | Verified Version | License | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **FastAPI** | `0.110.0+` | MIT | High-performance asynchronous REST API framework |
| **Uvicorn** | `0.28.0+` | BSD-3-Clause | Asynchronous ASGI web server implementation |
| **Pydantic** | `2.6.0+` | MIT | Runtime data validation and schema enforcement |
| **Pytest** | `9.1.1` | MIT | Automated unit and integration testing framework |
| **AnyIO** | `4.13.0` | MIT | Asynchronous concurrency abstraction layer |

### 2.2 Frontend Dependencies (`frontend/package.json`)
| Library | Verified Version | License | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **React** | `19.0.0` | MIT | Declarative component UI library |
| **React-DOM** | `19.0.0` | MIT | DOM rendering layer for React |
| **Vite** | `8.3.5` | MIT | Next-generation frontend build tooling and HMR |
| **TypeScript** | `5.8.0` | Apache-2.0 | Static type safety and contract verification |
| **Tailwind CSS** | `3.4.1` | MIT | Utility-first CSS framework for enterprise design |
| **Lucide React** | `1.16.0` | ISC | Open-source SVG icons (zero UI emojis) |

---

## 3. Pretrained Models & Computer Vision Disclosure

- **Pretrained Weights**: UniVerse does **not** download or execute proprietary, closed-source machine learning weights.
- **Computer Vision Testbed**: The examination monitoring engine (`backend/exam_rules.py`) uses **deterministic geometric and temporal frequency algorithms** (2D bounding box Cartesian IoU and sliding-window event counting).
- **Webcam Interface**: The live proctor station uses standard HTML5 `MediaDevices.getUserMedia()` to render an in-browser local video stream. No cloud inference models are called, ensuring zero external vendor costs and complete offline capability.

---

## 4. Dataset Sources & Authoritative Citations

1. **Campus Road Topology**:
   - Synthetic campus map consisting of 12 named landmarks and 16 connecting road segments modeled specifically for campus demonstration.
2. **Central Electricity Authority (CEA) Grid Emissions Factor**:
   - **Source**: *CO₂ Baseline Database for the Indian Power Sector*, Version 19.0 (Published by Central Electricity Authority, Ministry of Power, Government of India, December 2024).
   - **Value Used**: Weighted average grid emission factor $= 0.716\text{ kg CO}_2/\text{kWh}$.
3. **SPECpower_ssj2008 Server Power Benchmarks**:
   - **Source**: Standard Industry SPECpower energy benchmark for modern 2U dual-socket enterprise rack servers.
   - **Values Used**: Base idle draw $= 45.0\text{ W}$, Peak workload draw at 100% utilization $= 220.0\text{ W}$.
4. **Commuter Vehicle Emission & Operating Cost Factor**:
   - **Emission Source**: EPA / UK DEFRA passenger car standard ($120.0\text{ g CO}_2/\text{km}$).
   - **Cost Source**: Standardized Indian urban private transit reimbursement rate ($\text{₹}8.50/\text{km}$ for fuel and wear).
