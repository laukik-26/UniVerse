import React from 'react';
import type { ObservatoryScenariosSummary } from '../../types/observatory';
import { 
  Zap, 
  TrendingDown, 
  Leaf, 
  FileSpreadsheet, 
  Check, 
  Sparkles,
  BarChart2
} from 'lucide-react';

interface ScenarioComparisonViewProps {
  summary: ObservatoryScenariosSummary;
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({ summary }) => {
  return (
    <div className="space-y-6">
      {/* 1. High-Level Scenario Delta Summary Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">
                Energy & Carbon Optimization Differential
              </h3>
            </div>
            <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
              Comparative impact of deploying Tier-1 caching, prepared statement pooling, and Dijkstra graph pruning across all campus microservices.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold block">
              Global Energy Reduction
            </span>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {summary.overall_energy_savings_percentage > 0 ? `-${summary.overall_energy_savings_percentage.toFixed(1)}%` : '0.0%'}
            </div>
            <span className="text-[11px] text-emerald-200">
              Calculated dynamically from scenario telemetry
            </span>
          </div>
        </div>

        {/* 3 Metric Comparison Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="bg-white/10 rounded-lg p-3.5 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span>Total Energy (kWh)</span>
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-white">
                {summary.total_energy_saved_kwh.toFixed(3)}
              </span>
              <span className="text-xs text-emerald-300">kWh avoided</span>
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-1">
              Baseline: <span className="font-mono text-white">{summary.total_baseline_energy_kwh.toFixed(3)}</span> &rarr; Optimized: <span className="font-mono text-emerald-300">{summary.total_optimized_energy_kwh.toFixed(3)}</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3.5 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span>Carbon Emissions</span>
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-emerald-300">
                {summary.total_co2_avoided_kg.toFixed(3)}
              </span>
              <span className="text-xs text-emerald-300">kg CO₂ avoided</span>
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-1">
              Baseline: <span className="font-mono text-white">{summary.total_baseline_co2_kg.toFixed(3)} kg</span> &rarr; Optimized: <span className="font-mono text-emerald-300">{summary.total_optimized_co2_kg.toFixed(3)} kg</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3.5 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span>Grid Baseline Standard</span>
              <TrendingDown className="w-4 h-4 text-teal-300" />
            </div>
            <div className="mt-2">
              <div className="font-mono font-bold text-white text-base">
                {summary.grid_factor_kg_per_kwh.toFixed(3)} kg/kWh
              </div>
              <p className="text-[10px] text-emerald-200/90 mt-1 line-clamp-2">
                {summary.grid_source_citation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Proportional Comparison Bars */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-700" />
            <h4 className="font-semibold text-slate-800 text-sm">
              Workload Energy Consumption Proportions
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span className="text-slate-600">Baseline (Unoptimized)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600"></span>
              <span className="text-slate-600">Optimized (Active)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {summary.services.map((svc) => {
            const maxEnergy = Math.max(svc.baseline.energy_kwh, 0.001);
            const baselineWidth = 100;
            const optimizedWidth = Math.max(5, (svc.optimized.energy_kwh / maxEnergy) * 100);

            return (
              <div key={svc.service_id} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{svc.service_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 text-[11px]">
                      {svc.baseline.energy_kwh.toFixed(3)} kWh &rarr; {svc.optimized.energy_kwh.toFixed(3)} kWh
                    </span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      -{svc.energy_savings_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* Baseline bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex items-center">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${baselineWidth}%` }}
                    >
                      <span className="text-[9px] font-mono font-bold text-white leading-none">
                        {svc.baseline.energy_kwh.toFixed(3)} kWh
                      </span>
                    </div>
                  </div>
                  {/* Optimized bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex items-center">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${optimizedWidth}%` }}
                    >
                      <span className="text-[9px] font-mono font-bold text-white leading-none">
                        {svc.optimized.energy_kwh.toFixed(3)} kWh
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Service Scenario Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            <h4 className="font-semibold text-slate-800 text-sm">
              Granular Scenario Telemetry Matrix
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Observation Duration: <strong className="font-mono text-slate-700">{summary.observation_window_seconds}s</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Service Workload</th>
                <th className="py-3 px-3 text-center">Baseline Utilization</th>
                <th className="py-3 px-3 text-center">Optimized Utilization</th>
                <th className="py-3 px-3 text-right">Avg Power (W)</th>
                <th className="py-3 px-3 text-right">Energy (kWh)</th>
                <th className="py-3 px-3 text-right">Carbon (kg CO₂)</th>
                <th className="py-3 px-3 text-right">Delta (%)</th>
                <th className="py-3 px-4 text-center">Latency Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.services.map((svc) => (
                <tr key={svc.service_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div>{svc.service_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{svc.service_id}</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono font-semibold">
                      {svc.baseline.utilization_pct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-semibold">
                      {svc.optimized.utilization_pct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <div className="text-slate-500 line-through text-[11px]">{svc.baseline.average_power_w.toFixed(1)} W</div>
                    <div className="text-emerald-700 font-bold">{svc.optimized.average_power_w.toFixed(1)} W</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <div className="text-slate-500 line-through text-[11px]">{svc.baseline.energy_kwh.toFixed(3)}</div>
                    <div className="text-emerald-700 font-bold">{svc.optimized.energy_kwh.toFixed(3)}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <div className="text-slate-500 line-through text-[11px]">{svc.baseline.co2_kg.toFixed(3)}</div>
                    <div className="text-emerald-700 font-bold">{svc.optimized.co2_kg.toFixed(3)}</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                      -{svc.energy_savings_percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      +{svc.latency_reduction_percentage.toFixed(0)}% faster
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total Footer Row */}
            <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t-2 border-slate-200">
              <tr>
                <td className="py-3 px-4 text-slate-800">Total System Workload</td>
                <td className="py-3 px-3 text-center text-slate-500 font-mono">Aggregate</td>
                <td className="py-3 px-3 text-center text-slate-500 font-mono">Aggregate</td>
                <td className="py-3 px-3 text-right text-slate-500 font-mono">&mdash;</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800">
                  <span className="text-slate-400 font-normal line-through mr-1">
                    {summary.total_baseline_energy_kwh.toFixed(3)}
                  </span>
                  {summary.total_optimized_energy_kwh.toFixed(3)} kWh
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800">
                  <span className="text-slate-400 font-normal line-through mr-1">
                    {summary.total_baseline_co2_kg.toFixed(3)}
                  </span>
                  {summary.total_optimized_co2_kg.toFixed(3)} kg
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-mono font-bold text-xs">
                    -{summary.overall_energy_savings_percentage.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-slate-500">&mdash;</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. Documented Mathematical Formulas Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700">
        <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Underlying Computational Modeling Formulas</span>
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono bg-white p-3 rounded border border-slate-200">
          <div>
            <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Linear Server Power Model</span>
            <code className="text-slate-900 font-bold">P_avg = P_idle + (P_max - P_idle) × u</code>
            <p className="text-slate-500 font-sans text-[10px] mt-0.5">
              Where P_idle = {summary.idle_power_w}W, P_max = {summary.max_power_w}W, u = CPU load [0.0 - 1.0].
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Energy & Emissions Conversion</span>
            <code className="text-slate-900 font-bold">E_kWh = (P_avg × t) / 3,600,000 | CO₂ = E_kWh × f_grid</code>
            <p className="text-slate-500 font-sans text-[10px] mt-0.5">
              1 kWh = 3,600,000 Joules (Watt-seconds). f_grid = {summary.grid_factor_kg_per_kwh} kg CO₂/kWh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
