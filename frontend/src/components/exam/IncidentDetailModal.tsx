import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Lock, 
  Save, 
  History 
} from 'lucide-react';
import type { ExamIncident, ExamAuditLogEntry, IncidentStatus } from '../../types/exam';
import { examApi } from '../../services/examApi';

interface IncidentDetailModalProps {
  incident: ExamIncident | null;
  onClose: () => void;
  onUpdate: (updated: ExamIncident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(incident?.status || 'pending_review');
  const [newNote, setNewNote] = useState('');
  const [proctorName, setProctorName] = useState('Proctor Meaghan');
  const [auditTrail, setAuditTrail] = useState<ExamAuditLogEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (incident) {
      setSelectedStatus(incident.status);
      examApi.getAuditTrail(incident.id).then(setAuditTrail);
    }
  }, [incident]);

  if (!incident) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await examApi.updateStatus(
        incident.id,
        selectedStatus,
        newNote,
        proctorName
      );
      onUpdate(updated);
      setNewNote('');
      const freshAudit = await examApi.getAuditTrail(incident.id);
      setAuditTrail(freshAudit);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-base">{incident.id}</span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-indigo-200">
                {incident.source}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {incident.session_id} &bull; {incident.desk_label}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-1">{incident.event_type}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Observation Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Detection Time</span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">{incident.timestamp}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence Score</span>
            <span className="font-mono font-bold text-blue-700 text-xs mt-0.5 block">{(incident.confidence * 100).toFixed(1)}%</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Status</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block capitalize">{incident.status.replace('_', ' ')}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ethical Safeguard</span>
            <span className="font-bold text-emerald-700 text-xs mt-0.5 block">Non-Punitive</span>
          </div>
        </div>

        {/* Form: Status & Notes */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Proctor Review Decision Status:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pending_review', label: 'Pending Review', icon: Clock, color: 'border-amber-400 bg-amber-50 text-amber-900' },
                { id: 'in_review', label: 'In Review', icon: AlertTriangle, color: 'border-blue-400 bg-blue-50 text-blue-900' },
                { id: 'dismissed', label: 'Dismiss (False Positive)', icon: XCircle, color: 'border-slate-400 bg-slate-50 text-slate-900' },
                { id: 'resolved', label: 'Resolve (Legitimate Flag)', icon: CheckCircle2, color: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
              ].map((st) => {
                const Icon = st.icon;
                const isSelected = selectedStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStatus(st.id as IncidentStatus)}
                    className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                      isSelected ? `${st.color} shadow-xs font-bold ring-2 ring-blue-500/20` : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="proctor-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Reviewing Invigilator
              </label>
              <input
                id="proctor-name-input"
                type="text"
                value={proctorName}
                onChange={(e) => setProctorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden font-medium"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="proctor-note-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Append Reviewer Evaluation Justification Note
              </label>
              <input
                id="proctor-note-input"
                type="text"
                placeholder="e.g. Verified scratchpaper glance; no unauthorized device present..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              All review actions are written to an immutable audit trail
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Recording Audit...' : 'Save Evaluation'}</span>
            </button>
          </div>
        </form>

        {/* Existing Notes Display */}
        {incident.reviewer_notes && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-800 mb-1">Existing Reviewer Notes:</h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 whitespace-pre-line">
              {incident.reviewer_notes}
            </div>
          </div>
        )}

        {/* Audit Trail Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Immutable Proctor Audit Log</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {auditTrail.map((a) => (
              <div key={a.id} className="p-2 bg-slate-50/80 rounded border border-slate-200/60 text-[11px] flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-800">{a.actor_role}</span>: {a.notes}
                  <span className="text-slate-400 ml-2">({a.previous_status} &rarr; {a.new_status})</span>
                </div>
                <span className="font-mono text-slate-400 shrink-0 text-[10px]">{a.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
