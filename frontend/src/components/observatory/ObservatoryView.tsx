import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  Leaf, 
  Sliders, 
  BarChart3, 
  RefreshCw 
} from 'lucide-react';

import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
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

  const totalOptimizedKwh = scenariosSummary ? scenariosSummary.total_optimized_energy_kwh.toFixed(3) : '0.154';
  const baselineKwh = scenariosSummary ? scenariosSummary.total_baseline_energy_kwh.toFixed(3) : '0.397';
  const pctSaved = scenariosSummary ? scenariosSummary.overall_energy_savings_percentage.toFixed(1) : '61.2';
  const co2AvoidedKg = scenariosSummary ? scenariosSummary.total_co2_avoided_kg.toFixed(3) : '0.174';

  return (
    <div className="space-y-6">
      {/* 1. Page Heading */}
      <PageHeader
        title="Sustainable Computing Observatory"
        subtitle="Simulate, quantify, and optimize software workload energy consumption and carbon emissions."
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh telemetry
        </Button>
      </PageHeader>

      {/* 2. StatCard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total compute energy"
          value={`${totalOptimizedKwh} kWh`}
          subtext={`-${pctSaved}% vs baseline (${baselineKwh} kWh)`}
          dotVariant="info"
        />

        <StatCard
          label="Carbon avoided"
          value={`${co2AvoidedKg} kg CO₂`}
          subtext={`${((scenariosSummary?.total_co2_avoided_kg ?? 0.174) * 1000).toFixed(0)}g reduction per hr`}
          dotVariant="success"
        />

        <StatCard
          label="Active microservices"
          value={services.length}
          subtext="Placement, rides & search"
          dotVariant="neutral"
        />

        <StatCard
          label="Grid emissions factor"
          value={`${gridFactor.toFixed(3)}`}
          subtext="kg CO₂/kWh (CEA India benchmark)"
          dotVariant="neutral"
        />
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'telemetry'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Telemetry services</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scenarios')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'scenarios'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Scenario comparisons</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transport-vs-compute')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'transport-vs-compute'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Transport vs compute</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assumptions')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'assumptions'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configurable assumptions</span>
          </button>
        </nav>
      </div>

      {/* 4. Tab Panels */}
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
