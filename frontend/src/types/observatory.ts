export interface WorkloadTelemetrySnapshot {
  mode_label: string;
  request_count: number;
  requests_per_second: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  cpu_utilization_pct: number;
  cpu_utilization_fraction: number;
  memory_usage_mb: number;
  optimization_techniques: string;
}

export interface ServiceWorkload {
  id: string;
  name: string;
  module: string;
  tech_stack: string;
  workload_type: string;
  observation_window_seconds: number;
  baseline: WorkloadTelemetrySnapshot;
  optimized: WorkloadTelemetrySnapshot;
}

export interface ScenarioEnergyEvaluation {
  utilization_pct: number;
  utilization_fraction: number;
  average_power_w: number;
  energy_kwh: number;
  co2_kg: number;
  co2_grams: number;
  duration_seconds: number;
}

export interface ServiceScenarioComparison {
  service_id: string;
  service_name: string;
  module: string;
  baseline: ScenarioEnergyEvaluation;
  optimized: ScenarioEnergyEvaluation;
  absolute_energy_reduction_kwh: number;
  energy_savings_percentage: number;
  absolute_co2_reduction_kg: number;
  co2_savings_percentage: number;
  latency_reduction_percentage: number;
}

export interface ObservatoryScenariosSummary {
  observation_window_seconds: number;
  idle_power_w: number;
  max_power_w: number;
  grid_factor_kg_per_kwh: number;
  grid_source_citation: string;
  total_baseline_energy_kwh: number;
  total_optimized_energy_kwh: number;
  total_energy_saved_kwh: number;
  overall_energy_savings_percentage: number;
  total_baseline_co2_kg: number;
  total_optimized_co2_kg: number;
  total_co2_avoided_kg: number;
  overall_co2_savings_percentage: number;
  services: ServiceScenarioComparison[];
  methodology_disclosure: string;
}

export interface TransportVsComputeComparison {
  category_separation_note: string;
  compute_energy_saved_kwh: number;
  compute_co2_avoided_kg: number;
  transport_distance_avoided_km: number;
  transport_co2_avoided_kg: number;
  transport_fuel_cost_saved_inr: number;
  zero_double_counting_guarantee: string;
}
