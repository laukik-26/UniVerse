import type { 
  DomainCategory, 
  BrowsingEvent, 
  CategorizationRule, 
  WellbeingMetrics, 
  FocusSessionRecord, 
  FocusTimerState 
} from '../types/wellbeing';

const API_BASE_URL = 'http://localhost:8000/api';

const TIMER_STORAGE_KEY = 'universe_wellbeing_timer_state';
const RULES_STORAGE_KEY = 'universe_wellbeing_custom_rules';
const SESSIONS_STORAGE_KEY = 'universe_wellbeing_local_sessions';

export const DEFAULT_RULES: Record<string, DomainCategory> = {
  'docs.python.org': 'productive',
  'github.com': 'productive',
  'stackoverflow.com': 'productive',
  'coursera.org': 'productive',
  'edx.org': 'productive',
  'arxiv.org': 'productive',
  'scholar.google.com': 'productive',
  'developer.mozilla.org': 'productive',
  'leetcode.com': 'productive',
  'canvas.net': 'productive',
  'overleaf.com': 'productive',
  'fastapi.tiangolo.com': 'productive',
  'react.dev': 'productive',
  'reddit.com': 'distracting',
  'youtube.com': 'distracting',
  'instagram.com': 'distracting',
  'twitter.com': 'distracting',
  'x.com': 'distracting',
  'tiktok.com': 'distracting',
  'netflix.com': 'distracting',
  'twitch.tv': 'distracting',
  'facebook.com': 'distracting',
  'google.com': 'neutral',
  'gmail.com': 'neutral',
  'wikipedia.org': 'neutral',
  'notion.so': 'neutral',
  'slack.com': 'neutral',
};

export const INITIAL_SYNTHETIC_EVENTS: BrowsingEvent[] = [
  { id: 'ev-1', raw_domain_or_url: 'https://docs.python.org/3/library/asyncio.html', normalized_domain: 'docs.python.org', category: 'productive', timestamp_seconds: 0, time_display: '10:00:00' },
  { id: 'ev-2', raw_domain_or_url: 'https://github.com/torvalds/linux', normalized_domain: 'github.com', category: 'productive', timestamp_seconds: 180, time_display: '10:03:00' },
  { id: 'ev-3', raw_domain_or_url: 'https://stackoverflow.com/questions/dijkstra-min-heap', normalized_domain: 'stackoverflow.com', category: 'productive', timestamp_seconds: 420, time_display: '10:07:00' },
  { id: 'ev-4', raw_domain_or_url: 'https://www.youtube.com/watch?v=algorithm-visualizer', normalized_domain: 'youtube.com', category: 'distracting', timestamp_seconds: 700, time_display: '10:11:40' },
  { id: 'ev-5', raw_domain_or_url: 'https://reddit.com/r/programming', normalized_domain: 'reddit.com', category: 'distracting', timestamp_seconds: 980, time_display: '10:16:20' },
  { id: 'ev-6', raw_domain_or_url: 'https://react.dev/reference/react/useState', normalized_domain: 'react.dev', category: 'productive', timestamp_seconds: 1200, time_display: '10:20:00' },
  { id: 'ev-7', raw_domain_or_url: 'https://notion.so/my-campus-notes', normalized_domain: 'notion.so', category: 'neutral', timestamp_seconds: 1540, time_display: '10:25:40' },
  { id: 'ev-8', raw_domain_or_url: 'https://leetcode.com/problemset/all/', normalized_domain: 'leetcode.com', category: 'productive', timestamp_seconds: 1850, time_display: '10:30:50' },
  { id: 'ev-9', raw_domain_or_url: 'https://x.com/tech_announcements', normalized_domain: 'x.com', category: 'distracting', timestamp_seconds: 2100, time_display: '10:35:00' },
  { id: 'ev-10', raw_domain_or_url: 'https://arxiv.org/abs/2401.0001', normalized_domain: 'arxiv.org', category: 'productive', timestamp_seconds: 2450, time_display: '10:40:50' },
];

export const normalizeDomain = (raw: string): string => {
  if (!raw) return '';
  let str = raw.trim().toLowerCase();
  str = str.replace(/^(https?:\/\/)?(www\.)?/, '');
  str = str.split('/')[0].split('?')[0].split('#')[0].split(':')[0];
  return str;
};

export const wellbeingApi = {
  // 1. Rules Management
  getRules(): CategorizationRule[] {
    const custom = JSON.parse(localStorage.getItem(RULES_STORAGE_KEY) || '{}');
    const combined: Record<string, { cat: DomainCategory; isCustom: boolean }> = {};

    for (const [d, c] of Object.entries(DEFAULT_RULES)) {
      combined[d] = { cat: c, isCustom: false };
    }
    for (const [d, c] of Object.entries(custom)) {
      combined[d] = { cat: c as DomainCategory, isCustom: true };
    }

    return Object.entries(combined).map(([domain, data]) => ({
      domain,
      category: data.cat,
      is_custom: data.isCustom,
    }));
  },

  setCustomRule(domain: string, category: DomainCategory): void {
    const norm = normalizeDomain(domain);
    if (!norm) return;
    const custom = JSON.parse(localStorage.getItem(RULES_STORAGE_KEY) || '{}');
    custom[norm] = category;
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(custom));
  },

  resetRulesToDefault(): void {
    localStorage.removeItem(RULES_STORAGE_KEY);
  },

  // 2. Focus Timer Wall-Clock State Persistence
  getTimerState(): FocusTimerState {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) {
      return {
        status: 'idle',
        startTimeEpochMs: null,
        lastResumeEpochMs: null,
        accumulatedActiveMs: 0,
        accumulatedPausedMs: 0,
        pauseStartEpochMs: null,
      };
    }
    return JSON.parse(raw);
  },

  saveTimerState(state: FocusTimerState): void {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  },

  clearTimerState(): void {
    localStorage.removeItem(TIMER_STORAGE_KEY);
  },

  // 3. Compute Metrics with 300s Cap
  computeMetrics(events: BrowsingEvent[], customRules?: Record<string, DomainCategory>): WellbeingMetrics {
    const rules = { ...DEFAULT_RULES, ...(customRules || {}) };
    let totalDwell = 0;
    let prodDwell = 0;
    let neuDwell = 0;
    let distDwell = 0;
    let switches = 0;

    const categories: DomainCategory[] = events.map(e => {
      const norm = normalizeDomain(e.normalized_domain || e.raw_domain_or_url);
      return (rules[norm] || 'neutral') as DomainCategory;
    });

    for (let i = 0; i < events.length; i++) {
      const cat = categories[i];
      let dwell = 30; // default for last item

      if (i < events.length - 1) {
        const delta = Math.max(0, events[i + 1].timestamp_seconds - events[i].timestamp_seconds);
        dwell = Math.min(delta, 300); // 300s cap
      }

      totalDwell += dwell;
      if (cat === 'productive') prodDwell += dwell;
      else if (cat === 'distracting') distDwell += dwell;
      else neuDwell += dwell;

      if (i > 0 && categories[i] !== categories[i - 1]) {
        switches++;
      }
    }

    const distRatio = totalDwell > 0 ? (distDwell / totalDwell) * 100 : 0;
    const prodScore = totalDwell > 0 ? (prodDwell / totalDwell) * 100 : 100;

    return {
      total_dwell_seconds: totalDwell,
      productive_seconds: prodDwell,
      neutral_seconds: neuDwell,
      distracting_seconds: distDwell,
      distraction_ratio_pct: Math.round(distRatio * 10) / 10,
      productivity_score_pct: Math.round(prodScore * 10) / 10,
      context_switches: switches,
      methodology_assumption:
        'Event dwell is capped at 300s (5 mins) per transition. Sparse events do not measure continuous typing; gaps represent idle periods.',
    };
  },

  // 4. Save Aggregate Session
  async saveAggregateSession(record: Omit<FocusSessionRecord, 'id' | 'created_at'>): Promise<FocusSessionRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/wellbeing/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (res.ok) return await res.json();
    } catch {
      // offline fallback
    }

    const localRecord: FocusSessionRecord = {
      ...record,
      id: `foc-${Date.now().toString(36)}`,
      created_at: new Date().toLocaleString(),
    };

    const existing: FocusSessionRecord[] = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
    existing.unshift(localRecord);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(existing));
    return localRecord;
  },

  async getSessions(): Promise<FocusSessionRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/wellbeing/sessions`);
      if (res.ok) return await res.json();
    } catch {
      // offline fallback
    }
    return JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
  },

  // 5. Purge All Stored Data
  async purgeAllData(): Promise<{ deleted: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/wellbeing/data`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem(TIMER_STORAGE_KEY);
        localStorage.removeItem(SESSIONS_STORAGE_KEY);
        return { deleted: data.deleted_records || 1 };
      }
    } catch {
      // fallback
    }

    localStorage.removeItem(TIMER_STORAGE_KEY);
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    return { deleted: 1 };
  },
};
