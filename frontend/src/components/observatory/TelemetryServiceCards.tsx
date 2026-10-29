import React, { useState } from 'react';
import type { ServiceWorkload } from '../../types/observatory';
import { 
  Server, 
  Cpu, 
  Clock, 
  Activity, 
  Database, 
  Zap, 
  Info, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

interface TelemetryServiceCardsProps {
  services: ServiceWorkload[];
  observationDurationSeconds: number;
}

export const TelemetryServiceCards: React.FC<TelemetryServiceCardsProps> = ({
  services,
  observationDurationSeconds,
}) => {
  const [selectedMode, setSelectedMode] = useState<'baseline' | 'optimized' | 'side-by-side'>('side-by-side');

  const formatSeconds = (sec: number) => {
    if (sec >= 86400) return `${(sec / 86400).toFixed(1)} days (${sec.toLocaleString()}s)`;
    if (sec >= 3600) return `${(sec / 3600).toFixed(1)} hr (${sec.toLocaleString()}s)`;
    return `${Math.round(sec / 60)} min (${sec.toLocaleString()}s)`;
  };

  return (
    <div className="space-y-5">
      {/* 1. Mandatory Scientific & Transparency Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-950 flex items-center gap-2">
            <span>SCIENTIFIC DISCLOSURE: Analytical Simulation Methodology</span>
            <span className="bg-amber-200/80 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
              ESTIMATE ONLY
            </span>
          </div>
          <p className="leading-relaxed text-amber-900/90">
            Telemetry metrics below represent seeded, reproducible application benchmarks operating across a 
            standardized observation window of <strong>{formatSeconds(observationDurationSeconds)}</strong>. 
            Power values are calculated using the <strong>SPECpower linear server model</strong> and do not represent 
            real-time hardware motherboard sensor probes (RAPL/IPMI).
          </p>
        </div>
      </div>

      {/* 2. Mode Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-slate-700">Display Workload Mode:</span>
        </div>
        <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-100 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedMode('side-by-side')}
            className={`px-3 py-1.5 rounded transition-all ${
              selectedMode === 'side-by-side'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side Comparison
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode('baseline')}
            className={`px-3 py-1.5 rounded transition-all ${
              selectedMode === 'baseline'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Baseline Only (Unoptimized)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode('optimized')}
            className={`px-3 py-1.5 rounded transition-all ${
              selectedMode === 'optimized'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Optimized Only (Batch/Cached)
          </button>
        </div>
      </div>

      {/* 3. Service Workload Cards */}
      <div className="grid grid-cols-1 gap-5">
        {services.map((svc) => {
          const cpuDelta = svc.baseline.cpu_utilization_pct - svc.optimized.cpu_utilization_pct;
          const latencyDelta = svc.baseline.avg_latency_ms - svc.optimized.avg_latency_ms;
          const latencyPct = ((latencyDelta / svc.baseline.avg_latency_ms) * 100).toFixed(1);

          return (
            <div
              key={svc.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg shrink-0 mt-0.5">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-base">{svc.name}</h3>
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {svc.id}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium rounded">
                        {svc.module}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {svc.workload_type} &bull; <span className="font-mono text-slate-600">{svc.tech_stack}</span>
                    </p>
                  </div>
                </div>

                {/* Performance Summary Pill */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-1.5 text-xs text-emerald-800 self-start md:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">+{latencyPct}% Faster</span>
                    <span className="text-emerald-700 ml-1">({latencyDelta.toFixed(0)}ms latency reduction)</span>
                  </div>
                </div>
              </div>

              {/* Workload Profile Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {/* Baseline Snapshot Card */}
                {(selectedMode === 'side-by-side' || selectedMode === 'baseline') && (
                  <div className={`p-4 rounded-lg border ${
                    selectedMode === 'baseline' ? 'lg:col-span-2' : ''
                  } bg-slate-50/60 border-slate-200/80`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                          Baseline Workload
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {svc.baseline.mode_label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-2.5 rounded border border-slate-200/70">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-slate-400" />
                          <span>Requests</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                          {svc.baseline.request_count.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {svc.baseline.requests_per_second.toFixed(2)} req/s
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-slate-200/70">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Avg Latency</span>
                        </div>
                        <div className="font-mono font-bold text-amber-700 text-sm mt-0.5">
                          {svc.baseline.avg_latency_ms.toFixed(1)} ms
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          p95: {svc.baseline.p95_latency_ms.toFixed(0)} ms
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-slate-200/70">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-slate-400" />
                          <span>CPU Load</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                          {svc.baseline.cpu_utilization_pct.toFixed(1)}%
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-amber-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(svc.baseline.cpu_utilization_pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-slate-200/70">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Database className="w-3 h-3 text-slate-400" />
                          <span>Memory</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                          {svc.baseline.memory_usage_mb} MB
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Footprint
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">Applied Tech:</span>
                      <span className="font-mono text-slate-600">{svc.baseline.optimization_techniques}</span>
                    </div>
                  </div>
                )}

                {/* Optimized Snapshot Card */}
                {(selectedMode === 'side-by-side' || selectedMode === 'optimized') && (
                  <div className={`p-4 rounded-lg border ${
                    selectedMode === 'optimized' ? 'lg:col-span-2' : ''
                  } bg-emerald-50/40 border-emerald-200/70`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <span className="font-semibold text-xs text-emerald-950 uppercase tracking-wider">
                          Optimized Workload
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-mono">
                        {svc.optimized.mode_label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-2.5 rounded border border-emerald-100">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-slate-400" />
                          <span>Requests</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                          {svc.optimized.request_count.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {svc.optimized.requests_per_second.toFixed(2)} req/s
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-emerald-100">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Avg Latency</span>
                        </div>
                        <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                          {svc.optimized.avg_latency_ms.toFixed(1)} ms
                        </div>
                        <div className="text-[10px] text-emerald-600 font-mono">
                          p95: {svc.optimized.p95_latency_ms.toFixed(0)} ms
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-emerald-100">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-slate-400" />
                          <span>CPU Load</span>
                        </div>
                        <div className="font-mono font-bold text-emerald-800 text-sm mt-0.5">
                          {svc.optimized.cpu_utilization_pct.toFixed(1)}%
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(svc.optimized.cpu_utilization_pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-emerald-100">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Database className="w-3 h-3 text-slate-400" />
                          <span>Memory</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                          {svc.optimized.memory_usage_mb} MB
                        </div>
                        <div className="text-[10px] text-emerald-600">
                          -{(svc.baseline.memory_usage_mb - svc.optimized.memory_usage_mb)} MB
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-emerald-200/60 text-[11px] text-emerald-900 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="font-medium text-emerald-950">Active Optimizations:</span>
                      <span className="font-mono text-emerald-800">{svc.optimized.optimization_techniques}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Delta Callout */}
              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-3.5 py-2 rounded-lg border border-slate-200/60 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Utilization Differential:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {svc.baseline.cpu_utilization_pct.toFixed(1)}% &rarr; {svc.optimized.cpu_utilization_pct.toFixed(1)}%
                  </span>
                  <span className="text-emerald-700 font-medium">
                    (&minus;{cpuDelta.toFixed(1)}% absolute CPU reduction)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Observation Window: <span className="font-mono font-semibold">{svc.observation_window_seconds}s</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
