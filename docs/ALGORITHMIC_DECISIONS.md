# UniVerse — Algorithmic Decisions & Viva Guide

This document explains the rationale behind each algorithmic choice in UniVerse, comparisons against rejected alternatives, mathematical assumptions, and clear conversational explanations for academic viva evaluations.

---

## 1. Dijkstra Shortest-Path vs. Alternatives

### Why Dijkstra?
- **Graph Topology**: The campus road network is modeled as a non-negative, weighted graph with $V = 12$ landmarks and $E = 16$ bidirectional road segments.
- **Optimality**: Dijkstra guarantees the exact global shortest path without heuristic approximations.
- **Efficiency**: With a binary min-heap priority queue, complexity is $\mathcal{O}((V + E) \log V)$, executing in $< 0.1\text{ ms}$ on modern hardware.

### Alternatives Considered & Rejected
| Alternative Algorithm | Reasons for Rejection |
| :--- | :--- |
| **A* Search** | A* requires an admissible Euclidean distance heuristic $h(n)$. For a small 12-node campus network, calculating Euclidean coordinates introduces coordinate overhead with zero measurable speed gain over Dijkstra. |
| **Bellman-Ford** | Runs in $\mathcal{O}(V \cdot E)$. Designed to handle negative edge weights, which do not exist in physical road networks. |
| **Floyd-Warshall** | Precomputes all-pairs shortest paths in $\mathcal{O}(V^3)$ and $\mathcal{O}(V^2)$ memory. Unnecessary when rides are computed dynamically based on driver departure and origin. |

### Viva Explanation (For Students)
> *"Professor, we selected Dijkstra's algorithm because physical campus road segments have strictly positive distance weights. Using Python's standard `heapq` priority queue, we get guaranteed optimal shortest paths in $\mathcal{O}((V + E) \log V)$ time. We considered A*, but since our campus graph has 12 named landmarks, Dijkstra runs in under a tenth of a millisecond without needing Euclidean coordinate approximations."*

---

## 2. Sequential 4-Stop Insertion for Ride-Pooling

### Why Sequential Insertion?
- **Workflow**: In campus carpooling, a driver is traveling from their origin $D_{\text{orig}}$ to their destination $D_{\text{dest}}$. A passenger wants to be picked up at $P_{\text{pickup}}$ and dropped at $P_{\text{drop}}$.
- **Logical Sequence**: The passenger cannot be dropped before being picked up. The natural order is $D_{\text{orig}} \to P_{\text{pickup}} \to P_{\text{drop}} \to D_{\text{dest}}$.
- **Subpath Reusability**: Each subpath is evaluated independently using our Dijkstra engine:
  $$D_{\text{composite}} = \text{dist}(D_{\text{orig}}, P_{\text{pickup}}) + \text{dist}(P_{\text{pickup}}, P_{\text{drop}}) + \text{dist}(P_{\text{drop}}, D_{\text{dest}})$$
- **Detour Boundary**: Driver detour is $\Delta D = D_{\text{composite}} - D_{\text{driver\_direct}}$. If $\Delta D \le \text{MaxDetour}$, the match is compatible.

### Alternatives Considered & Rejected
| Alternative Approach | Reasons for Rejection |
| :--- | :--- |
| **Full Permutation Search (TSP)** | For 1 driver and 1 passenger (4 points), $4! = 24$ permutations exist. However, $D_{\text{orig}}$ must always be first, and $D_{\text{dest}}$ must be last, reducing possibilities to 2. Checking pickup before drop eliminates all ambiguity, making TSP overkill. |
| **Euclidean Radius Buffering** | Matches rides if pickup is within radius $R$ of the driver's direct road line. Fails on campus because two points 100 meters apart in direct line may be separated by a canal or building requiring a 2-kilometer detour. |

### Viva Explanation
> *"We evaluate sequential 4-stop insertion because passenger pickup must always precede drop-off. By decomposing the trip into three Dijkstra legs ($D_{orig} \to P_{pickup}$, $P_{pickup} \to P_{drop}$, and $P_{drop} \to D_{dest}$), we calculate the exact extra detour for the driver down to the meter. If the detour exceeds the driver's threshold, we reject the candidate with an explicit diagnostic code."*

---

## 3. SPECpower Linear Server Power Model

### Why SPECpower Linear Approximation?
- **Industry Standard**: Server processors and server chassis follow a strongly linear power profile between idle power and peak utilization:
  $$P_{\text{avg}} = P_{\text{idle}} + (P_{\text{max}} - P_{\text{idle}}) \times u$$
- **Hardware Grounding**: Default parameters ($P_{\text{idle}} = 45\text{ W}$, $P_{\text{max}} = 220\text{ W}$) are based on standard 2U dual-socket Intel Xeon / AMD EPYC server nodes published in SPECpower_ssj2008 benchmarks.
- **Deterministic Validation**: Allows unit-testing power calculations across $0\%$ and $100\%$ boundaries without needing physical hardware power meters during CI/CD.

### Alternatives Considered & Rejected
| Alternative Approach | Reasons for Rejection |
| :--- | :--- |
| **Flat TDP Rating** | Multiplying server Thermal Design Power ($220\text{ W}$) by 24 hours assumes the server draws 100% power continuously, overestimating carbon emissions by over 300%. |
| **Complex Non-Linear Cubic Models** | Cubic models apply to dynamic CMOS CPU voltage/frequency scaling ($P \propto f \cdot V^2$), but modern server chassis have constant baseline draws (fans, memory, motherboard, power supply efficiency curves) that linearize the total system power. |

### Viva Explanation
> *"For our computing observatory, we avoid the mistake of assuming a server always draws its maximum TDP. We adopted the SPECpower linear server model, where a server has a baseline idle draw of 45 Watts and scales linearly to 220 Watts at 100% utilization. This gives transparent, defensible Scope 2 kilowatt-hour and carbon estimates."*

---

## 4. Wall-Clock Epoch Arithmetic for Focus Sessions

### Why Wall-Clock Epoch Subtraction?
- **The Browser Throttling Problem**: Standard JavaScript `setInterval(..., 1000)` ticks are throttled or frozen by browsers when a user switches tabs or minimizes the window. A 30-minute study session in a background tab would only count 2 or 3 minutes if driven by tick counters.
- **The Solution**: Store millisecond epoch timestamps $T_{\text{start}}$ and $T_{\text{stop}}$ using `Date.now()`. When paused, record the start and end of the pause interval.
- **Mathematical Invariant**:
  $$T_{\text{effective}} = (T_{\text{stop}} - T_{\text{start}}) - \sum (T_{\text{pause\_end}} - T_{\text{pause\_start}})$$
- Even if the browser sleeps for 20 minutes, refreshing or refocusing recomputes the exact elapsed wall-clock duration with zero clock drift.

### Alternatives Considered & Rejected
| Alternative Approach | Reasons for Rejection |
| :--- | :--- |
| **Frontend Tick Counter (`count += 1`)** | Fails under tab suspension and sleep states, causing severe timer deflation. |
| **Server-Side WebSocket Heartbeat** | Requires a continuous ping to the server every second, generating unnecessary server load and violating our privacy principle of local data sovereignty. |

---

## 5. Sliding-Window & IoU for Exam Review

### Why Sliding-Window and IoU?
- **Non-Punitive Behavioral Signaling**: Computer vision algorithms produce false positives (e.g. a student dropping a pen, turning to read a wall clock, or lighting changes).
- **Temporal Frequency Clustering**: A single head movement is never flagged. Only when a frequency threshold is crossed ($\ge 3$ cues within a 30-second sliding window) does the system alert the certified human proctor.
- **Observable Geometric Grounding**: By using Cartesian bounding box coordinates $[0.0, 1.0]$, we can test and audit the invigilation logic independently of physical webcam hardware.

### Viva Explanation
> *"In our exam proctoring module, we enforce a strict ethical presumption of integrity. Benign movements happen naturally in exam halls. Instead of a black-box neural network auto-penalizing a student, we use an observable sliding-window algorithm: only if 3 or more movements occur within a tight 30-second window is an item placed in the proctor queue. The proctor reviews the context and records the final determination in an immutable audit ledger."*
