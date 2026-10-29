"""
UniVerse Smart Campus Ride-Pooling: Graph & Routing Engine
Contains campus road topology definition, Dijkstra shortest-path implementation,
and deterministic path reconstruction.
"""

from typing import Dict, List, Tuple, Optional
import heapq

# 1. Campus Road Graph Definition
# 12 Named Campus Locations with stable IDs and coordinates for visual rendering
CAMPUS_LOCATIONS: Dict[str, Dict] = {
    "node-main-gate": {
        "id": "node-main-gate",
        "name": "Main Campus Gate (North)",
        "category": "Gate / Transit",
        "x": 50,
        "y": 10,
    },
    "node-hostel-north": {
        "id": "node-hostel-north",
        "name": "North Hostel Quad (Blocks A-C)",
        "category": "Residential",
        "x": 25,
        "y": 18,
    },
    "node-sports-arena": {
        "id": "node-sports-arena",
        "name": "Sports Complex & Stadium",
        "category": "Recreation",
        "x": 80,
        "y": 22,
    },
    "node-admin": {
        "id": "node-admin",
        "name": "Administrative Block & Registry",
        "category": "Administration",
        "x": 50,
        "y": 32,
    },
    "node-eng-cluster": {
        "id": "node-eng-cluster",
        "name": "Engineering & Computing Complex",
        "category": "Academic",
        "x": 28,
        "y": 42,
    },
    "node-central-lib": {
        "id": "node-central-lib",
        "name": "Central University Library",
        "category": "Academic",
        "x": 72,
        "y": 42,
    },
    "node-student-center": {
        "id": "node-student-center",
        "name": "Student Activity Center & Dining",
        "category": "Amenity",
        "x": 50,
        "y": 55,
    },
    "node-science-park": {
        "id": "node-science-park",
        "name": "Science & Advanced Research Labs",
        "category": "Research",
        "x": 24,
        "y": 68,
    },
    "node-medical-center": {
        "id": "node-medical-center",
        "name": "Campus Health & Medical Centre",
        "category": "Medical",
        "x": 78,
        "y": 65,
    },
    "node-hostel-south": {
        "id": "node-hostel-south",
        "name": "South Hostel Complex (Blocks D-F)",
        "category": "Residential",
        "x": 78,
        "y": 82,
    },
    "node-tech-incubator": {
        "id": "node-tech-incubator",
        "name": "Innovation Hub & Tech Incubator",
        "category": "Research",
        "x": 22,
        "y": 86,
    },
    "node-south-gate": {
        "id": "node-south-gate",
        "name": "South Gate & Metro Transit Terminal",
        "category": "Gate / Transit",
        "x": 50,
        "y": 92,
    },
}

# Weighted Bidirectional Road Connections (Distances in Kilometres)
ROAD_EDGES: List[Tuple[str, str, float]] = [
    ("node-main-gate", "node-hostel-north", 0.8),
    ("node-main-gate", "node-admin", 1.0),
    ("node-main-gate", "node-sports-arena", 1.6),
    ("node-admin", "node-eng-cluster", 1.1),
    ("node-admin", "node-central-lib", 0.9),
    ("node-admin", "node-student-center", 1.2),
    ("node-hostel-north", "node-eng-cluster", 1.4),
    ("node-eng-cluster", "node-science-park", 1.0),
    ("node-eng-cluster", "node-student-center", 0.9),
    ("node-central-lib", "node-sports-arena", 1.2),
    ("node-central-lib", "node-medical-center", 1.1),
    ("node-central-lib", "node-student-center", 0.8),
    ("node-student-center", "node-science-park", 1.3),
    ("node-student-center", "node-medical-center", 1.0),
    ("node-student-center", "node-south-gate", 1.8),
    ("node-science-park", "node-tech-incubator", 1.1),
    ("node-science-park", "node-south-gate", 1.7),
    ("node-medical-center", "node-hostel-south", 1.2),
    ("node-hostel-south", "node-south-gate", 1.4),
    ("node-tech-incubator", "node-south-gate", 1.5),
]

def build_adjacency_list(
    nodes: Dict[str, Dict] = CAMPUS_LOCATIONS,
    edges: List[Tuple[str, str, float]] = ROAD_EDGES
) -> Dict[str, List[Tuple[str, float]]]:
    """
    Constructs an undirected adjacency list from node and edge definitions.
    Ensures non-negative edge weights.
    """
    adj: Dict[str, List[Tuple[str, float]]] = {node_id: [] for node_id in nodes}
    for u, v, w in edges:
        if w < 0:
            raise ValueError(f"Edge weight between {u} and {v} cannot be negative: {w}")
        if u in adj and v in adj:
            adj[u].append((v, round(float(w), 3)))
            adj[v].append((u, round(float(w), 3)))
    return adj

# Pre-built campus road network adjacency graph
CAMPUS_GRAPH = build_adjacency_list()

def dijkstra_shortest_path(
    graph: Dict[str, List[Tuple[str, float]]],
    source: str,
    target: str
) -> Tuple[float, List[str]]:
    """
    Computes the shortest path and minimum distance between source and target
    using Dijkstra's algorithm with a min-heap priority queue.
    
    Guarantees:
    - Non-negative edge weights verified.
    - Deterministic tie-breaking for path reconstruction.
    - Returns (float('inf'), []) if target is unreachable or invalid.
    - Returns (0.0, [source]) if source == target.
    
    Parameters:
        graph: Adjacency list mapping node_id -> List of (neighbor_id, weight_km)
        source: Starting location node ID
        target: Destination location node ID
        
    Returns:
        Tuple of (shortest_distance_km, path_node_ids)
    """
    if source not in graph or target not in graph:
        return float("inf"), []

    if source == target:
        return 0.0, [source]

    # distances[node] stores shortest known distance from source
    distances: Dict[str, float] = {node: float("inf") for node in graph}
    # predecessors[node] stores previous node on shortest path
    predecessors: Dict[str, Optional[str]] = {node: None for node in graph}

    distances[source] = 0.0
    # Priority queue stores (cost, current_node).
    # Python heap handles tuples; if costs are identical, strings provide deterministic tie-break.
    pq: List[Tuple[float, str]] = [(0.0, source)]

    visited = set()

    while pq:
        curr_dist, u = heapq.heappop(pq)

        if u in visited:
            continue
        visited.add(u)

        if u == target:
            break

        for v, weight in graph.get(u, []):
            if v in visited:
                continue

            new_dist = round(curr_dist + weight, 4)
            if new_dist < distances[v]:
                distances[v] = new_dist
                predecessors[v] = u
                heapq.heappush(pq, (new_dist, v))

    # If target is unreachable
    if distances[target] == float("inf"):
        return float("inf"), []

    # Path reconstruction backwards from target to source
    path: List[str] = []
    curr: Optional[str] = target
    while curr is not None:
        path.append(curr)
        curr = predecessors[curr]
    path.reverse()

    return round(distances[target], 2), path
