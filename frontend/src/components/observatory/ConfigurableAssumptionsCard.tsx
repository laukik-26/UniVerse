import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Check, 
  Calculator 
} from 'lucide-react';

interface ConfigurableAssumptionsCardProps {
  currentIdlePower: number;
  currentMaxPower: number;
  currentGridFactor: number;
  currentDurationSeconds: number;
  onApplyAssumptions: (params: {
    idle_power_w: number;
    max_power_w: number;
    grid_factor_kg_per_kwh: number;
    duration_seconds: number;
  }) => void;
}

interface GridPreset {
  label: string;
  factor: number;
  citation: string;
  badge: string;
}

const GRID_PRESETS: GridPreset[] = [
  {
    label: 'Indian National Grid (CEA v19.0)',
    factor: 0.716,
    citation: 'Central Electricity Authority (CEA) CO₂ Baseline Database for the Indian Power Sector v19.0 (Published 2024)',
    badge: 'Campus Standard',
  },
  {
    label: 'US National Average (EPA eGRID)',
    factor: 0.371,
    citation: 'US EPA Emissions & Generation Resource Integrated Database (eGRID 2024 National Weighted Average)',
    badge: 'US Grid',
  },
  {
    label: 'EU-27 Average (EEA 2023)',
    factor: 0.210,
    citation: 'European Environment Agency (EEA) Greenhouse Gas Emission Intensity of Electricity Generation 2023',
    badge: 'EU Standard',
  },
  {
    label: '100% Campus Solar Microgrid',
    factor: 0.000,
    citation: 'On-site rooftop solar photovoltaic generation with zero direct operational grid carbon intensity',
    badge: 'Zero Grid',
  },
];

export const ConfigurableAssumptionsCard: React.FC<ConfigurableAssumptionsCardProps> = ({
  currentIdlePower,
  currentMaxPower,
  currentGridFactor,
  currentDurationSeconds,
  onApplyAssumptions,
}) => {
  // Config state
  const [idlePower, setIdlePower] = useState(currentIdlePower);
  const [maxPower, setMaxPower] = useState(currentMaxPower);
  const [gridFactor, setGridFactor] = useState(currentGridFactor);
  const [durationSeconds, setDurationSeconds] = useState(currentDurationSeconds);

  // Live Sandbox Single Workload Simulation
  const [sandboxUtil, setSandboxUtil] = useState(50); // %

  const handleApply = () => {
    onApplyAssumptions({
      idle_power_w: idlePower,
      max_power_w: maxPower,
      grid_factor_kg_per_kwh: gridFactor,
      duration_seconds: durationSeconds,
    });
  };

  const handleResetDefaults = () => {
    setIdlePower(45.0);
    setMaxPower(220.0);
    setGridFactor(0.716);
    setDurationSeconds(3600);
    onApplyAssumptions({
      idle_power_w: 45.0,
      max_power_w: 220.0,
      grid_factor_kg_per_kwh: 0.716,
      duration_seconds: 3600,
    });
  };

  // Sandbox Live Formula calculations
  const uFrac = sandboxUtil / 100.0;
  const sandboxAvgPower = idlePower + (maxPower - idlePower) * uFrac;
  const sandboxKwh = (sandboxAvgPower * durationSeconds) / 3600000.0;
  const sandboxCo2Kg = sandboxKwh * gridFactor;
  const sandboxCo2Grams = sandboxCo2Kg * 1000.0;

  return (
    <div className="space-y-6">
      {/* 1. Global Model Parameters Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Configurable Hardware & Emission Parameters
              </h3>
              <p className="text-xs text-slate-500">
                Adjust server benchmark ratings, duration windows, and verified power-grid carbon intensities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Parameters
            </button>
          </div>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* Idle Power Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="idle-power-input" className="font-semibold text-slate-700 flex items-center gap-1">
                <span>Idle Server Power (P_idle)</span>
                <span className="text-[10px] text-slate-400 font-normal">(SPECpower baseline)</span>
              </label>
              <span className="font-mono font-bold text-blue-700 text-sm">
                {idlePower.toFixed(1)} W
              </span>
            </div>
            <input
              id="idle-power-input"
              type="range"
              min="10"
              max="150"
              step="1"
              value={idlePower}
              onChange={(e) => setIdlePower(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10 W (Low-power NUC)</span>
              <span>45 W (Standard 2U rack)</span>
              <span>150 W (Dual-socket blade)</span>
            </div>
          </div>

          {/* Peak Power Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="max-power-input" className="font-semibold text-slate-700 flex items-center gap-1">
                <span>Peak Load Power (P_max)</span>
                <span className="text-[10px] text-slate-400 font-normal">(100% CPU benchmark)</span>
              </label>
              <span className="font-mono font-bold text-blue-700 text-sm">
                {maxPower.toFixed(1)} W
              </span>
            </div>
            <input
              id="max-power-input"
              type="range"
              min="80"
              max="600"
              step="5"
              value={maxPower}
              onChange={(e) => setMaxPower(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>80 W (Edge node)</span>
              <span>220 W (Standard server)</span>
              <span>600 W (High-density GPU node)</span>
            </div>
          </div>

          {/* Observation Duration */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="duration-input" className="font-semibold text-slate-700">
                Observation Window Duration
              </label>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {durationSeconds} seconds
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '15 Min', sec: 900 },
                { label: '1 Hour', sec: 3600 },
                { label: '24 Hours', sec: 86400 },
                { label: '30 Days', sec: 2592000 },
              ].map((btn) => (
                <button
                  key={btn.sec}
                  type="button"
                  onClick={() => setDurationSeconds(btn.sec)}
                  className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors ${
                    durationSeconds === btn.sec
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">Custom seconds:</span>
              <input
                id="duration-input"
                type="number"
                min="1"
                max="31536000"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-28 px-2 py-1 text-xs border border-slate-200 rounded font-mono"
              />
            </div>
          </div>

          {/* Grid Emission Factor Presets */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700">
                Grid Emission Factor (f_grid)
              </label>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {gridFactor.toFixed(3)} kg CO₂/kWh
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GRID_PRESETS.map((preset) => (
                <button
                  key={preset.factor}
                  type="button"
                  onClick={() => setGridFactor(preset.factor)}
                  className={`p-2 rounded text-left border transition-all ${
                    gridFactor === preset.factor
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold line-clamp-1">{preset.label}</span>
                    <span className="text-[9px] px-1 bg-slate-200/70 text-slate-700 rounded font-mono">
                      {preset.factor.toFixed(3)}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">Custom factor (kg/kWh):</span>
              <input
                type="number"
                min="0.000"
                max="3.000"
                step="0.001"
                value={gridFactor}
                onChange={(e) => setGridFactor(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-28 px-2 py-1 text-xs border border-slate-200 rounded font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive "What-If" Workload Simulator Sandbox */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Interactive Single-Node "What-If" Workload Simulator
              </h4>
              <p className="text-xs text-slate-500">
                Directly evaluate how varying CPU utilization impacts power, energy, and carbon output under your active parameters.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-700">
            Linear SPECpower Testbed
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {/* Workload Utilization Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="sandbox-util-input" className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span>Simulated CPU Utilization (u):</span>
                <span className="text-slate-500 font-mono">{(uFrac).toFixed(3)} fraction</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSandboxUtil(0)}
                  className="px-2 py-0.5 text-[10px] bg-slate-200 rounded hover:bg-slate-300 text-slate-700"
                >
                  0% (Idle Test)
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxUtil(100)}
                  className="px-2 py-0.5 text-[10px] bg-slate-200 rounded hover:bg-slate-300 text-slate-700"
                >
                  100% (Peak Test)
                </button>
                <span className="font-mono font-bold text-base text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {sandboxUtil}%
                </span>
              </div>
            </div>
            <input
              id="sandbox-util-input"
              type="range"
              min="0"
              max="100"
              step="1"
              value={sandboxUtil}
              onChange={(e) => setSandboxUtil(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Real-time Math Output Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Calculated Power (P_avg)
              </span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                {sandboxAvgPower.toFixed(1)} <span className="text-xs font-normal text-slate-500">Watts</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {idlePower} + ({maxPower}-{idlePower})×{uFrac.toFixed(2)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Energy Consumed
              </span>
              <div className="text-lg font-bold font-mono text-blue-700 mt-1">
                {sandboxKwh.toFixed(4)} <span className="text-xs font-normal text-slate-500">kWh</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {(sandboxAvgPower * durationSeconds).toLocaleString()} Joules
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Emissions (kg CO₂)
              </span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-1">
                {sandboxCo2Kg.toFixed(4)} <span className="text-xs font-normal text-slate-500">kg</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {sandboxKwh.toFixed(4)} × {gridFactor.toFixed(3)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Emissions (grams CO₂)
              </span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                {sandboxCo2Grams.toFixed(1)} <span className="text-xs font-normal text-slate-500">grams</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Standard metric grams
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
