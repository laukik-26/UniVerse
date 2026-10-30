# UniVerse — Algorithms & Mathematical Specifications

This document provides complete, rigorous technical specifications for every algorithm actually implemented in the UniVerse codebase. No planned or hypothetical algorithms are described as implemented.

---

## 1. Dijkstra Shortest-Path Algorithm

- **Source Code**: [`backend/graph.py`](../backend/graph.py) (`dijkstra_shortest_path`)
- **Unit Test File**: [`backend/test_ride_pooling.py`](../backend/test_ride_pooling.py)
- **Purpose**: Calculates the minimum road distance in kilometers and reconstructs the deterministic sequence of campus landmarks connecting any source and destination node on the campus road graph.

### 1.1 Inputs and Outputs
- **Inputs**:
  - `graph: Dict[str, List[Tuple[str, float]]]`: Adjacency list representation where keys are landmark node IDs and values are lists of `(neighbor_id, weight_km)`.
  - `source: str`: Starting landmark node ID.
  - `target: str`: Destination landmark node ID.
- **Outputs**:
  - `Tuple[float, List[str]]`: Minimum road distance (km) and the ordered list of node IDs forming the shortest path. Returns `(float("inf"), [])` if unreachable.

### 1.2 Step-by-Step Explanation
1. **Validation & Trivial Case**: If source or target node is missing from graph, return $(\infty, [])$. If $\text{source} == \text{target}$, return $(0.0, [\text{source}])$.
2. **Data Structure Initialization**:
   - Distance array/map $\text{dist}[v] \leftarrow \infty$ for all $v \in V$; $\text{dist}[\text{source}] \leftarrow 0.0$.
   - Predecessor map $\text{pred}[v] \leftarrow \text{None}$ for all $v \in V$.
   - Binary min-heap priority queue $PQ$ initialized with tuple $(0.0, \text{source})$.
   - Explored set $S \leftarrow \emptyset$.
3. **Exploration Loop**:
   - Extract minimum distance vertex $(d, u) \leftarrow \text{heappop}(PQ)$.
   - If $u \in S$, continue. Mark $u \in S$.
   - If $u == \text{target}$, break early.
   - For each neighbor $(v, w)$ of $u$:
     - If $v \in S$, skip.
     - Calculate $\text{alt} \leftarrow \text{round}(d + w, 4)$.
     - If $\text{alt} < \text{dist}[v]$: update $\text{dist}[v] \leftarrow \text{alt}$, $\text{pred}[v] \leftarrow u$, and push $(\text{alt}, v)$ to $PQ$.
4. **Path Reconstruction**: If $\text{dist}[\text{target}] == \infty$, return $(\infty, [])$. Otherwise, traverse backwards from $\text{target}$ through predecessors until $\text{source}$ is reached, reverse the list, and return $(\text{dist}[\text{target}], \text{path})$.

### 1.3 Pseudocode
```python
function dijkstra_shortest_path(graph, source, target):
    if source not in graph or target not in graph:
        return (infinity, [])
    if source == target:
        return (0.0, [source])

    distances = map(all nodes -> infinity)
    predecessors = map(all nodes -> None)
    distances[source] = 0.0
    pq = MinHeap([(0.0, source)])
    visited = Set()

    while pq is not empty:
        curr_dist, u = pq.pop_min()
        if u in visited:
            continue
        visited.add(u)
        if u == target:
            break

        for (v, weight) in graph[u]:
            if v in visited:
                continue
            alt = curr_dist + weight
            if alt < distances[v]:
                distances[v] = alt
                predecessors[v] = u
                pq.insert((alt, v))

    if distances[target] == infinity:
        return (infinity, [])

    path = []
    curr = target
    while curr is not None:
        path.append(curr)
        curr = predecessors[curr]
    return (round(distances[target], 2), reverse(path))
```

### 1.4 Mathematical Formulation & Complexity
- **Mathematical Formula**:
  $$\text{dist}[v] = \min_{(u, v) \in E} (\text{dist}[u] + w(u, v))$$
- **Time Complexity**: $\mathcal{O}((V + E) \log V)$ where $V = 12$ landmarks and $E = 16$ bidirectional road segments ($32$ directed edges). Since $V$ is fixed, the operation completes in $< 0.1\text{ ms}$.
- **Space Complexity**: $\mathcal{O}(V + E)$ for distance map, predecessor map, and min-heap.

### 1.5 Worked Example
- Query: `node-main-gate` $\to$ `node-eng-cluster`.
- Graph weights:
  - `node-main-gate` $\leftrightarrow$ `node-hostel-north`: $0.9\text{ km}$
  - `node-hostel-north` $\leftrightarrow$ `node-eng-cluster`: $1.1\text{ km}$
  - `node-main-gate` $\leftrightarrow$ `node-admin`: $1.2\text{ km}$
  - `node-admin` $\leftrightarrow$ `node-eng-cluster`: $1.0\text{ km}$
- Route A: Main Gate $\to$ Hostel North $\to$ Eng Cluster $= 0.9 + 1.1 = 2.0\text{ km}$.
- Route B: Main Gate $\to$ Admin $\to$ Eng Cluster $= 1.2 + 1.0 = 2.2\text{ km}$.
- Output: Distance $= 2.0\text{ km}$, Path $= [\text{"node-main-gate"}, \text{"node-hostel-north"}, \text{"node-eng-cluster"}]$.

### 1.6 Edge Cases & Limitations
- **Negative Edge Prevention**: Edge loading explicitly checks $w < 0$ and raises `ValueError`.
- **Unreachable Nodes**: Handled cleanly by returning $(\infty, [])$ without throwing runtime exceptions.
- **Limitation**: Assumes static road distances; does not ingest live GPS traffic speed vectors.

---

## 2. Sequential 4-Stop Carpool Route Matching & Detour Optimization

- **Source Code**: [`backend/matcher.py`](../backend/matcher.py) (`calculate_shared_route`, `match_passenger_to_rides`)
- **Unit Test File**: [`backend/test_ride_pooling.py`](../backend/test_ride_pooling.py)
- **Purpose**: Evaluates candidate driver commutes against passenger requests by calculating composite detour kilometers, schedule windows, and seat capacity.

### 2.1 Inputs and Outputs
- **Inputs**:
  - `passenger_request`: Dict with `pickup_id`, `dropoff_id`, `preferred_time`, `time_flexibility_mins`, `seats_needed`, `max_detour_km`.
  - `active_driver_rides`: List of driver offerings (`origin_id`, `destination_id`, `departure_time`, `available_seats`, `max_detour_km`).
- **Outputs**:
  - `compatible_matches`: List of valid candidate rides sorted by smallest detour km, then time delta.
  - `rejected_candidates`: List of rejected rides with explicit diagnostic rejection codes (`INSUFFICIENT_SEATS`, `TIME_INCOMPATIBLE`, `EXCESSIVE_DETOUR`, `UNREACHABLE_ROUTE`).

### 2.2 Mathematical Formulas & Metrics
1. **Sequential 4-Stop Insertion Distance**:
   $$D_{\text{composite}} = \text{dist}(D_{\text{orig}}, P_{\text{pickup}}) + \text{dist}(P_{\text{pickup}}, P_{\text{drop}}) + \text{dist}(P_{\text{drop}}, D_{\text{dest}})$$
2. **Driver Detour Calculation**:
   $$\Delta D_{\text{detour}} = D_{\text{composite}} - D_{\text{driver\_direct}}$$
3. **Net Travel Distance Saved (Avoided Tailpipe VKT)**:
   $$D_{\text{saved}} = D_{\text{passenger\_direct}} - \Delta D_{\text{detour}}$$
4. **Avoided Fuel Cost & Scope 3 Commuting Emissions**:
   $$\text{CostSaved}_{\text{INR}} = D_{\text{saved}} \times 8.50 \text{ INR/km}$$
   $$\text{CO}_{2\text{ avoided, kg}} = \frac{D_{\text{saved}} \times 120.0 \text{ g/km}}{1000.0}$$
5. **Time Compatibility Constraint**:
   $$|T_{\text{driver}} - T_{\text{passenger}}| \le \text{Flexibility}_{\text{minutes}}$$

### 2.3 Deterministic Match Ranking
Candidate rides satisfying all constraints are ranked by a tuple sort:
$$\text{Rank Key} = (\Delta D_{\text{detour}}, |T_{\text{driver}} - T_{\text{passenger}}|)$$
Smallest detour is prioritized, followed by closest departure time.

---

## 3. Placement Readiness Milestone Aggregation

- **Source Code**: [`backend/routers/academic.py`](../backend/routers/academic.py) (`get_placement_progress`)
- **Unit Test File**: [`backend/test_academic.py`](../backend/test_academic.py)
- **Purpose**: Computes overall and category-specific career readiness scores based on completed milestones.

### 3.1 Mathematical Formulation
- Overall Completion:
  $$P_{\text{overall}} = \begin{cases} 
  \frac{N_{\text{completed}}}{N_{\text{total}}} \times 100.0 & \text{if } N_{\text{total}} > 0 \\ 
  0.0 & \text{if } N_{\text{total}} = 0 
  \end{cases}$$
- Category Completion (for $c \in \{\text{DSA}, \text{Development}, \text{CS Fundamentals}, \text{Aptitude}, \text{Interview Prep}\}$):
  $$P_c = \begin{cases} 
  \frac{N_{\text{completed}, c}}{N_{\text{total}, c}} \times 100.0 & \text{if } N_{\text{total}, c} > 0 \\ 
  0.0 & \text{if } N_{\text{total}, c} = 0 
  \end{cases}$$
- **Time Complexity**: $\mathcal{O}(N)$ where $N$ is total student tasks.
- **Space Complexity**: $\mathcal{O}(C)$ where $C = 5$ categories.

---

## 4. SPECpower Linear Server Power & Emissions Modeling

- **Source Code**: [`backend/energy_model.py`](../backend/energy_model.py)
- **Unit Test File**: [`backend/test_observatory.py`](../backend/test_observatory.py)
- **Purpose**: Translates simulated CPU utilization fractions into active Watts, kilowatt-hours, and Scope 2 carbon footprint.

### 4.1 Mathematical Formulas
1. **Linear Server Power Model**:
   $$P_{\text{avg}} = P_{\text{idle}} + (P_{\text{max}} - P_{\text{idle}}) \times u$$
   - Units: Watts ($W$).
   - Constraints: $P_{\text{idle}} \ge 0$, $P_{\text{max}} \ge P_{\text{idle}}$, $0.0 \le u \le 1.0$.
2. **Energy Consumption**:
   $$E_{\text{kWh}} = \frac{P_{\text{avg}} \times t_{\text{seconds}}}{3,600,000}$$
   - Units: Kilowatt-hours ($kWh$). 1 kWh $= 3.6 \times 10^6$ Joules.
3. **Scope 2 Carbon Emissions**:
   $$\text{CO}_{2\text{, kg}} = E_{\text{kWh}} \times f_{\text{grid}}$$
   - Units: $\text{kg CO}_2\text{e}$.
   - Default $f_{\text{grid}} = 0.716\text{ kg CO}_2/\text{kWh}$ (CEA India Baseline Database v19.0).
4. **Safe Percentage Change**:
   $$\Delta_{\text{pct}} = \begin{cases}
   \frac{V_{\text{opt}} - V_{\text{base}}}{V_{\text{base}}} \times 100.0 & \text{if } V_{\text{base}} > 0 \\
   0.0 & \text{if } V_{\text{base}} = 0
   \end{cases}$$

### 4.2 Worked Example
- Baseline Workload: $P_{\text{idle}} = 45\text{ W}$, $P_{\text{max}} = 220\text{ W}$, $u = 0.72$, $t = 3600\text{ s}$, $f_{\text{grid}} = 0.716$.
- $P_{\text{avg}} = 45 + (220 - 45) \times 0.72 = 45 + 126.0 = 171.0\text{ W}$.
- $E_{\text{kWh}} = \frac{171.0 \times 3600}{3,600,000} = 0.171\text{ kWh}$.
- $\text{CO}_2 = 0.171 \times 0.716 = 0.122436\text{ kg CO}_2 = 122.44\text{ g CO}_2$.

---

## 5. Focus Duration & Capped Dwell Time Estimation

- **Source Code**: [`backend/wellbeing.py`](../backend/wellbeing.py)
- **Unit Test File**: [`backend/test_wellbeing.py`](../backend/test_wellbeing.py)
- **Purpose**: Computes effective concentration duration without tab drift and calculates browsing category dwell times with an explicit anti-idle cap.

### 5.1 Pause-Excluded Focus Duration
Given session start $T_{\text{start}}$, session stop $T_{\text{stop}}$, and a list of paused intervals $[(p_{1,s}, p_{1,e}), (p_{2,s}, p_{2,e}), \dots]$:
1. Validate $T_{\text{stop}} \ge T_{\text{start}}$ and $p_{i,e} \ge p_{i,s}$.
2. For each interval, clamp within session bounds:
   $$p'_{i,s} = \max(p_{i,s}, T_{\text{start}}), \quad p'_{i,e} = \min(p_{i,e}, T_{\text{stop}})$$
3. Sum valid pauses:
   $$T_{\text{paused}} = \sum_{i} \max(0, p'_{i,e} - p'_{i,s})$$
4. Effective Duration:
   $$T_{\text{effective}} = \max(0.0, (T_{\text{stop}} - T_{\text{start}}) - T_{\text{paused}})$$

### 5.2 Context Switch & Capped Dwell Calculation
- **Context Switch Count**:
  $$\text{Switches} = \sum_{i=1}^{M-1} \mathbb{I}(\text{cat}_i \ne \text{cat}_{i+1})$$
- **Capped Dwell Delta**: Between consecutive event timestamps $t_i$ and $t_{i+1}$:
  $$\Delta t_i = \min(t_{i+1} - t_i, 300.0\text{ seconds})$$
  Attribute $\Delta t_i$ to category $\text{cat}_i$.
- **Productivity Score**:
  $$\text{Score}_{\text{pct}} = \begin{cases}
  \frac{\text{Dwell}_{\text{productive}}}{\text{Dwell}_{\text{productive}} + \text{Dwell}_{\text{distracting}}} \times 100.0 & \text{if denominator } > 0 \\
  100.0 & \text{if denominator } = 0
  \end{cases}$$

---

## 6. Temporal Sliding-Window Frequency Analysis

- **Source Code**: [`backend/exam_rules.py`](../backend/exam_rules.py) (`evaluate_event_window`)
- **Unit Test File**: [`backend/test_exam.py`](../backend/test_exam.py)
- **Purpose**: Evaluates whether discrete cues (e.g., repeated head-turns) exceed an occurrence threshold within any sliding time window $W$.

### 6.1 Two-Pointer Sliding Window
- **Inputs**: List of event timestamps $T = [t_1, t_2, \dots, t_N]$, window duration $W$ (default $30.0\text{ s}$), threshold $K$ (default $3$).
- **Algorithm**:
  1. Sort timestamps $T$ in ascending order.
  2. Initialize two pointers: $\text{left} = 0, \text{right} = 0, \text{max\_count} = 0$.
  3. For each $\text{left} \in [0, N-1]$:
     - While $\text{right} < N$ and $t_{\text{right}} \le t_{\text{left}} + W$: increment $\text{right}$.
     - Count in window $= \text{right} - \text{left}$.
     - Update $\text{max\_count} = \max(\text{max\_count}, \text{count})$.
  4. Trigger rule if $\text{max\_count} \ge K$.
- **Complexity**: Time $\mathcal{O}(N \log N)$ for initial sort, followed by $\mathcal{O}(N)$ two-pointer traversal; Space $\mathcal{O}(1)$.

---

## 7. 2D Bounding Box Intersection & IoU Zone Intrusion

- **Source Code**: [`backend/exam_rules.py`](../backend/exam_rules.py) (`compute_box_intersection_iou`, `evaluate_zone_geometry`)
- **Unit Test File**: [`backend/test_exam.py`](../backend/test_exam.py)
- **Purpose**: Evaluates whether detected hand or object bounding boxes intrude into restricted desk perimeters.

### 7.1 Mathematical Formulation
Given two 2D boxes $A = (x_{1A}, y_{1A}, x_{2A}, y_{2A})$ and $B = (x_{1B}, y_{1B}, x_{2B}, y_{2B})$ in normalized coordinates $[0.0, 1.0]$:
1. **Intersection Coordinates**:
   $$x_{\text{inter, 1}} = \max(x_{1A}, x_{1B}), \quad y_{\text{inter, 1}} = \max(y_{1A}, y_{1B})$$
   $$x_{\text{inter, 2}} = \min(x_{2A}, x_{2B}), \quad y_{\text{inter, 2}} = \min(y_{2A}, y_{2B})$$
2. **Intersection Area**:
   $$w_{\text{inter}} = \max(0.0, x_{\text{inter, 2}} - x_{\text{inter, 1}}), \quad h_{\text{inter}} = \max(0.0, y_{\text{inter, 2}} - y_{\text{inter, 1}})$$
   $$\text{Area}_{\text{inter}} = w_{\text{inter}} \times h_{\text{inter}}$$
3. **Union Area & IoU**:
   $$\text{Area}_A = (x_{2A} - x_{1A}) \times (y_{2A} - y_{1A}), \quad \text{Area}_B = (x_{2B} - x_{1B}) \times (y_{2B} - y_{1B})$$
   $$\text{Area}_{\text{union}} = \text{Area}_A + \text{Area}_B - \text{Area}_{\text{inter}}$$
   $$\text{IoU} = \begin{cases} \frac{\text{Area}_{\text{inter}}}{\text{Area}_{\text{union}}} & \text{if Area}_{\text{union}} > 0 \\ 0.0 & \text{otherwise} \end{cases}$$
- **Intrusion Trigger**: Rule triggers when $\text{Area}_{\text{inter}} > 0$ and $\text{IoU} \ge \text{IoU}_{\text{threshold}}$.
