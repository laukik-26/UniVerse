"""
Unit tests for UniVerse Module D: Privacy-Aware Digital Wellbeing.
Tests domain normalization, rule-based categorization, focus duration with pause exclusions,
context switch calculations, dwell estimations, and user data purge.
"""

import pytest
from wellbeing import (
    normalize_domain,
    categorize_domain,
    calculate_focus_duration,
    calculate_context_switches,
    calculate_dwell_and_distraction,
)
from database import get_connection
from routers.wellbeing import (
    record_aggregate_session,
    list_aggregate_sessions,
    purge_wellbeing_data,
    AggregateSessionCreate,
)

def test_normalize_domain_clean():
    """Verify normalization strips protocol, www, ports, paths, and query parameters."""
    assert normalize_domain("https://WWW.GitHub.com:443/torvalds/linux?tab=stars#readme") == "github.com"
    assert normalize_domain("http://docs.python.org/3/library/unittest.html") == "docs.python.org"
    assert normalize_domain("WWW.Youtube.Com/watch?v=12345") == "youtube.com"
    assert normalize_domain("reddit.com/r/programming/") == "reddit.com"
    assert normalize_domain("   https://Coursera.org   ") == "coursera.org"
    assert normalize_domain("") == ""

def test_categorize_domain_default_and_custom():
    """Verify default categorization and user-defined override rules."""
    assert categorize_domain("github.com") == "productive"
    assert categorize_domain("stackoverflow.com") == "productive"
    assert categorize_domain("youtube.com") == "distracting"
    assert categorize_domain("reddit.com") == "distracting"
    assert categorize_domain("wikipedia.org") == "neutral"
    assert categorize_domain("unknown-campus-forum.edu") == "neutral"

    # Custom override: student classifies youtube as productive for video lectures
    custom = {"youtube.com": "productive", "unknown-campus-forum.edu": "productive"}
    assert categorize_domain("youtube.com", custom_rules=custom) == "productive"
    assert categorize_domain("unknown-campus-forum.edu", custom_rules=custom) == "productive"

def test_calculate_focus_duration_no_pauses():
    """Verify standard duration when no pause occurred."""
    start = 1000.0
    stop = 1600.0
    duration = calculate_focus_duration(start, stop, paused_intervals=[])
    assert duration == 600.0

def test_calculate_focus_duration_with_pauses():
    """Verify paused intervals are excluded strictly from elapsed time."""
    start = 1000.0
    stop = 2000.0
    # Two pauses: 1100-1200 (100s) and 1500-1700 (200s)
    pauses = [(1100.0, 1200.0), (1500.0, 1700.0)]
    duration = calculate_focus_duration(start, stop, paused_intervals=pauses)
    # Total elapsed: 1000s, total paused: 300s -> effective 700s
    assert duration == 700.0

def test_calculate_focus_duration_clamped_bounds():
    """Verify pauses extending before start or after stop are clamped strictly."""
    start = 1000.0
    stop = 1500.0
    pauses = [(900.0, 1100.0), (1450.0, 1600.0)]
    # Clamped: 1000-1100 (100s) and 1450-1500 (50s) -> total paused: 150s
    duration = calculate_focus_duration(start, stop, paused_intervals=pauses)
    assert duration == 350.0

def test_calculate_focus_duration_invalid_stop_raises():
    """Verify stop timestamp before start raises ValueError."""
    with pytest.raises(ValueError):
        calculate_focus_duration(2000.0, 1000.0)

def test_calculate_context_switches():
    """Verify transitions between consecutive categories are counted correctly."""
    assert calculate_context_switches([]) == 0
    assert calculate_context_switches(["productive"]) == 0
    assert calculate_context_switches(["productive", "productive", "productive"]) == 0
    # productive -> distracting (1), distracting -> neutral (2)
    cats = ["productive", "productive", "distracting", "distracting", "neutral", "productive"]
    assert calculate_context_switches(cats) == 3

def test_calculate_dwell_and_distraction_capped():
    """Verify dwell calculation applies documented 300s cap per event delta."""
    events = [
        {"timestamp_seconds": 100.0, "category": "productive"},
        {"timestamp_seconds": 200.0, "category": "distracting"},  # delta 100s
        {"timestamp_seconds": 900.0, "category": "neutral"},      # delta 700s -> capped at 300s
    ]
    res = calculate_dwell_and_distraction(events, max_dwell_cap_seconds=300.0)
    assert res["productive_seconds"] == 100.0
    assert res["distracting_seconds"] == 300.0  # capped
    assert res["neutral_seconds"] == 30.0       # last event default
    assert res["context_switches"] == 2
    assert res["distraction_ratio_pct"] > 0.0
    assert "capped at 300.0s" in res["methodology_assumption"]

def test_wellbeing_data_purge():
    """Verify user can permanently purge all stored wellbeing sessions."""
    # Insert test record
    session_req = AggregateSessionCreate(
        session_duration_seconds=1800,
        paused_seconds=300,
        effective_duration_seconds=1500,
        context_switches=4,
        distraction_dwell_seconds=180,
        productivity_score_pct=88.5,
    )
    record_aggregate_session(session_req)

    # Verify session exists
    sessions = list_aggregate_sessions()
    assert len(sessions) >= 1

    # Purge data
    purge_res = purge_wellbeing_data()
    assert purge_res["status"] == "success"
    assert purge_res["deleted_records"] >= 1

    # Verify database is now empty
    post_purge = list_aggregate_sessions()
    assert len(post_purge) == 0

def test_wellbeing_minimal_data_principle():
    """Verify that wellbeing_sessions table schema has no URL or history columns."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(wellbeing_sessions)")
    columns = [col[1] for col in cursor.fetchall()]
    conn.close()

    # Must contain only aggregate metrics
    assert "id" in columns
    assert "effective_duration_seconds" in columns
    assert "context_switches" in columns
    assert "productivity_score_pct" in columns

    # Must NOT contain raw personal data
    forbidden = ["url", "raw_url", "domain", "query", "keystroke", "page_title", "content"]
    for f in forbidden:
        assert f not in columns
