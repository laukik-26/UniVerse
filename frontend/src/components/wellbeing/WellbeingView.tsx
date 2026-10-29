import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Layers 
} from 'lucide-react';
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
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Privacy-Aware Digital Wellbeing
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              Module D Active
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Voluntary focus session timer, transparent domain categorization, and client-side data sovereignty.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200/80">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Non-Surveillance Guarantee</span>
        </div>
      </div>

      {/* 2. Top ERP KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Productivity Score</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {metrics.productivity_score_pct}%
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Dwell time capped at 300s
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Context Transitions</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {metrics.context_switches}
            </span>
            <span className="text-xs text-slate-500">Switches</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Between category types
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Sessions</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {sessions.length}
            </span>
            <span className="text-xs text-slate-500">Sessions</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Stored locally in SQLite
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">URLs Transmitted</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              0
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Strict Zero</span>
          </div>
          <div className="mt-1 text-xs text-emerald-700">
            Zero raw browsing shared
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'timer'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Focus Timer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'inspector'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Browsing Inspector & Rules</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-mono">
              Synthetic
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'metrics'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Metrics & Attention</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sovereignty')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'sovereignty'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Data Sovereignty & Purge</span>
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
