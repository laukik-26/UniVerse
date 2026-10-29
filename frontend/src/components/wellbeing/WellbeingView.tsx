import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Eye, 
  BarChart3, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import { FocusTimerCard } from './FocusTimerCard';
import { BrowsingInspectorCard } from './BrowsingInspectorCard';
import { MetricsSummaryCard } from './MetricsSummaryCard';
import { DataSovereigntyCard } from './DataSovereigntyCard';
import { 
  wellbeingApi, 
  INITIAL_SYNTHETIC_EVENTS, 
  normalizeDomain 
} from '../../services/wellbeingApi';
import type { 
  BrowsingEvent, 
  CategorizationRule, 
  WellbeingMetrics, 
  FocusSessionRecord, 
  DomainCategory 
} from '../../types/wellbeing';

interface WellbeingViewProps {
  onActivityLogged?: (title: string, type?: 'info' | 'success' | 'warning') => void;
}

type TabType = 'timer' | 'inspector' | 'metrics' | 'sovereignty';

export const WellbeingView: React.FC<WellbeingViewProps> = ({ onActivityLogged }) => {
  const [activeTab, setActiveTab] = useState<TabType>('timer');
  const [events, setEvents] = useState<BrowsingEvent[]>(INITIAL_SYNTHETIC_EVENTS);
  const [rules, setRules] = useState<CategorizationRule[]>(() => wellbeingApi.getRules());
  const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);
  const [metrics, setMetrics] = useState<WellbeingMetrics>(() => wellbeingApi.computeMetrics(INITIAL_SYNTHETIC_EVENTS));
  const [effectiveFocusSeconds, setEffectiveFocusSeconds] = useState<number>(1800);

  const loadSessions = useCallback(async () => {
    const data = await wellbeingApi.getSessions();
    setSessions(data);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Recalculate metrics when events or rules change
  const handleUpdateRule = (domain: string, category: DomainCategory) => {
    wellbeingApi.setCustomRule(domain, category);
    const updatedRules = wellbeingApi.getRules();
    setRules(updatedRules);

    const ruleMap: Record<string, DomainCategory> = {};
    for (const r of updatedRules) ruleMap[r.domain] = r.category;

    const updatedEvents: BrowsingEvent[] = events.map(e => ({
      ...e,
      category: (ruleMap[normalizeDomain(e.normalized_domain)] || e.category) as DomainCategory,
    }));
    setEvents(updatedEvents);
    setMetrics(wellbeingApi.computeMetrics(updatedEvents, ruleMap));

    if (onActivityLogged) {
      onActivityLogged(`Wellbeing Rule Updated: '${domain}' classified as ${category}`, 'info');
    }
  };

  const handleResetRules = () => {
    wellbeingApi.resetRulesToDefault();
    const defRules = wellbeingApi.getRules();
    setRules(defRules);
    setEvents(INITIAL_SYNTHETIC_EVENTS);
    setMetrics(wellbeingApi.computeMetrics(INITIAL_SYNTHETIC_EVENTS));
    if (onActivityLogged) {
      onActivityLogged('Wellbeing Rules reset to default university standard', 'info');
    }
  };

  const handleSessionCompleted = async (summary: {
    durationSeconds: number;
    pausedSeconds: number;
    effectiveSeconds: number;
  }) => {
    setEffectiveFocusSeconds(summary.effectiveSeconds);

    const record = await wellbeingApi.saveAggregateSession({
      session_duration_seconds: summary.durationSeconds,
      paused_seconds: summary.pausedSeconds,
      effective_duration_seconds: summary.effectiveSeconds,
      context_switches: metrics.context_switches,
      distraction_dwell_seconds: Math.round(metrics.distracting_seconds),
      productivity_score_pct: metrics.productivity_score_pct,
    });

    setSessions(prev => [record, ...prev]);

    if (onActivityLogged) {
      const mins = Math.round(summary.effectiveSeconds / 60);
      onActivityLogged(
        `Focus Session Logged: ${mins}m effective focus (${metrics.productivity_score_pct}% productive)`,
        'success'
      );
    }
  };

  const handleDataPurged = () => {
    setSessions([]);
    setEffectiveFocusSeconds(0);
    handleResetRules();
    if (onActivityLogged) {
      onActivityLogged('Digital Wellbeing data permanently purged by user', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Privacy-Aware Digital Wellbeing"
        subtitle="Voluntary focus session timer, transparent domain categorization, and client-side data sovereignty."
      >
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Non-surveillance guarantee</span>
        </div>
      </PageHeader>

      {/* 2. Top KPI StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Productivity score"
          value={`${metrics.productivity_score_pct}%`}
          subtext="Dwell time capped at 300s"
          dotVariant="success"
        />

        <StatCard
          label="Context transitions"
          value={metrics.context_switches}
          subtext="Between domain categories"
          dotVariant="info"
        />

        <StatCard
          label="Logged sessions"
          value={sessions.length}
          subtext="Stored in local storage/DB"
          dotVariant="neutral"
        />

        <StatCard
          label="URLs transmitted"
          value="0"
          subtext="Strict zero raw browsing shared"
          dotVariant="success"
        />
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'timer'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Focus timer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'inspector'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Domain rules & inspector</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'metrics'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Wellbeing analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sovereignty')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'sovereignty'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Data sovereignty & purge</span>
          </button>
        </nav>
      </div>

      {/* 4. Tab Panels */}
      {activeTab === 'timer' && (
        <FocusTimerCard onSessionCompleted={handleSessionCompleted} />
      )}

      {activeTab === 'inspector' && (
        <BrowsingInspectorCard
          events={events}
          rules={rules}
          onUpdateRule={handleUpdateRule}
          onResetRules={handleResetRules}
        />
      )}

      {activeTab === 'metrics' && (
        <MetricsSummaryCard
          metrics={metrics}
          effectiveFocusSeconds={effectiveFocusSeconds}
        />
      )}

      {activeTab === 'sovereignty' && (
        <DataSovereigntyCard
          sessions={sessions}
          onDataPurged={handleDataPurged}
        />
      )}
    </div>
  );
};
