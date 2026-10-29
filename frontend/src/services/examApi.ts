import type { ExamIncident, ExamAuditLogEntry, IncidentStatus } from '../types/exam';

const API_BASE_URL = 'http://localhost:8000/api';

const FALLBACK_INCIDENTS: ExamIncident[] = [
  {
    id: 'inc-101',
    session_id: 'EXAM-2026-CS301',
    desk_label: 'Desk 04 (Anonymous)',
    source: 'Synthetic Demo',
    event_type: 'Repeated Head-Turn Cues',
    confidence: 0.82,
    timestamp: '10:14:22',
    status: 'pending_review',
    reviewer_notes: '',
    created_at: '2026-10-29 10:14:22',
    updated_at: '2026-10-29 10:14:22',
  },
  {
    id: 'inc-102',
    session_id: 'EXAM-2026-CS301',
    desk_label: 'Desk 12 (Anonymous)',
    source: 'Synthetic Demo',
    event_type: 'Restricted Zone Intrusion',
    confidence: 0.89,
    timestamp: '10:28:05',
    status: 'in_review',
    reviewer_notes: 'Proctor note: Observed object protruding into boundary perimeter. Cross-referencing physical desk.',
    created_at: '2026-10-29 10:28:05',
    updated_at: '2026-10-29 10:30:12',
  },
  {
    id: 'inc-103',
    session_id: 'EXAM-2026-CS301',
    desk_label: 'Desk 19 (Anonymous)',
    source: 'Synthetic Demo',
    event_type: 'Prolonged Absence',
    confidence: 0.95,
    timestamp: '09:45:10',
    status: 'dismissed',
    reviewer_notes: 'Authorized restroom break verified by Hall Supervisor.',
    created_at: '2026-10-29 09:45:10',
    updated_at: '2026-10-29 09:50:00',
  },
  {
    id: 'inc-104',
    session_id: 'EXAM-2026-CS301',
    desk_label: 'Desk 07 (Anonymous)',
    source: 'Synthetic Demo',
    event_type: 'Multiple Faces In Frame',
    confidence: 0.74,
    timestamp: '10:35:40',
    status: 'resolved',
    reviewer_notes: 'Invigilator approached desk to deliver supplementary question paper. Verified non-infraction.',
    created_at: '2026-10-29 10:35:40',
    updated_at: '2026-10-29 10:40:15',
  },
];

let localIncidents = [...FALLBACK_INCIDENTS];
let localAuditLog: ExamAuditLogEntry[] = [
  { id: 'aud-001', incident_id: 'inc-102', action: 'status_transition_to_in_review', actor_role: 'Proctor Meaghan', previous_status: 'pending_review', new_status: 'in_review', notes: 'Review initiated.', timestamp: '10:30:12' },
  { id: 'aud-002', incident_id: 'inc-103', action: 'status_transition_to_dismissed', actor_role: 'Proctor Meaghan', previous_status: 'pending_review', new_status: 'dismissed', notes: 'Authorized restroom break.', timestamp: '09:50:00' },
  { id: 'aud-003', incident_id: 'inc-104', action: 'status_transition_to_resolved', actor_role: 'Proctor Meaghan', previous_status: 'in_review', new_status: 'resolved', notes: 'Invigilator presence confirmed.', timestamp: '10:40:15' },
];

export const examApi = {
  async getIncidents(statusFilter?: string, eventTypeFilter?: string): Promise<ExamIncident[]> {
    try {
      const q = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') q.set('status', statusFilter);
      if (eventTypeFilter && eventTypeFilter !== 'all') q.set('event_type', eventTypeFilter);
      const res = await fetch(`${API_BASE_URL}/exam/incidents?${q.toString()}`);
      if (res.ok) {
        localIncidents = await res.json();
        return localIncidents;
      }
    } catch {
      // fallback
    }

    let filtered = [...localIncidents];
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    if (eventTypeFilter && eventTypeFilter !== 'all') {
      filtered = filtered.filter(i => i.event_type === eventTypeFilter);
    }
    return filtered;
  },

  async updateStatus(
    incidentId: string, 
    newStatus: IncidentStatus, 
    notes?: string, 
    actor: string = 'Proctor Meaghan'
  ): Promise<ExamIncident> {
    try {
      const res = await fetch(`${API_BASE_URL}/exam/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewer_notes: notes || '',
          actor_name: actor,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        localIncidents = localIncidents.map(i => i.id === incidentId ? updated : i);
        return updated;
      }
    } catch {
      // fallback
    }

    const inc = localIncidents.find(i => i.id === incidentId);
    if (!inc) throw new Error('Incident not found');

    const now = new Date().toTimeString().split(' ')[0];
    const prev = inc.status;
    const noteText = notes ? `[${now}] ${actor}: ${notes}` : '';
    const updatedNotes = inc.reviewer_notes ? `${inc.reviewer_notes}\n${noteText}` : noteText;

    const updated: ExamIncident = {
      ...inc,
      status: newStatus,
      reviewer_notes: updatedNotes,
      updated_at: new Date().toISOString(),
    };

    localIncidents = localIncidents.map(i => i.id === incidentId ? updated : i);

    localAuditLog.unshift({
      id: `aud-${Date.now().toString(36)}`,
      incident_id: incidentId,
      action: `status_transition_to_${newStatus}`,
      actor_role: actor,
      previous_status: prev,
      new_status: newStatus,
      notes: notes || 'Status updated by human proctor.',
      timestamp: now,
    });

    return updated;
  },

  async getAuditTrail(incidentId?: string): Promise<ExamAuditLogEntry[]> {
    try {
      const q = incidentId ? `?incident_id=${incidentId}` : '';
      const res = await fetch(`${API_BASE_URL}/exam/audit-log${q}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    if (incidentId) {
      return localAuditLog.filter(a => a.incident_id === incidentId);
    }
    return localAuditLog;
  },

  async evaluateRules(req: {
    rule_type: string;
    timestamps?: number[];
    window_seconds?: number;
    threshold_count?: number;
    detected_box?: number[];
    restricted_zone_box?: number[];
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/exam/evaluate-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    if (req.rule_type === 'head_turn_window') {
      const ts = (req.timestamps || []).sort((a, b) => a - b);
      const win = req.window_seconds || 30.0;
      const thresh = req.threshold_count || 3;
      let maxCount = 0;
      for (let l = 0; l < ts.length; l++) {
        let r = l;
        while (r < ts.length && ts[r] <= ts[l] + win) r++;
        if (r - l > maxCount) maxCount = r - l;
      }
      return {
        rule_type: 'head_turn_window',
        evaluation: {
          triggered: maxCount >= thresh,
          max_events_in_window: maxCount,
          total_events: ts.length,
        },
        ethical_note: 'Rule triggers a behavioral cue for proctor evaluation; does not represent misconduct.',
      };
    } else {
      const d = req.detected_box || [0.7, 0.65, 0.85, 0.8];
      const r = req.restricted_zone_box || [0.75, 0.6, 0.95, 0.9];
      const ix1 = Math.max(d[0], r[0]);
      const iy1 = Math.max(d[1], r[1]);
      const ix2 = Math.min(d[2], r[2]);
      const iy2 = Math.min(d[3], r[3]);
      const interArea = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
      return {
        rule_type: 'zone_intrusion',
        evaluation: {
          intrusion_triggered: interArea > 0.01,
          intersection_area: Math.round(interArea * 1000) / 1000,
          iou: 0.25,
        },
        ethical_note: 'Zone overlap indicates proximity cue for proctor inspection.',
      };
    }
  },
};
