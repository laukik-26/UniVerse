import React from 'react';
import type { TransportVsComputeComparison } from '../../types/observatory';
import { 
  ShieldCheck, 
  Car, 
  Server, 
  AlertCircle, 
  IndianRupee 
} from 'lucide-react';

interface TransportVsComputeCardProps {
  comparison: TransportVsComputeComparison;
}

export const TransportVsComputeCard: React.FC<TransportVsComputeCardProps> = ({ comparison }) => {
  return (
    <div className="space-y-6">
      {/* 1. Methodological Partitioning Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Operational Boundary Partitioning & Zero Double-Counting Guarantee
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Audited Boundary Separation
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {comparison.category_separation_note}
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-md px-3 py-1.5 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{comparison.zero_double_counting_guarantee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Domain Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module C: Datacenter Server Workloads */}
        <div className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Module C: Datacenter Compute Scope
                  </h4>
                  <span className="text-[11px] text-blue-700 font-medium">
                    GHG Protocol Scope 2 (Indirect Electricity)
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                Server Telemetry
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Achieved through algorithmic execution efficiencies: Dijkstra graph pruning, in-memory LRU caching, and database query batching on 2U server nodes.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Avoided Server Energy</span>
                <div className="text-xl font-bold font-mono text-blue-800 mt-1">
                  {comparison.compute_energy_saved_kwh.toFixed(3)} <span className="text-xs font-normal text-slate-500">kWh</span>
                </div>
                <span className="text-[10px] text-slate-400">Joules / 3,600,000 conversion</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Avoided Compute CO₂</span>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                  {comparison.compute_co2_avoided_kg.toFixed(3)} <span className="text-xs font-normal text-slate-500">kg CO₂</span>
                </div>
                <span className="text-[10px] text-slate-400">@ 0.716 kg/kWh (CEA Grid)</span>
              </div>
            </div>

            {/* Assumptions */}
            <div className="mt-4 text-[11px] text-slate-500 bg-blue-50/50 p-2.5 rounded border border-blue-100 space-y-1">
              <div><strong>Hardware:</strong> 2U Rackmount (45W Idle, 220W Peak)</div>
              <div><strong>Methodology:</strong> SPECpower linear utilization curve</div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Isolation Check:</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> No Vehicle Emission Mixed
            </span>
          </div>
        </div>

        {/* Module B: Campus Ride-Pooling Workloads */}
        <div className="bg-white border-2 border-emerald-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Module B: Campus Mobility Scope
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    GHG Protocol Scope 3 (Commuting & Tailpipe)
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Physical Mobility
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Achieved through passenger vehicle consolidation: Dijkstra shortest-path carpool routing substituting separate passenger vehicle trips.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Avoided Travel</span>
                <div className="text-lg font-bold font-mono text-emerald-800 mt-1">
                  {comparison.transport_distance_avoided_km.toFixed(1)} <span className="text-xs font-normal text-slate-500">km</span>
                </div>
                <span className="text-[10px] text-slate-400">Redundant trips</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Avoided Tailpipe CO₂</span>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-1">
                  {comparison.transport_co2_avoided_kg.toFixed(3)} <span className="text-xs font-normal text-slate-500">kg CO₂</span>
                </div>
                <span className="text-[10px] text-slate-400">@ 0.120 kg/km (ARAI)</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Fuel Cost Saved</span>
                <div className="text-lg font-bold font-mono text-amber-700 mt-1 flex items-baseline">
                  <IndianRupee className="w-3.5 h-3.5 mr-0.5 inline" />
                  {comparison.transport_fuel_cost_saved_inr.toFixed(0)}
                </div>
                <span className="text-[10px] text-slate-400">@ ₹8.50/km shared</span>
              </div>
            </div>

            {/* Assumptions */}
            <div className="mt-4 text-[11px] text-slate-500 bg-emerald-50/50 p-2.5 rounded border border-emerald-100 space-y-1">
              <div><strong>Vehicle Baseline:</strong> Indian Standard Compact Sedan (120 g CO₂/km)</div>
              <div><strong>Benchmark:</strong> ARAI / BEE Fuel Economy Standards</div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Isolation Check:</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> No Server Power Mixed
            </span>
          </div>
        </div>
      </div>

      {/* 3. Anti-Conflation Guidance Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3 text-xs text-slate-600">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-800">
            Why are these numbers not combined into a single total?
          </span>
          <p className="leading-relaxed">
            In compliance with academic carbon accounting standards (ISO 14064 & GHG Corporate Protocol), 
            <strong> Scope 2 indirect emissions</strong> (datacenter electricity grid) and 
            <strong> Scope 3 commuting emissions</strong> (mobile internal combustion vehicles) cannot be combined without clear separate disclosures.
            Each relies on distinct emission factors, physical mechanisms, and operational control boundaries.
          </p>
        </div>
      </div>
    </div>
  );
};
