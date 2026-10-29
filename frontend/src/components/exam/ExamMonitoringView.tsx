import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Sliders, 
  Camera, 
  RefreshCw 
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { ExamProctorBanner } from './ExamProctorBanner';
import { IncidentReviewTable } from './IncidentReviewTable';
import { IncidentDetailPanel } from './IncidentDetailPanel';
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
      {/* 1. Page Header */}
      <PageHeader
        title="Responsible Examination Monitoring"
        subtitle="Human-centered invigilation with observable geometric rules, audit trails, and strict non-punitive safeguards."
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={loadIncidents}
          disabled={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh queue
        </Button>
      </PageHeader>

      {/* 2. Top KPI StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total flagged cues"
          value={totalCount}
          subtext="100% human-audited queue"
          dotVariant="neutral"
        />

        <StatCard
          label="Pending proctor review"
          value={pendingCount}
          subtext="Requires invigilator inspection"
          dotVariant={pendingCount > 0 ? 'warning' : 'neutral'}
        />

        <StatCard
          label="Under active review"
          value={inReviewCount}
          subtext="Proctor verifying context"
          dotVariant={inReviewCount > 0 ? 'info' : 'neutral'}
        />

        <StatCard
          label="Cleared / resolved"
          value={clearedCount}
          subtext="0 automated penalties applied"
          dotVariant="success"
        />
      </div>

      {/* 3. Mandatory Ethical Disclosure Banner */}
      <ExamProctorBanner />

      {/* 4. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'queue'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Incident review queue</span>
            <span className="font-mono text-[10px] text-slate-400">({incidents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Observable rules testbed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('station')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'station'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live proctor station</span>
          </button>
        </nav>
      </div>

      {/* 5. Tab Panels with Master-Detail Layout */}
      {activeTab === 'queue' && (
        <div className={`grid grid-cols-1 ${selectedIncident ? 'xl:grid-cols-12 gap-6' : ''}`}>
          <div className={selectedIncident ? 'xl:col-span-7' : 'w-full'}>
            <IncidentReviewTable
              incidents={incidents}
              selectedIncidentId={selectedIncident?.id}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onQuickUpdateStatus={handleQuickUpdateStatus}
            />
          </div>

          {selectedIncident && (
            <div className="xl:col-span-5 mt-6 xl:mt-0">
              <IncidentDetailPanel
                isOpen={!!selectedIncident}
                incident={selectedIncident}
                onClose={() => setSelectedIncident(null)}
                onUpdate={handleModalUpdate}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <ObservableRulesVisualizer />
      )}

      {activeTab === 'station' && (
        <ControlledCameraFeed />
      )}
    </div>
  );
};
