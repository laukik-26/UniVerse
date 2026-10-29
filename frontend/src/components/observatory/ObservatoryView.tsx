import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  Cpu, 
  Leaf, 
  Zap, 
  Sliders, 
  ShieldCheck, 
  RefreshCw, 
  TrendingDown, 
  Layers, 
  CheckCircle2, 
  BarChart3 
} from 'lucide-react';

import { TelemetryServiceCards } from './TelemetryServiceCards';
import { ScenarioComparisonView } from './ScenarioComparisonView';
import { TransportVsComputeCard } from './TransportVsComputeCard';
import { ConfigurableAssumptionsCard } from './ConfigurableAssumptionsCard';
import { observatoryApi } from '../../services/observatoryApi';
import type { 
  ServiceWorkload, 
  ObservatoryScenariosSummary, 
  TransportVsComputeComparison 
} from '../../types/observatory';

interface ObservatoryViewProps {
  onActivityLogged?: (title: string, type?: 'info' | 'success' | 'warning') => void;
}

type TabType = 'telemetry' | 'scenarios' | 'transport-vs-compute' | 'assumptions';

export const ObservatoryView: React.FC<ObservatoryViewProps> = ({ onActivityLogged }) => {
  const [activeTab, setActiveTab] = useState<TabType>('telemetry');
  const [loading, setLoading] = useState<boolean>(true);

  // Core Data
  const [services, setServices] = useState<ServiceWorkload[]>([]);
  const [scenariosSummary, setScenariosSummary] = useState<ObservatoryScenariosSummary | null>(null);
  const [transportComparison, setTransportComparison] = useState<TransportVsComputeComparison | null>(null);

  // Configurable Parameters State
  const [idlePower, setIdlePower] = useState<number>(45.0);
  const [maxPower, setMaxPower] = useState<number>(220.0);
  const [gridFactor, setGridFactor] = useState<number>(0.716);
  const [durationSeconds, setDurationSeconds] = useState<number>(3600);

  const loadData = useCallback(async (params?: {
    idle_power_w?: number;
    max_power_w?: number;
    grid_factor_kg_per_kwh?: number;
    duration_seconds?: number;
  }) => {
    setLoading(true);
    try {
      const [svcData, scnData, trnData] = await Promise.all([
        observatoryApi.getServices(),
        observatoryApi.getScenarios(params),
        observatoryApi.getTransportComparison(),
      ]);

      setServices(svcData);
      setScenariosSummary(scnData);
      setTransportComparison(trnData);
    } catch (err) {
      console.error('Error loading observatory telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData({
      idle_power_w: idlePower,
      max_power_w: maxPower,
      grid_factor_kg_per_kwh: gridFactor,
      duration_seconds: durationSeconds,
    });
  }, [loadData, idlePower, maxPower, gridFactor, durationSeconds]);

  const handleApplyAssumptions = (params: {
    idle_power_w: number;
    max_power_w: number;
    grid_factor_kg_per_kwh: number;
    duration_seconds: number;
  }) => {
    setIdlePower(params.idle_power_w);
    setMaxPower(params.max_power_w);
    setGridFactor(params.grid_factor_kg_per_kwh);
    setDurationSeconds(params.duration_seconds);

    loadData(params);

    if (onActivityLogged) {
      onActivityLogged(
        `Observatory Re-benchmarked: P_idle=${params.idle_power_w}W, P_max=${params.max_power_w}W, Grid=${params.grid_factor_kg_per_kwh} kg/kWh`,
        'info'
      );
    }
  };

  const handleRefresh = () => {
    loadData({
      idle_power_w: idlePower,
      max_power_w: maxPower,
      grid_factor_kg_per_kwh: gridFactor,
      duration_seconds: durationSeconds,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Sustainable Computing Observatory
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              Module C Active
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Simulate, quantify, and optimize software workload energy consumption and carbon emissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* 2. Compact ERP-Style KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Baseline vs Optimized Energy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Compute Energy</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {scenariosSummary ? scenariosSummary.total_optimized_energy_kwh.toFixed(3) : '0.154'}
            </span>
            <span className="text-xs text-slate-500 font-medium">kWh</span>
          </div>
          <div className="mt-1 flex items-center text-xs text-emerald-700 font-medium">
            <TrendingDown className="w-3.5 h-3.5 mr-1" />
            <span>
              {scenariosSummary ? `-${scenariosSummary.overall_energy_savings_percentage.toFixed(1)}%` : '-61.2%'} vs Baseline ({scenariosSummary?.total_baseline_energy_kwh.toFixed(3) ?? '0.397'} kWh)
            </span>
          </div>
        </div>

        {/* KPI 2: Net CO2 Avoided */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Avoided</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {scenariosSummary ? scenariosSummary.total_co2_avoided_kg.toFixed(3) : '0.174'}
            </span>
            <span className="text-xs text-slate-500 font-medium">kg CO₂</span>
          </div>
          <div className="mt-1 flex items-center text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>
              {scenariosSummary ? `${(scenariosSummary.total_co2_avoided_kg * 1000).toFixed(0)}g` : '174g'} reduction per observation hr
            </span>
          </div>
        </div>

        {/* KPI 3: Active Workloads Monitored */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Services</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {services.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Microservices</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Placement API, Resource Search, Ride Matcher
          </div>
        </div>

        {/* KPI 4: Active Grid Intensity Standard */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Operational Grid Baseline</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {gridFactor.toFixed(3)}
            </span>
            <span className="text-xs text-slate-500 font-medium">kg/kWh</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate" title="CEA Indian Power Sector Baseline v19.0 (2024)">
            CEA Indian Grid v19.0 (Published 2024)
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'telemetry'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Workload Telemetry</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-mono">
              3 Services
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scenarios')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'scenarios'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Scenario Comparison</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
              Baseline vs Optimized
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transport-vs-compute')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'transport-vs-compute'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Transport vs Compute Partition</span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.2 rounded font-semibold">
              Zero Double-Counting
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assumptions')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'assumptions'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configurable Model & Simulator</span>
          </button>
        </nav>
      </div>

      {/* 4. Tab Content Panels */}
      {activeTab === 'telemetry' && (
        <TelemetryServiceCards
          services={services}
          observationDurationSeconds={durationSeconds}
        />
      )}

      {activeTab === 'scenarios' && scenariosSummary && (
        <ScenarioComparisonView summary={scenariosSummary} />
      )}

      {activeTab === 'transport-vs-compute' && transportComparison && (
        <TransportVsComputeCard comparison={transportComparison} />
      )}

      {activeTab === 'assumptions' && (
        <ConfigurableAssumptionsCard
          currentIdlePower={idlePower}
          currentMaxPower={maxPower}
          currentGridFactor={gridFactor}
          currentDurationSeconds={durationSeconds}
          onApplyAssumptions={handleApplyAssumptions}
        />
      )}
    </div>
  );
};
