"""
Unit tests for UniVerse Module E: Responsible Examination Monitoring.
Tests event-window sliding rules, geometric zone intersection calculations,
incident review workflows, mandatory proctor audit logging, and ethical non-punitive safeguards.
"""

import pytest
from exam_rules import (
    evaluate_event_window,
    is_point_in_box,
    compute_box_intersection_iou,
    evaluate_zone_geometry,
)
from routers.exam import (
    list_incidents,
    get_incident,
    update_incident_status,
    create_incident,
    get_audit_trail,
    IncidentStatusUpdate,
    IncidentCreateRequest,
)

def test_sliding_window_event_counting_triggers():
    """Verify rule triggers when at least 3 occurrences fall within a 30-second sliding window."""
    # Head turn cues at seconds 10, 18, 25 (all within 15 seconds)
    timestamps = [10.0, 18.0, 25.0, 95.0]
    result = evaluate_event_window(timestamps, window_duration_seconds=30.0, threshold_count=3)
    assert result["triggered"] is True
    assert result["max_events_in_window"] == 3
    assert len(result["trigger_windows"]) >= 1

def test_sliding_window_event_counting_sparse_no_trigger():
    """Verify sparse occurrences do not falsely trigger the rule."""
    # Head turns spaced 45 seconds apart
    timestamps = [10.0, 55.0, 110.0, 180.0]
    result = evaluate_event_window(timestamps, window_duration_seconds=30.0, threshold_count=3)
    assert result["triggered"] is False
    assert result["max_events_in_window"] <= 2
    assert len(result["trigger_windows"]) == 0

def test_point_in_box_inside_and_outside():
    """Verify 2D Cartesian point containment within bounding box."""
    # Box: x in [0.2, 0.8], y in [0.3, 0.7]
    box = (0.2, 0.3, 0.8, 0.7)
    assert is_point_in_box((0.5, 0.5), box) is True
    assert is_point_in_box((0.2, 0.3), box) is True
    assert is_point_in_box((0.85, 0.5), box) is False
    assert is_point_in_box((0.5, 0.25), box) is False
    # With 0.1 tolerance, (0.85, 0.5) becomes inside
    assert is_point_in_box((0.85, 0.5), box, tolerance=0.1) is True

def test_box_intersection_iou_overlap():
    """Verify geometric intersection area and IoU calculation for overlapping boxes."""
    # Box A: [0.0, 0.0, 2.0, 2.0] (area 4)
    # Box B: [1.0, 1.0, 3.0, 3.0] (area 4)
    # Overlap: [1.0, 1.0, 2.0, 2.0] (area 1)
    # Union: 4 + 4 - 1 = 7, IoU = 1/7 ~= 0.1429
    box_a = (0.0, 0.0, 2.0, 2.0)
    box_b = (1.0, 1.0, 3.0, 3.0)
    is_overlap, inter_area, iou = compute_box_intersection_iou(box_a, box_b)
    assert is_overlap is True
    assert inter_area == 1.0
    assert abs(iou - (1.0 / 7.0)) < 0.001

def test_box_intersection_no_overlap():
    """Verify disjoint boxes have zero intersection and zero IoU."""
    box_a = (0.0, 0.0, 1.0, 1.0)
    box_b = (2.0, 2.0, 3.0, 3.0)
    is_overlap, inter_area, iou = compute_box_intersection_iou(box_a, box_b)
    assert is_overlap is False
    assert inter_area == 0.0
    assert iou == 0.0

def test_zone_intrusion_rule():
    """Verify penetration of restricted zone triggers intrusion flag."""
    # Restricted Zone (e.g. unauthorized side drawer area)
    restricted_zone = (0.75, 0.60, 0.95, 0.90)
    # Detected object (hand entering the restricted area)
    detected_hand = (0.70, 0.65, 0.85, 0.80)
    eval_res = evaluate_zone_geometry(detected_hand, restricted_zone, min_overlap_threshold=0.01)
    assert eval_res["intrusion_triggered"] is True
    assert eval_res["is_overlapping"] is True
    assert eval_res["intersection_area"] > 0.01

def test_incident_list_and_filter():
    """Verify listing incidents supports filtering by status."""
    all_incidents = list_incidents()
    assert len(all_incidents) >= 4

    pending = list_incidents(status_filter="pending_review")
    for inc in pending:
        assert inc.status == "pending_review"

def test_incident_status_transition_with_proctor_notes():
    """Verify human proctor can update status and attach evaluation notes."""
    incidents = list_incidents()
    target_id = incidents[0].id

    # Proctor marks incident as dismissed (false positive) with explanation note
    update_payload = IncidentStatusUpdate(
        status="dismissed",
        reviewer_notes="Scratchpaper glance verified by proctor. No forbidden material.",
        actor_name="Invigilator Dr. Meaghan",
    )
    updated = update_incident_status(target_id, update_payload)
    assert updated.status == "dismissed"
    assert "Scratchpaper glance verified" in updated.reviewer_notes

def test_mandatory_proctor_audit_log_entry():
    """Verify every status transition writes an immutable audit record to exam_audit_log."""
    # Create a fresh incident
    new_inc = create_incident(
        IncidentCreateRequest(
            session_id="EXAM-TEST-101",
            desk_label="Desk 22",
            source="Synthetic Demo",
            event_type="Restricted Zone Intrusion",
            confidence=0.88,
        )
    )

    # Transition to in_review
    update_incident_status(
        new_inc.id,
        IncidentStatusUpdate(
            status="in_review",
            reviewer_notes="Proctor examining secondary camera angle.",
            actor_name="Proctor Sarah",
        ),
    )

    # Verify audit log recorded this transition
    audit_trail = get_audit_trail(incident_id=new_inc.id)
    assert len(audit_trail) >= 2  # registration + status_transition
    latest_audit = audit_trail[0]
    assert latest_audit.incident_id == new_inc.id
    assert latest_audit.new_status == "in_review"
    assert latest_audit.actor_role == "Proctor Sarah"

def test_ethical_non_punitive_safeguard():
    """
    Verify ethical compliance: no incident can be automatically marked with penalties,
    disqualifications, or punitive measures.
    """
    incidents = list_incidents()
    for inc in incidents:
        # Statuses are strictly limited to non-punitive review states
        assert inc.status in ["pending_review", "in_review", "dismissed", "resolved"]
        # Must clearly identify source
        assert inc.source in ["Synthetic Demo", "Local CV Model"]
