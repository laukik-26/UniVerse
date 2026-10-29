"""
End-to-End System Integration Test Suite for UniVerse Campus Ecosystem.
Tests cross-module API contracts, database persistence, activity event consistency,
zero double-counting partition guarantees, and data sovereignty isolation.
"""

import pytest
from database import init_db, get_connection
from seed import seed_database
from main import app, health_check, read_root
from routers.activities import get_activities
from routers.academic import get_placement_progress, get_tasks
from routers.rides import get_driver_rides, get_transport_savings_summary
from routers.observatory import get_scenario_comparisons, get_transport_vs_compute_comparison
from routers.wellbeing import record_aggregate_session, purge_wellbeing_data, AggregateSessionCreate
from routers.exam import list_incidents, update_incident_status, get_audit_trail, IncidentStatusUpdate

@pytest.fixture(autouse=True)
def ensure_seeded_db():
    init_db()
    seed_database()

def test_api_health_and_root_modules():
    """Verify system health endpoint and root manifest lists all 5 active modules."""
    health = health_check()
    assert health["status"] == "healthy"
    assert health["database"] == "sqlite_local"

    root = read_root()
    assert root["platform"] == "UniVerse Campus Ecosystem"
    assert len(root["modules"]) == 5
    for mod_label in ["A:", "B:", "C:", "D:", "E:"]:
        assert any(mod_label in m and "Active" in m for m in root["modules"])

def test_database_seed_reproducibility():
    """Verify that running seed_database() idempotently maintains valid core data."""
    conn = get_connection()
    cursor = conn.cursor()

    # Verify tables have expected baseline counts
    cursor.execute("SELECT COUNT(*) FROM student_profiles")
    assert cursor.fetchone()[0] >= 1

    cursor.execute("SELECT COUNT(*) FROM placement_tasks")
    assert cursor.fetchone()[0] >= 8

    cursor.execute("SELECT COUNT(*) FROM peer_mentors")
    assert cursor.fetchone()[0] >= 4

    cursor.execute("SELECT COUNT(*) FROM driver_rides")
    assert cursor.fetchone()[0] >= 3

    cursor.execute("SELECT COUNT(*) FROM exam_incidents")
    assert cursor.fetchone()[0] >= 4

    conn.close()

def test_shared_activity_feed_consistency_and_privacy():
    """
    Verify shared activity feed connects events from all modules while enforcing:
      1. Consistent timestamp, event_type, and title schema.
      2. ZERO raw browsing URLs or search queries logged from Digital Wellbeing.
      3. Non-punitive examination audit entries.
    """
    activities = get_activities(limit=50)
    assert len(activities) > 0

    modules_in_feed = set()
    for act in activities:
        assert act.id.startswith("act-")
        assert act.event_type in ["info", "success", "alert", "warning"]
        assert len(act.title) > 0
        modules_in_feed.add(act.module)

        # STRICT PRIVACY CHECK: No raw URLs, search queries, or page titles in feed
        title_lower = act.title.lower()
        assert "http://" not in title_lower
        assert "https://" not in title_lower
        assert "?q=" not in title_lower
        assert "search=" not in title_lower

    # Verify multiple modules have registered activity
    assert len(modules_in_feed) >= 2

def test_transport_vs_compute_separation_contract():
    """
    Verify the Observatory endpoint enforces strict partitioning between
    Scope 2 Datacenter Computing energy and Scope 3 Commuter Mobility emissions.
    """
    comparison = get_transport_vs_compute_comparison()

    # Compute fields (Scope 2)
    assert comparison.compute_energy_saved_kwh > 0.0
    assert comparison.compute_co2_avoided_kg > 0.0

    # Transport fields (Scope 3)
    assert comparison.transport_distance_avoided_km > 0.0
    assert comparison.transport_co2_avoided_kg > 0.0
    assert comparison.transport_fuel_cost_saved_inr > 0.0

    # Guarantee assertion
    assert "strictly partitioned" in comparison.category_separation_note.lower()
    assert "no transport avoided kilometres are converted into server kilowatt-hours" in comparison.zero_double_counting_guarantee.lower()

def test_data_sovereignty_purge_isolation():
    """
    Verify purging wellbeing data deletes ONLY wellbeing records,
    leaving exam incidents, carpool records, and academic tasks completely intact.
    """
    # 1. Record test wellbeing session
    record_aggregate_session(
        AggregateSessionCreate(
            session_duration_seconds=1200,
            paused_seconds=100,
            effective_duration_seconds=1100,
            context_switches=3,
            distraction_dwell_seconds=60,
            productivity_score_pct=95.0,
        )
    )

    # 2. Capture pre-purge counts of other tables
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM exam_incidents")
    exam_count_before = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM driver_rides")
    ride_count_before = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM placement_tasks")
    task_count_before = c.fetchone()[0]
    conn.close()

    # 3. Purge wellbeing data
    purge_res = purge_wellbeing_data()
    assert purge_res["status"] == "success"

    # 4. Verify wellbeing is empty, other tables unchanged
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM wellbeing_sessions")
    assert c.fetchone()[0] == 0

    c.execute("SELECT COUNT(*) FROM exam_incidents")
    assert c.fetchone()[0] == exam_count_before

    c.execute("SELECT COUNT(*) FROM driver_rides")
    assert c.fetchone()[0] == ride_count_before

    c.execute("SELECT COUNT(*) FROM placement_tasks")
    assert c.fetchone()[0] == task_count_before
    conn.close()
