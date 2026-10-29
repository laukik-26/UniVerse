import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Save, 
  History 
} from 'lucide-react';
import { DetailPanel } from '../common/DetailPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import type { ExamIncident, ExamAuditLogEntry, IncidentStatus } from '../../types/exam';
import { examApi } from '../../services/examApi';

interface IncidentDetailPanelProps {
  incident: ExamIncident | null;
  onClose: () => void;
  onUpdate: (updated: ExamIncident) => void;
  isOpen: boolean;
}

export const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = ({
  incident,
  onClose,
  onUpdate,
  isOpen,
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

  if (!incident || !isOpen) return null;

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
    <DetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={`${incident.id} — ${incident.event_type}`}
      subtitle={`${incident.desk_label} • ${incident.session_id}`}
    >
      {/* Observation Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-medium text-slate-500 block">Time</span>
          <span className="font-mono font-semibold text-slate-900 mt-0.5 block">{incident.timestamp}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-medium text-slate-500 block">Confidence</span>
          <span className="font-mono font-semibold text-blue-700 mt-0.5 block">{(incident.confidence * 100).toFixed(1)}%</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-medium text-slate-500 block">Current Status</span>
          <div className="mt-1">
            <StatusBadge status={incident.status} />
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-medium text-slate-500 block">Rule Logic</span>
          <span className="font-mono text-slate-700 text-xs mt-0.5 block truncate" title={incident.event_type}>
            {incident.source} &bull; {incident.event_type}
          </span>
        </div>
      </div>

      {/* Reviewer Note if previously recorded */}
      {incident.reviewer_notes && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-medium text-slate-500 uppercase block mb-1">
            Previous Invigilator Note
          </span>
          <p className="text-slate-800 leading-relaxed font-sans">{incident.reviewer_notes}</p>
        </div>
      )}

      {/* Human Proctor Evaluation Form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            Record Invigilation Action
          </h4>
          <span className="text-[10px] text-emerald-700 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Non-punitive safeguard
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 block">
            Select Evaluation Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as IncidentStatus)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="pending_review">Pending Review (Awaiting inspection)</option>
            <option value="in_review">In Review (Verifying event context)</option>
            <option value="dismissed">Dismiss (False Positive / Incidental Movement)</option>
            <option value="resolved">Resolve (Verified / Addressed Non-punitively)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 block">
            Invigilator Notes & Rationale
          </label>
          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Record observable evidence context (e.g. drop pen, lighting shift)..."
            required
            className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 block">
            Reviewer ID
          </label>
          <input
            type="text"
            value={proctorName}
            onChange={(e) => setProctorName(e.target.value)}
            required
            className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={saving}
            className="w-full"
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Determination & Append Audit Trail
          </Button>
        </div>
      </form>

      {/* Immutable Proctor Audit Trail */}
      <div className="border-t border-slate-100 pt-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>Audit Trail ({auditTrail.length})</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {auditTrail.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No previous audit entries logged for this cue.</p>
          ) : (
            auditTrail.map((entry) => (
              <div key={entry.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 font-mono text-[11px]">{entry.actor_role}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{entry.timestamp}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500">Status:</span>
                  <StatusBadge status={entry.new_status} />
                </div>
                {entry.notes && (
                  <p className="text-slate-700 text-[11px] bg-white p-1.5 rounded border border-slate-200 mt-1">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DetailPanel>
  );
};
