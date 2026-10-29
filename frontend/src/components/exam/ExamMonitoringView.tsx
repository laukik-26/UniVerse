import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Camera, 
  RefreshCw 
} from 'lucide-react';
import { ExamProctorBanner } from './ExamProctorBanner';
import { IncidentReviewTable } from './IncidentReviewTable';
import { IncidentDetailModal } from './IncidentDetailModal';
import { ObservableRulesVisualizer } from './ObservableRulesVisualizer';
import { ControlledCameraFeed } from './ControlledCameraFeed';
import { examApi } from '../../services/examApi';
import type { ExamIncident, IncidentStatus } from '../../types/exam';

interface ExamMonitoringViewProps {
  onActivityLogged?: (title: string, type?: 'info' | 'success' | 'warning') => void;
}

type TabType = 'queue' | 'rules' | 'station';

export const ExamMonitoringView: React.FC<ExamMonitoringViewProps> = ({ onActivityLogged }) => {
  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [incidents, setIncidents] = useState<ExamIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<ExamIncident | null>(null);
  const [loading, setLoading] = useState(true);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await examApi.getIncidents();
      setIncidents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleQuickUpdateStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    const updated = await examApi.updateStatus(
      incidentId,
      newStatus,
      'Quick action from proctor queue table.',
      'Proctor Meaghan'
    );
    setIncidents(prev => prev.map(i => i.id === incidentId ? updated : i));

    if (onActivityLogged) {
      const actionLabel = newStatus.replace('_', ' ').toUpperCase();
      onActivityLogged(
        `Incident ${updated.id} (${updated.desk_label}) marked as ${actionLabel} by Proctor Meaghan`,
        newStatus === 'resolved' || newStatus === 'dismissed' ? 'success' : 'info'
      );
    }
  };

  const handleModalUpdate = (updated: ExamIncident) => {
    setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
    setSelectedIncident(updated);
    if (onActivityLogged) {
      onActivityLogged(
        `Incident ${updated.id} evaluated: Status changed to ${updated.status}`,
        'info'
      );
    }
  };

  // KPIs
  const totalCount = incidents.length;
  const pendingCount = incidents.filter(i => i.status === 'pending_review').length;
  const inReviewCount = incidents.filter(i => i.status === 'in_review').length;
  const clearedCount = incidents.filter(i => i.status === 'dismissed' || i.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Responsible Examination Monitoring
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              Module E Active
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Human-centered invigilation with observable geometric rules, audit trails, and strict non-punitive safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadIncidents}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* 2. Top ERP KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Flagged Cues</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500">Incidents</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            100% human-audited queue
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Proctor Review</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700">{pendingCount}</span>
            <span className="text-xs text-slate-500">Unreviewed</span>
          </div>
          <div className="mt-1 text-xs text-amber-700 font-medium">
            Requires invigilator inspection
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Under Active Review</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-700">{inReviewCount}</span>
            <span className="text-xs text-slate-500">In Progress</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Proctor verifying evidence
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cleared / Resolved</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">{clearedCount}</span>
            <span className="text-xs text-emerald-700 font-semibold">Cases Closed</span>
          </div>
          <div className="mt-1 text-xs text-emerald-700">
            0 automated penalties applied
          </div>
        </div>
      </div>

      {/* 3. Mandatory Ethical Policy Banner */}
      <ExamProctorBanner />

      {/* 4. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'queue'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Incident Review Queue</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
              {incidents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Observable Rules Testbed</span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.2 rounded font-mono">
              2 Rules
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('station')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'station'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Proctor Station</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
              Local Feed
            </span>
          </button>
        </nav>
      </div>

      {/* 5. Tab Panels */}
      {activeTab === 'queue' && (
        <IncidentReviewTable
          incidents={incidents}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          onQuickUpdateStatus={handleQuickUpdateStatus}
        />
      )}

      {activeTab === 'rules' && (
        <ObservableRulesVisualizer />
      )}

      {activeTab === 'station' && (
        <ControlledCameraFeed />
      )}

      {/* 6. Modal for incident inspection & audit */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdate={handleModalUpdate}
      />
    </div>
  );
};
