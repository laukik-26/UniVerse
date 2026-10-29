"""
UniVerse Sustainable Computing Observatory: Workload Telemetry Engine.
Defines reproducible, seeded telemetry snapshots for the 3 core campus services,
with distinct Baseline and Eco-Optimized operational profiles.
"""

from typing import Dict, List, Any

CAMPUS_SERVICES: Dict[str, Dict[str, Any]] = {
    "svc-placement-api": {
        "id": "svc-placement-api",
        "name": "Placement Readiness Assessment API",
        "module": "Module A (Academic Hub)",
        "tech_stack": "FastAPI + Pydantic + SQLite",
        "workload_type": "Analytical Skill Matrix Scoring & Query Engine",
        "observation_window_seconds": 3600,
        "baseline": {
            "mode_label": "Uncached DB & Synchronous Parsing",
            "request_count": 12450,
            "requests_per_second": 3.46,
            "avg_latency_ms": 142.5,
            "p95_latency_ms": 285.0,
            "cpu_utilization_pct": 68.0,
            "cpu_utilization_fraction": 0.680,
            "memory_usage_mb": 1840,
            "optimization_techniques": "None (Vanilla ORM Scans)",
        },
        "optimized": {
            "mode_label": "Tier-1 Memory Cache & Precomputed Index",
            "request_count": 12450,
            "requests_per_second": 3.46,
            "avg_latency_ms": 34.0,
            "p95_latency_ms": 68.0,
            "cpu_utilization_pct": 26.5,
            "cpu_utilization_fraction": 0.265,
            "memory_usage_mb": 960,
            "optimization_techniques": "In-memory caching, prepared statement reuse, query batching",
        },
    },
    "svc-academic-search": {
        "id": "svc-academic-search",
        "name": "Academic Resource Inverted Search",
        "module": "Module A (Academic Hub)",
        "tech_stack": "Python Search Inverted Index",
        "workload_type": "Full-Text Keyword Retrieval & Filter Ranking",
        "observation_window_seconds": 3600,
        "baseline": {
            "mode_label": "Linear Full-Table Scans",
            "request_count": 8320,
            "requests_per_second": 2.31,
            "avg_latency_ms": 215.0,
            "p95_latency_ms": 410.0,
            "cpu_utilization_pct": 74.0,
            "cpu_utilization_fraction": 0.740,
            "memory_usage_mb": 2400,
            "optimization_techniques": "None (Unindexed regex scans)",
        },
        "optimized": {
            "mode_label": "Inverted Index Caching & Async Payloads",
            "request_count": 8320,
            "requests_per_second": 2.31,
            "avg_latency_ms": 48.0,
            "p95_latency_ms": 95.0,
            "cpu_utilization_pct": 31.0,
            "cpu_utilization_fraction": 0.310,
            "memory_usage_mb": 1220,
            "optimization_techniques": "Inverted index hashing, LRU query caching, gzip compression",
        },
    },
    "svc-ride-matcher": {
        "id": "svc-ride-matcher",
        "name": "Smart Ride-Pooling Dijkstra Engine",
        "module": "Module B (Ride-Pooling)",
        "tech_stack": "Dijkstra Min-Heap Routing + Detour Pruning",
        "workload_type": "4-Way Topological Insertion & Graph Detour Solver",
        "observation_window_seconds": 3600,
        "baseline": {
            "mode_label": "Brute-Force Pairwise Graph Traversal",
            "request_count": 5140,
            "requests_per_second": 1.43,
            "avg_latency_ms": 320.0,
            "p95_latency_ms": 610.0,
            "cpu_utilization_pct": 82.5,
            "cpu_utilization_fraction": 0.825,
            "memory_usage_mb": 1950,
            "optimization_techniques": "None (Repeated Dijkstra per rider inquiry)",
        },
        "optimized": {
            "mode_label": "Precomputed Contraction Hierarchies & Batch Pruning",
            "request_count": 5140,
            "requests_per_second": 1.43,
            "avg_latency_ms": 52.0,
            "p95_latency_ms": 110.0,
            "cpu_utilization_pct": 28.0,
            "cpu_utilization_fraction": 0.280,
            "memory_usage_mb": 1100,
            "optimization_techniques": "Precomputed distance matrix, early bounding-box detour pruning",
        },
    },
}

def get_all_services_telemetry() -> List[Dict[str, Any]]:
    """Returns list of all registered campus microservices with current telemetry specs."""
    return list(CAMPUS_SERVICES.values())

def get_service_telemetry(service_id: str) -> Dict[str, Any]:
    """Returns single service telemetry or raises KeyError."""
    if service_id not in CAMPUS_SERVICES:
        raise KeyError(f"Service '{service_id}' not found in campus observatory catalog.")
    return CAMPUS_SERVICES[service_id]
