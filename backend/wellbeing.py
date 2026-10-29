"""
Privacy-Aware Digital Wellbeing Module for UniVerse (Module D).
Implements domain normalization, rule-based categorization, pause-excluding focus timers,
context switch computation, and dwell-time estimation under strict privacy bounds.

MINIMAL DATA COLLECTION ARCHITECTURE:
- Zero raw URLs, queries, page contents, keystrokes, or credentials collected.
- Detailed events reside strictly client-side.
- Server receives only voluntary, aggregate session summaries.
"""

from typing import Dict, List, Optional, Tuple, Any
import re
from urllib.parse import urlparse

DEFAULT_CATEGORIZATION_RULES: Dict[str, str] = {
    # Productive Academic & Development Resources
    "docs.python.org": "productive",
    "github.com": "productive",
    "stackoverflow.com": "productive",
    "coursera.org": "productive",
    "edx.org": "productive",
    "arxiv.org": "productive",
    "scholar.google.com": "productive",
    "developer.mozilla.org": "productive",
    "leetcode.com": "productive",
    "canvas.net": "productive",
    "overleaf.com": "productive",
    "fastapi.tiangolo.com": "productive",
    "react.dev": "productive",

    # Distracting Media & Social Platforms
    "reddit.com": "distracting",
    "youtube.com": "distracting",
    "instagram.com": "distracting",
    "twitter.com": "distracting",
    "x.com": "distracting",
    "tiktok.com": "distracting",
    "netflix.com": "distracting",
    "twitch.tv": "distracting",
    "facebook.com": "distracting",
    "discord.com": "distracting",

    # Neutral / General Utility
    "google.com": "neutral",
    "gmail.com": "neutral",
    "wikipedia.org": "neutral",
    "notion.so": "neutral",
    "slack.com": "neutral",
    "drive.google.com": "neutral",
}

def normalize_domain(raw_input: str) -> str:
    """
    Normalizes a domain or URL to its bare lowercase host basename.
    Strips protocol, paths, query strings, fragments, credentials, and 'www.'
    Example: 'https://WWW.GitHub.com:443/repo?q=1#readme' -> 'github.com'
    """
    if not raw_input or not isinstance(raw_input, str):
        return ""

    text = raw_input.strip().lower()

    # If no scheme is present, prepend 'http://' so urlparse handles it correctly
    if not text.startswith("http://") and not text.startswith("https://") and not text.startswith("//"):
        text = "http://" + text

    try:
        parsed = urlparse(text)
        host = parsed.hostname or ""
    except Exception:
        # Fallback regex extraction if parsing fails
        host = re.sub(r"^https?://", "", text)
        host = host.split("/")[0].split("?")[0].split("#")[0]

    # Remove port if present
    host = host.split(":")[0]

    # Remove leading 'www.'
    if host.startswith("www."):
        host = host[4:]

    return host.strip()

def categorize_domain(domain_input: str, custom_rules: Optional[Dict[str, str]] = None) -> str:
    """
    Categorizes a normalized domain into 'productive', 'neutral', or 'distracting'.
    Evaluates user-defined custom rules first, then built-in standard rules,
    falling back to 'neutral'.
    """
    norm = normalize_domain(domain_input)
    if not norm:
        return "neutral"

    rules = {**DEFAULT_CATEGORIZATION_RULES}
    if custom_rules:
        # Normalize custom rules keys
        for k, v in custom_rules.items():
            rules[normalize_domain(k)] = v.lower().strip()

    # Exact match
    if norm in rules:
        return rules[norm]

    # Subdomain matching (e.g. 'docs.github.com' -> 'github.com')
    parts = norm.split(".")
    if len(parts) > 2:
        parent_domain = ".".join(parts[-2:])
        if parent_domain in rules:
            return rules[parent_domain]

    return "neutral"

def calculate_focus_duration(
    session_start_seconds: float,
    session_stop_seconds: float,
    paused_intervals: Optional[List[Tuple[float, float]]] = None
) -> float:
    """
    Calculates effective focus duration excluding paused intervals.
    Formula: effective_duration = (stop - start) - total_paused_duration
    Validates non-negative intervals and bounds pauses to the session timeline.
    """
    if session_stop_seconds < session_start_seconds:
        raise ValueError(
            f"Session stop timestamp ({session_stop_seconds}) cannot be before start ({session_start_seconds})."
        )

    total_elapsed = session_stop_seconds - session_start_seconds
    total_paused = 0.0

    if paused_intervals:
        for p_start, p_end in paused_intervals:
            if p_end < p_start:
                raise ValueError(f"Pause end ({p_end}) cannot be before pause start ({p_start}).")

            # Clamp pause interval strictly within session boundaries
            clamped_start = max(p_start, session_start_seconds)
            clamped_end = min(p_end, session_stop_seconds)

            if clamped_end > clamped_start:
                total_paused += (clamped_end - clamped_start)

    effective = max(0.0, total_elapsed - total_paused)
    return round(effective, 2)

def calculate_context_switches(event_categories: List[str]) -> int:
    """
    Counts context switches defined as transitions between consecutive event categories.
    For example: ['productive', 'distracting', 'distracting', 'neutral'] -> 2 switches.
    """
    if not event_categories or len(event_categories) <= 1:
        return 0

    switches = 0
    for i in range(1, len(event_categories)):
        prev_cat = event_categories[i - 1].strip().lower()
        curr_cat = event_categories[i].strip().lower()
        if prev_cat != curr_cat:
            switches += 1

    return switches

def calculate_dwell_and_distraction(
    events: List[Dict[str, Any]],
    max_dwell_cap_seconds: float = 300.0
) -> Dict[str, Any]:
    """
    Estimates dwell time by category from timestamped browsing events.
    
    DOCUMENTED ASSUMPTION:
    Active browsing time is estimated using inter-event deltas with an explicit cap
    (default 300s / 5 minutes). Inactivity gaps beyond 300s are capped to avoid falsely
    assuming hours of active distraction when the user was away from the keyboard.
    
    Returns breakdown of dwell seconds, context switches, and productivity percentage.
    """
    if not events:
        return {
            "total_dwell_seconds": 0.0,
            "productive_seconds": 0.0,
            "neutral_seconds": 0.0,
            "distracting_seconds": 0.0,
            "distraction_ratio_pct": 0.0,
            "productivity_score_pct": 100.0,
            "context_switches": 0,
            "methodology_assumption": "Dwell time capped at 300s per event delta to prevent idle overcounting."
        }

    # Sort events by timestamp ascending
    sorted_events = sorted(events, key=lambda x: x.get("timestamp_seconds", 0))

    cat_dwell: Dict[str, float] = {
        "productive": 0.0,
        "neutral": 0.0,
        "distracting": 0.0,
    }

    categories_sequence: List[str] = []

    for i in range(len(sorted_events)):
        ev = sorted_events[i]
        cat = ev.get("category", "neutral").lower()
        categories_sequence.append(cat)

        if i < len(sorted_events) - 1:
            next_t = sorted_events[i + 1].get("timestamp_seconds", ev.get("timestamp_seconds", 0))
            delta = max(0.0, next_t - ev.get("timestamp_seconds", 0))
            dwell = min(delta, max_dwell_cap_seconds)
        else:
            # Last event: assign a default single observation dwell of 30 seconds
            dwell = min(30.0, max_dwell_cap_seconds)

        if cat in cat_dwell:
            cat_dwell[cat] += dwell
        else:
            cat_dwell["neutral"] += dwell

    total_dwell = sum(cat_dwell.values())
    distracting_dwell = cat_dwell["distracting"]
    productive_dwell = cat_dwell["productive"]

    distraction_ratio = (distracting_dwell / total_dwell * 100.0) if total_dwell > 0 else 0.0
    productivity_score = (productive_dwell / total_dwell * 100.0) if total_dwell > 0 else 100.0
    switches = calculate_context_switches(categories_sequence)

    return {
        "total_dwell_seconds": round(total_dwell, 1),
        "productive_seconds": round(productive_dwell, 1),
        "neutral_seconds": round(cat_dwell["neutral"], 1),
        "distracting_seconds": round(distracting_dwell, 1),
        "distraction_ratio_pct": round(distraction_ratio, 1),
        "productivity_score_pct": round(productivity_score, 1),
        "context_switches": switches,
        "methodology_assumption": (
            f"Event dwell capped at {max_dwell_cap_seconds}s per transition. "
            "Sparse event logs do not measure millisecond keystrokes; gaps beyond the cap represent idle periods."
        ),
    }
