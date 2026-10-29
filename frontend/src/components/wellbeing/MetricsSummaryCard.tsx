import React from 'react';
import type { WellbeingMetrics } from '../../types/wellbeing';
import { 
  Zap, 
  Repeat, 
  Clock, 
  Sparkles, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface MetricsSummaryCardProps {
  metrics: WellbeingMetrics;
  effectiveFocusSeconds: number;
}

export const MetricsSummaryCard: React.FC<MetricsSummaryCardProps> = ({
  metrics,
  effectiveFocusSeconds,
}) => {
  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  const totalDwell = Math.max(1, metrics.total_dwell_seconds);
  const prodPct = ((metrics.productive_seconds / totalDwell) * 100).toFixed(1);
  const neuPct = ((metrics.neutral_seconds / totalDwell) * 100).toFixed(1);
  const distPct = ((metrics.distracting_seconds / totalDwell) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Effective Focus</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatSec(effectiveFocusSeconds)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Pause intervals excluded
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Context Switches</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {metrics.context_switches}
            </span>
            <span className="text-xs text-slate-500">transitions</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Between category types
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Distraction Dwell</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700">
              {formatSec(metrics.distracting_seconds)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {metrics.distraction_ratio_pct}% of observed dwell
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Productivity Index</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {metrics.productivity_score_pct}%
            </span>
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>High Cognitive Focus</span>
          </div>
        </div>
      </div>

      {/* 2. Proportional Dwell Visualizer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <h4 className="font-semibold text-slate-800">
            Estimated Cognitive Attention Distribution
          </h4>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Productive ({prodPct}%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Neutral ({neuPct}%)
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Distracting ({distPct}%)
            </span>
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
          <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${prodPct}%` }} />
          <div className="bg-slate-400 h-full transition-all duration-500" style={{ width: `${neuPct}%` }} />
          <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${distPct}%` }} />
        </div>

        <p className="text-[11px] text-slate-500 mt-3 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{metrics.methodology_assumption}</span>
        </p>
      </div>
    </div>
  );
};
