import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Code, 
  Check, 
  Lock, 
  AlertTriangle 
} from 'lucide-react';
import { wellbeingApi } from '../../services/wellbeingApi';
import type { FocusSessionRecord } from '../../types/wellbeing';

interface DataSovereigntyCardProps {
  sessions: FocusSessionRecord[];
  onDataPurged: () => void;
}

export const DataSovereigntyCard: React.FC<DataSovereigntyCardProps> = ({
  sessions,
  onDataPurged,
}) => {
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showConfirmPurge, setShowConfirmPurge] = useState(false);
  const [purgedMessage, setPurgedMessage] = useState<string | null>(null);

  const rawDataPayload = {
    privacy_mode: 'Client-Side Minimal Sovereignty',
    local_storage_keys: [
      'universe_wellbeing_timer_state',
      'universe_wellbeing_custom_rules',
      'universe_wellbeing_local_sessions',
    ],
    total_saved_sessions: sessions.length,
    sessions,
  };

  const handleConfirmPurge = async () => {
    await wellbeingApi.purgeAllData();
    setShowConfirmPurge(false);
    setPurgedMessage('All local and server-side wellbeing records have been permanently erased.');
    onDataPurged();
  };

  return (
    <div className="space-y-6">
      {/* 1. Policy & Safeguard Guarantees */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              Digital Wellbeing Privacy & Sovereignty Commitments
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              UniVerse is built upon strict data minimization. Wellbeing features are 100% voluntary, opt-in, and student-controlled. 
              The university administration, proctors, and faculty have <strong>zero access</strong> to your personal focus or browsing telemetry.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/70 text-xs text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero URL Paths Captured</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/70 text-xs text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Keystroke Telemetry</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/70 text-xs text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Local-First Persistence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. User Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Transparency & Deletion Actions</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit raw data payloads or permanently erase your recorded focus history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowJsonModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Code className="w-3.5 h-3.5" />
            Inspect Stored Data (JSON)
          </button>
          <button
            type="button"
            onClick={() => setShowConfirmPurge(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge All Data
          </button>
        </div>
      </div>

      {/* Purge Success Banner */}
      {purgedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{purgedMessage}</span>
        </div>
      )}

      {/* 3. Modal: JSON Inspector */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Raw Local Storage Inspection Payload</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                &times; Close
              </button>
            </div>
            <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg max-h-80 overflow-y-auto">
              {JSON.stringify(rawDataPayload, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Confirm Purge */}
      {showConfirmPurge && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-rose-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Permanently Purge All Data?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently delete all stored focus sessions, customized domain rules, and active timer state from both client storage and local SQLite. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmPurge(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
              >
                Yes, Purge Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
