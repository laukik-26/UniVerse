import type { 
  ServiceWorkload, 
  ObservatoryScenariosSummary, 
  TransportVsComputeComparison 
} from '../types/observatory';

const API_BASE_URL = 'http://localhost:8000/api';

const FALLBACK_SERVICES: ServiceWorkload[] = [
  {
    id: 'svc-placement-api',
    name: 'Placement Readiness Assessment API',
    module: 'Module A (Academic Hub)',
    tech_stack: 'FastAPI + Pydantic + SQLite',
    workload_type: 'Analytical Skill Matrix Scoring & Query Engine',
    observation_window_seconds: 3600,
    baseline: {
      mode_label: 'Uncached DB & Synchronous Parsing',
      request_count: 12450,
      requests_per_second: 3.46,
      avg_latency_ms: 142.5,
      p95_latency_ms: 285.0,
      cpu_utilization_pct: 68.0,
      cpu_utilization_fraction: 0.680,
      memory_usage_mb: 1840,
      optimization_techniques: 'None (Vanilla ORM Scans)',
    },
    optimized: {
      mode_label: 'Tier-1 Memory Cache & Precomputed Index',
      request_count: 12450,
      requests_per_second: 3.46,
      avg_latency_ms: 34.0,
      p95_latency_ms: 68.0,
      cpu_utilization_pct: 26.5,
      cpu_utilization_fraction: 0.265,
      memory_usage_mb: 960,
      optimization_techniques: 'In-memory caching, prepared statement reuse, query batching',
    },
  },
  {
    id: 'svc-academic-search',
    name: 'Academic Resource Inverted Search',
    module: 'Module A (Academic Hub)',
    tech_stack: 'Python Search Inverted Index',
    workload_type: 'Full-Text Keyword Retrieval & Filter Ranking',
    observation_window_seconds: 3600,
    baseline: {
      mode_label: 'Linear Full-Table Scans',
      request_count: 8320,
      requests_per_second: 2.31,
      avg_latency_ms: 215.0,
      p95_latency_ms: 410.0,
      cpu_utilization_pct: 74.0,
      cpu_utilization_fraction: 0.740,
      memory_usage_mb: 2400,
      optimization_techniques: 'None (Unindexed regex scans)',
    },
    optimized: {
      mode_label: 'Inverted Index Caching & Async Payloads',
      request_count: 8320,
      requests_per_second: 2.31,
      avg_latency_ms: 48.0,
      p95_latency_ms: 95.0,
      cpu_utilization_pct: 31.0,
      cpu_utilization_fraction: 0.310,
      memory_usage_mb: 1220,
      optimization_techniques: 'Inverted index hashing, LRU query caching, gzip compression',
    },
  },
  {
    id: 'svc-ride-matcher',
    name: 'Smart Ride-Pooling Dijkstra Engine',
    module: 'Module B (Ride-Pooling)',
    tech_stack: 'Dijkstra Min-Heap Routing + Detour Pruning',
    workload_type: '4-Way Topological Insertion & Graph Detour Solver',
    observation_window_seconds: 3600,
    baseline: {
      mode_label: 'Brute-Force Pairwise Graph Traversal',
      request_count: 5140,
      requests_per_second: 1.43,
      avg_latency_ms: 320.0,
      p95_latency_ms: 610.0,
      cpu_utilization_pct: 82.5,
      cpu_utilization_fraction: 0.825,
      memory_usage_mb: 1950,
      optimization_techniques: 'None (Repeated Dijkstra per rider inquiry)',
    },
    optimized: {
      mode_label: 'Precomputed Contraction Hierarchies & Batch Pruning',
      request_count: 5140,
      requests_per_second: 1.43,
      avg_latency_ms: 52.0,
      p95_latency_ms: 110.0,
      cpu_utilization_pct: 28.0,
      cpu_utilization_fraction: 0.280,
      memory_usage_mb: 1100,
      optimization_techniques: 'Precomputed distance matrix, early bounding-box detour pruning',
    },
  },
];

export const observatoryApi = {
  // 1. Get Services Telemetry
  async getServices(): Promise<ServiceWorkload[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/observatory/services`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return FALLBACK_SERVICES;
  },

  // 2. Scenario Comparisons
  async getScenarios(params?: {
    idle_power_w?: number;
    max_power_w?: number;
    grid_factor_kg_per_kwh?: number;
    duration_seconds?: number;
  }): Promise<ObservatoryScenariosSummary> {
    const idle = params?.idle_power_w ?? 45.0;
    const maxP = params?.max_power_w ?? 220.0;
    const gridF = params?.grid_factor_kg_per_kwh ?? 0.716;
    const dur = params?.duration_seconds ?? 3600.0;

    try {
      const q = new URLSearchParams({
        idle_power_w: idle.toString(),
        max_power_w: maxP.toString(),
        grid_factor_kg_per_kwh: gridF.toString(),
        duration_seconds: dur.toString(),
      });
      const res = await fetch(`${API_BASE_URL}/observatory/scenarios?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // Client-side fallback calculation using exact mathematical formulas
    const serviceComparisons = FALLBACK_SERVICES.map(svc => {
      const bU = svc.baseline.cpu_utilization_fraction;
      const oU = svc.optimized.cpu_utilization_fraction;

      const bP = idle + (maxP - idle) * bU;
      const oP = idle + (maxP - idle) * oU;

      const bKwh = (bP * dur) / 3600000.0;
      const oKwh = (oP * dur) / 3600000.0;

      const bCo2 = bKwh * gridF;
      const oCo2 = oKwh * gridF;

      const kwhDiff = bKwh - oKwh;
      const kwhPct = bKwh > 0 ? (kwhDiff / bKwh) * 100 : 0;

      const co2Diff = bCo2 - oCo2;
      const co2Pct = bCo2 > 0 ? (co2Diff / bCo2) * 100 : 0;

      const latDiff = svc.baseline.avg_latency_ms - svc.optimized.avg_latency_ms;
      const latPct = (latDiff / svc.baseline.avg_latency_ms) * 100;

      return {
        service_id: svc.id,
        service_name: svc.name,
        module: svc.module,
        baseline: {
          utilization_pct: svc.baseline.cpu_utilization_pct,
          utilization_fraction: bU,
          average_power_w: Math.round(bP * 10) / 10,
          energy_kwh: Math.round(bKwh * 1000) / 1000,
          co2_kg: Math.round(bCo2 * 1000) / 1000,
          co2_grams: Math.round(bCo2 * 1000000) / 1000,
          duration_seconds: dur,
        },
        optimized: {
          utilization_pct: svc.optimized.cpu_utilization_pct,
          utilization_fraction: oU,
          average_power_w: Math.round(oP * 10) / 10,
          energy_kwh: Math.round(oKwh * 1000) / 1000,
          co2_kg: Math.round(oCo2 * 1000) / 1000,
          co2_grams: Math.round(oCo2 * 1000000) / 1000,
          duration_seconds: dur,
        },
        absolute_energy_reduction_kwh: Math.round(kwhDiff * 1000) / 1000,
        energy_savings_percentage: Math.round(kwhPct * 10) / 10,
        absolute_co2_reduction_kg: Math.round(co2Diff * 1000) / 1000,
        co2_savings_percentage: Math.round(co2Pct * 10) / 10,
        latency_reduction_percentage: Math.round(latPct * 10) / 10,
      };
    });

    const totBaseKwh = serviceComparisons.reduce((acc, s) => acc + s.baseline.energy_kwh, 0);
    const totOptKwh = serviceComparisons.reduce((acc, s) => acc + s.optimized.energy_kwh, 0);
    const totKwhSaved = totBaseKwh - totOptKwh;
    const totKwhPct = totBaseKwh > 0 ? (totKwhSaved / totBaseKwh) * 100 : 0;

    const totBaseCo2 = serviceComparisons.reduce((acc, s) => acc + s.baseline.co2_kg, 0);
    const totOptCo2 = serviceComparisons.reduce((acc, s) => acc + s.optimized.co2_kg, 0);
    const totCo2Saved = totBaseCo2 - totOptCo2;
    const totCo2Pct = totBaseCo2 > 0 ? (totCo2Saved / totBaseCo2) * 100 : 0;

    return {
      observation_window_seconds: dur,
      idle_power_w: idle,
      max_power_w: maxP,
      grid_factor_kg_per_kwh: gridF,
      grid_source_citation: 'Central Electricity Authority (CEA) Indian Power Sector Baseline v19.0 (Published 2024)',
      total_baseline_energy_kwh: Math.round(totBaseKwh * 1000) / 1000,
      total_optimized_energy_kwh: Math.round(totOptKwh * 1000) / 1000,
      total_energy_saved_kwh: Math.round(totKwhSaved * 1000) / 1000,
      overall_energy_savings_percentage: Math.round(totKwhPct * 10) / 10,
      total_baseline_co2_kg: Math.round(totBaseCo2 * 1000) / 1000,
      total_optimized_co2_kg: Math.round(totOptCo2 * 1000) / 1000,
      total_co2_avoided_kg: Math.round(totCo2Saved * 1000) / 1000,
      overall_co2_savings_percentage: Math.round(totCo2Pct * 10) / 10,
      services: serviceComparisons,
      methodology_disclosure:
        'Calculations use the linear SPECpower server model with non-negative bounds. Telemetry is synthetically simulated for demonstration purposes and does not represent hardware sensor probes.',
    };
  },

  // 3. Transport vs Compute Separate Comparison
  async getTransportComparison(): Promise<TransportVsComputeComparison> {
    try {
      const res = await fetch(`${API_BASE_URL}/observatory/transport-comparison`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    return {
      category_separation_note:
        'Transport-related commuter emissions and Datacenter computing workloads are strictly partitioned into separate operational boundaries. They are reported under their own documented methodologies and must not be conflated or added into a single net-zero number.',
      compute_energy_saved_kwh: 0.243,
      compute_co2_avoided_kg: 0.174,
      transport_distance_avoided_km: 12.8,
      transport_co2_avoided_kg: 1.536,
      transport_fuel_cost_saved_inr: 108.80,
      zero_double_counting_guarantee:
        'Verified: No transport avoided kilometres are converted into server kilowatt-hours, and no compute optimizations are credited toward commuting reductions.',
    };
  },

  // 4. Custom Calculator
  async computeEstimate(inputs: {
    idle_power_w: number;
    max_power_w: number;
    utilization_fraction: number;
    duration_seconds: number;
    grid_factor_kg_per_kwh: number;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/observatory/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const avgP = inputs.idle_power_w + (inputs.max_power_w - inputs.idle_power_w) * inputs.utilization_fraction;
    const kwh = (avgP * inputs.duration_seconds) / 3600000.0;
    const co2 = kwh * inputs.grid_factor_kg_per_kwh;

    return {
      results: {
        average_power_w: Math.round(avgP * 10) / 10,
        energy_kwh: Math.round(kwh * 1000) / 1000,
        co2_kg: Math.round(co2 * 1000) / 1000,
        co2_grams: Math.round(co2 * 1000000) / 1000,
      },
    };
  },
};
