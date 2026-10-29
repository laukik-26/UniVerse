import React from 'react';
import { ShieldAlert, CheckCircle, Lock } from 'lucide-react';

export const ExamProctorBanner: React.FC = () => {
  return (
    <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4.5 text-xs text-amber-950 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <h4 className="font-bold text-amber-950 text-sm">
            MANDATORY ETHICAL SAFEGUARD: Human Proctor Review Protocol
          </h4>
        </div>
        <span className="bg-amber-200 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
          NON-PUNITIVE POLICY
        </span>
      </div>

      <p className="text-amber-900/90 leading-relaxed">
        Automated vision signals and geometric cues are <strong>preliminary behavioral pointers for human review</strong>, 
        NOT proof of academic dishonesty. Automated penalties, disqualifications, or accusations are strictly prohibited by system architecture.
        Students maintain a presumption of integrity until verified by a certified invigilator.
      </p>

      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-amber-800">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Mandatory Human Review
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Zero Automated Penalties
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
          Immutable Proctor Audit Log
        </span>
      </div>
    </div>
  );
};
