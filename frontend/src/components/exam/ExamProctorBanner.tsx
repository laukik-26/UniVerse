import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ExamProctorBanner: React.FC = () => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="truncate">
          <strong className="font-semibold text-slate-900">Presumption of Integrity:</strong>{' '}
          Automated vision signals are preliminary behavioral pointers for human review. System architecture strictly prohibits automated penalties or disqualifications.
        </span>
      </div>
      <span className="text-[11px] font-mono text-slate-500 shrink-0 hidden sm:inline">
        Human invigilation mandatory
      </span>
    </div>
  );
};
