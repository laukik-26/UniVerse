export type DomainCategory = 'productive' | 'neutral' | 'distracting';

export interface BrowsingEvent {
  id: string;
  raw_domain_or_url: string;
  normalized_domain: string;
  category: DomainCategory;
  timestamp_seconds: number;
  time_display: string;
}

export interface CategorizationRule {
  domain: string;
  category: DomainCategory;
  is_custom: boolean;
}

export interface WellbeingMetrics {
  total_dwell_seconds: number;
  productive_seconds: number;
  neutral_seconds: number;
  distracting_seconds: number;
  distraction_ratio_pct: number;
  productivity_score_pct: number;
  context_switches: number;
  methodology_assumption: string;
}

export interface FocusSessionRecord {
  id: string;
  session_duration_seconds: number;
  paused_seconds: number;
  effective_duration_seconds: number;
  context_switches: number;
  distraction_dwell_seconds: number;
  productivity_score_pct: number;
  created_at: string;
}

export interface FocusTimerState {
  status: 'idle' | 'running' | 'paused' | 'completed';
  startTimeEpochMs: number | null;
  lastResumeEpochMs: number | null;
  accumulatedActiveMs: number;
  accumulatedPausedMs: number;
  pauseStartEpochMs: number | null;
}
