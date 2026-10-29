import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import type { ModuleId } from '../../types/navigation';
import { academicApi } from '../../services/academicApi';
import { ridesApi } from '../../services/ridesApi';
import { observatoryApi } from '../../services/observatoryApi';
import { examApi } from '../../services/examApi';
import type { PlacementProgress } from '../../types/academic';
import type { DriverRide } from '../../types/rides';
import type { ObservatoryScenariosSummary, TransportVsComputeComparison } from '../../types/observatory';
import type { ExamIncident, ExamAuditLogEntry } from '../../types/exam';

interface OverviewViewProps {
  onNavigateModule: (module: ModuleId) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateModule }) => {
  const [placementProgress, setPlacementProgress] = useState<PlacementProgress>({
    total_tasks: 8,
    completed_tasks: 4,
    completion_percentage: 50.0,
    tasks_by_category: {
      'DSA': { total: 2, completed: 1, percent: 50 },
      'Development': { total: 2, completed: 1, percent: 50 },
      'CS Fundamentals': { total: 2, completed: 1, percent: 50 },
      'Aptitude': { total: 1, completed: 1, percent: 100 },
      'Interview Prep': { total: 1, completed: 0, percent: 0 },
    },
  });
  const [activeRides, setActiveRides] = useState<DriverRide[]>([]);
  const [observatoryScenarios, setObservatoryScenarios] = useState<ObservatoryScenariosSummary | null>(null);
  const [transportSavings, setTransportSavings] = useState<TransportVsComputeComparison | null>(null);
  const [examIncidents, setExamIncidents] = useState<ExamIncident[]>([]);
  const [examAuditLog, setExamAuditLog] = useState<ExamAuditLogEntry[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [prog, rides, scn, trn, incs, audits] = await Promise.all([
          academicApi.getPlacementProgress(),
          ridesApi.getDriverRides('all'),
          observatoryApi.getScenarios(),
          observatoryApi.getTransportComparison(),
          examApi.getIncidents(),
          examApi.getAuditTrail(),
        ]);

        if (isMounted) {
          if (prog) setPlacementProgress(prog);
          if (rides) setActiveRides(rides);
          if (scn) setObservatoryScenarios(scn);
          if (trn) setTransportSavings(trn);
          if (incs) setExamIncidents(incs);
          if (audits) setExamAuditLog(audits);
        }
      } catch (err) {
        console.warn('Dashboard data fetch fallback:', err);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  const totalFlaggedIncidents = examIncidents.length;
  const pendingIncidents = examIncidents.filter(i => i.status === 'pending_review').length;
  const resolvedIncidents = examIncidents.filter(i => i.status === 'dismissed' || i.status === 'resolved').length;
  const computeKwhSaved = observatoryScenarios?.total_energy_saved_kwh ?? 0.243;
  const computePctSaved = observatoryScenarios?.overall_energy_savings_percentage ?? 46.1;

  const transportKmSaved = transportSavings?.transport_distance_avoided_km ?? 19.2;
  const transportCo2Saved = transportSavings?.transport_co2_avoided_kg ?? 2.304;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Campus Ecosystem Overview"
        subtitle="Cross-module telemetry, resource optimization, and governance status across UniVerse."
      />

      {/* 2. Top KPI StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Placement readiness"
          value={`${placementProgress.completion_percentage.toFixed(0)}%`}
          subtext={`${placementProgress.completed_tasks} of ${placementProgress.total_tasks} checklist items`}
          dotVariant="info"
          onClick={() => onNavigateModule('academic-hub')}
        />

        <StatCard
          label="Active carpool routes"
          value={activeRides.filter(r => r.status === 'active').length.toString()}
          subtext={`${activeRides.length} total scheduled rides`}
          dotVariant="neutral"
          onClick={() => onNavigateModule('ride-pooling')}
        />

        <StatCard
          label="Compute energy avoided"
          value={`${computeKwhSaved.toFixed(3)} kWh`}
          subtext={`-${computePctSaved.toFixed(1)}% vs baseline telemetry`}
          dotVariant="success"
          onClick={() => onNavigateModule('sustainable-compute')}
        />

        <StatCard
          label="Human-audited cues"
          value={`${resolvedIncidents}/${totalFlaggedIncidents}`}
          subtext={pendingIncidents > 0 ? `${pendingIncidents} pending proctor review` : 'All incidents evaluated'}
          dotVariant={pendingIncidents > 0 ? 'warning' : 'success'}
          onClick={() => onNavigateModule('exam-monitoring')}
        />
      </div>

      {/* 3. Scope Partition Disclosure Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">
              GHG Protocol Scope Partitioning
            </span>
            <span className="text-slate-500">
              Scope 2 server workloads ({computeKwhSaved.toFixed(3)} kWh avoided) and Scope 3 commuting mobility ({transportKmSaved.toFixed(1)} km avoided, {transportCo2Saved.toFixed(3)} kg CO₂) are partitioned without double-counting.
            </span>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigateModule('sustainable-compute')}
        >
          View partition
        </Button>
      </div>

      {/* 4. Middle Row: Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Operational Distribution */}
        <Card
          title="Ecosystem Health"
          subtitle="Cross-module activity distribution"
          className="lg:col-span-4 flex flex-col justify-between"
          bodyClassName="p-5 flex flex-col justify-between flex-1"
        >
          <div className="relative py-4 flex flex-col items-center justify-center">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="68" fill="none" stroke="#F1F5F9" strokeWidth="10" />
              <circle
                cx="80" cy="80" r="68" fill="none" stroke="#3B82F6" strokeWidth="10"
                strokeDasharray="427"
                strokeDashoffset={427 * (1 - placementProgress.completion_percentage / 100)}
                strokeLinecap="round"
              />

              <circle cx="80" cy="80" r="52" fill="none" stroke="#F8FAFC" strokeWidth="10" />
              <circle
                cx="80" cy="80" r="52" fill="none" stroke="#6366F1" strokeWidth="10"
                strokeDasharray="326"
                strokeDashoffset="80"
                strokeLinecap="round"
              />

              <circle cx="80" cy="80" r="36" fill="none" stroke="#F8FAFC" strokeWidth="10" />
              <circle
                cx="80" cy="80" r="36" fill="none" stroke="#10B981" strokeWidth="10"
                strokeDasharray="226"
                strokeDashoffset="60"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-semibold font-mono text-slate-900 leading-tight">5/5</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Active Modules</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div className="border-l-2 border-blue-500 pl-2 text-left">
              <span className="font-semibold text-slate-900 block font-mono">{placementProgress.completion_percentage.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-500 truncate block">Academic</span>
            </div>
            <div className="border-l-2 border-indigo-500 pl-2 text-left">
              <span className="font-semibold text-slate-900 block font-mono">{activeRides.length}</span>
              <span className="text-[10px] text-slate-500 truncate block">Rides</span>
            </div>
            <div className="border-l-2 border-emerald-500 pl-2 text-left">
              <span className="font-semibold text-slate-900 block font-mono">-{computePctSaved.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-500 truncate block">Compute</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Carbon Accounting Partition */}
        <Card
          title="Carbon Accounting Partition"
          subtitle="Scope 2 datacenter vs Scope 3 commuting"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateModule('sustainable-compute')}
            >
              Details
            </Button>
          }
          className="lg:col-span-4 flex flex-col justify-between"
          bodyClassName="p-5 flex flex-col justify-between flex-1"
        >
          <div className="py-2 space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Scope 2 datacenter energy
                </span>
                <span className="font-mono font-semibold text-slate-900">{computeKwhSaved.toFixed(3)} kWh saved</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, computePctSaved)}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">SPECpower workload optimization</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Scope 3 commuting tailpipe
                </span>
                <span className="font-mono font-semibold text-slate-900">{transportKmSaved.toFixed(1)} km avoided</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Dijkstra passenger route optimization</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> No double-counting
            </span>
            <span className="font-mono text-slate-400">Strictly isolated</span>
          </div>
        </Card>

        {/* Card 3: Proctor Review Queue */}
        <Card
          title="Responsible Proctor Queue"
          subtitle="Human-verified invigilation audit status"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateModule('exam-monitoring')}
            >
              Review
            </Button>
          }
          className="lg:col-span-4 flex flex-col justify-between"
          bodyClassName="p-5 flex flex-col justify-between flex-1"
        >
          <div className="py-2 space-y-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-medium text-slate-500 block">Flagged cues</span>
                <span className="font-mono font-semibold text-slate-900 text-sm">{totalFlaggedIncidents} incidents</span>
              </div>
              <StatusBadge status="pending_review" label={`${pendingIncidents} pending`} />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-medium text-slate-500 block">Automated penalties</span>
                <span className="font-mono font-semibold text-emerald-700 text-sm">0 (Strict zero)</span>
              </div>
              <StatusBadge status="resolved" label="Non-punitive" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Audit trail entries:</span>
            <span className="font-mono font-semibold text-slate-800">{examAuditLog.length} records</span>
          </div>
        </Card>
      </div>

      {/* 5. Bottom Row: 2 Clean Enterprise Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Table 1: Live Campus Operations */}
        <Card
          title="Active Campus Operations"
          subtitle="Live rides and academic tasks"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateModule('ride-pooling')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View rides
            </Button>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200 text-xs">
                  <th className="py-2.5 px-4 font-medium">Subject</th>
                  <th className="py-2.5 px-3 font-medium">Service</th>
                  <th className="py-2.5 px-3 font-medium">Time</th>
                  <th className="py-2.5 px-4 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeRides.slice(0, 4).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                    <td className="py-2.5 px-4 font-medium text-slate-900 truncate max-w-xs">
                      {r.driver_name}: {r.origin_name} &rarr; {r.destination_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">Ride-Pooling</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{r.departure_time}</td>
                    <td className="py-2.5 px-4 text-right">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Table 2: Human Governance Audit Trail */}
        <Card
          title="Governance & Invigilation Audit Log"
          subtitle="Immutable review determinations"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateModule('exam-monitoring')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View audits
            </Button>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200 text-xs">
                  <th className="py-2.5 px-4 font-medium">Action</th>
                  <th className="py-2.5 px-3 font-medium">Actor</th>
                  <th className="py-2.5 px-3 font-medium">Time</th>
                  <th className="py-2.5 px-4 text-right font-medium">Determination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {examAuditLog.slice(0, 4).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                    <td className="py-2.5 px-4 font-medium text-slate-900 truncate max-w-xs">
                      {a.incident_id}: {a.notes}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{a.actor_role}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{a.timestamp}</td>
                    <td className="py-2.5 px-4 text-right">
                      <StatusBadge status={a.new_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
