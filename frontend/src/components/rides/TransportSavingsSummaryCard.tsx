import React from 'react';
import { Leaf, Coins, Route, ShieldCheck, Car } from 'lucide-react';
import type { TransportSavingsSummary } from '../../types/rides';

interface TransportSavingsSummaryCardProps {
  savings: TransportSavingsSummary;
}

export const TransportSavingsSummaryCard: React.FC<TransportSavingsSummaryCardProps> = ({
  savings,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Campus Transit Sustainability Observatory</h3>
          <p className="text-xs text-slate-500">
            Cumulative vehicle-kilometre reductions and avoided commuter emissions across all completed pools.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Eco Commute Network
        </span>
      </div>

      {/* 4 Summary Metric Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Completed Pools */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Carpools
            </span>
          </div>
          <span className="text-2xl font-bold text-slate-900 block font-mono">
            {savings.total_carpools_completed}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {savings.active_rides_count} active offerings available
          </span>
        </div>

        {/* Metric 2: Avoided Distance */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Route className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avoided Travel
            </span>
          </div>
          <span className="text-2xl font-bold text-slate-900 block font-mono">
            {savings.total_saved_vkt_km.toFixed(1)} km
          </span>
          <span className="text-[11px] text-indigo-700 font-medium mt-1 block">
            Single-occupancy VKT eliminated
          </span>
        </div>

        {/* Metric 3: Travel Cost Saved */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fuel Cost Saved
            </span>
          </div>
          <span className="text-2xl font-bold text-slate-900 block font-mono">
            ₹{savings.total_cost_saved_inr.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Baseline: ₹{savings.assumed_cost_per_km_inr}/km
          </span>
        </div>

        {/* Metric 4: Avoided CO2 */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avoided CO₂e
            </span>
          </div>
          <span className="text-2xl font-bold text-emerald-800 block font-mono">
            {savings.total_co2_avoided_kg.toFixed(3)} kg
          </span>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {savings.assumed_emission_factor_g_km} g/km EPA car model
          </span>
        </div>
      </div>

      {/* Honest Methodology Footnote */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Methodology & Estimation Disclosure:</strong> {savings.methodology_note} All emissions values represent algorithmic projections calculated from vehicle-kilometre reductions and are separate from computing infrastructure emissions.
        </p>
      </div>
    </div>
  );
};
