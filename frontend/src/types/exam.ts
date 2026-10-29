export type IncidentStatus = 'pending_review' | 'in_review' | 'dismissed' | 'resolved';

export type IncidentSource = 'Synthetic Demo' | 'Local CV Model';

export interface ExamIncident {
  id: string;
  session_id: string;
  desk_label: string;
  source: IncidentSource;
  event_type: string;
  confidence: number;
  timestamp: string;
  status: IncidentStatus;
  reviewer_notes: string;
  created_at: string;
  updated_at: string;
}

export interface ExamAuditLogEntry {
  id: string;
  incident_id: string;
  action: string;
  actor_role: string;
  previous_status: string;
  new_status: string;
  notes: string;
  timestamp: string;
}

export interface RuleEvaluationResult {
  rule_type: string;
  evaluation: any;
  ethical_note: string;
}
