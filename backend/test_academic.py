"""
Automated unit and integration test suite for UniVerse Module A.
Directly tests business logic, algorithms, database persistence, and API functions.
"""

import pytest
from database import init_db
from seed import seed_database
from models import (
    TaskCreate, 
    TaskUpdate, 
    MentorshipRequestCreate, 
    MentorshipRequestStatusUpdate, 
    ResourceCreate
)
from routers.academic import (
    get_student_profile,
    get_tasks,
    create_task,
    update_task,
    delete_task,
    get_placement_progress,
    get_peer_mentors,
    get_mentorship_requests,
    create_mentorship_request,
    update_mentorship_request_status,
    get_academic_resources,
    create_academic_resource,
    download_resource,
)
from routers.activities import get_activities
from fastapi import HTTPException

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    seed_database()

def test_student_profile_structure():
    profile = get_student_profile(student_id="STU-2026-0842")
    assert profile.student_id == "STU-2026-0842"
    assert profile.name == "Alex Rivera"
    assert profile.department == "Computer Science & Engineering"
    assert profile.cgpa == 8.72
    assert "Python" in profile.skills
    assert "Cloud Systems" in profile.interests

def test_placement_progress_dynamic_calculation():
    # 1. Fetch initial progress
    prog_init = get_placement_progress(student_id="STU-2026-0842")
    init_total = prog_init.total_tasks
    init_completed = prog_init.completed_tasks
    assert init_total > 0
    expected_initial_pct = round((init_completed / init_total * 100), 1)
    assert prog_init.completion_percentage == expected_initial_pct

    # 2. Add a new task (pending)
    new_task = create_task(
        task_in=TaskCreate(title="Solve 20 Dynamic Programming Problems", category="DSA", due_date="2026-11-20"),
        student_id="STU-2026-0842"
    )
    assert new_task.status == "pending"

    # 3. Check progress after adding task (total increases, completion % changes)
    prog_after_add = get_placement_progress(student_id="STU-2026-0842")
    assert prog_after_add.total_tasks == init_total + 1
    assert prog_after_add.completed_tasks == init_completed
    expected_new_pct = round((init_completed / (init_total + 1) * 100), 1)
    assert prog_after_add.completion_percentage == expected_new_pct

    # 4. Mark the new task completed
    updated_task = update_task(
        task_id=new_task.id,
        task_in=TaskUpdate(status="completed")
    )
    assert updated_task.status == "completed"

    # 5. Check progress after completion
    prog_after_comp = get_placement_progress(student_id="STU-2026-0842")
    assert prog_after_comp.completed_tasks == init_completed + 1
    expected_comp_pct = round(((init_completed + 1) / (init_total + 1) * 100), 1)
    assert prog_after_comp.completion_percentage == expected_comp_pct

    # 6. Verify categories reflect the new task
    dsa_cat = prog_after_comp.tasks_by_category["DSA"]
    assert dsa_cat["total"] >= 1
    assert dsa_cat["completed"] >= 1

    # Cleanup
    delete_task(task_id=new_task.id)

def test_empty_task_list_progress_behavior():
    """Verify that querying progress for a student with zero tasks safely returns 0.0% without division-by-zero."""
    empty_prog = get_placement_progress(student_id="STU-NONEXISTENT-9999")
    assert empty_prog.total_tasks == 0
    assert empty_prog.completed_tasks == 0
    assert empty_prog.completion_percentage == 0.0
    for cat, data in empty_prog.tasks_by_category.items():
        assert data["total"] == 0
        assert data["completed"] == 0
        assert data["percent"] == 0.0

def test_peer_mentors_search_and_filter():
    # 1. All mentors
    all_mentors = get_peer_mentors()
    assert len(all_mentors) >= 4

    # 2. Query search by skill (e.g. "Graph")
    graph_mentors = get_peer_mentors(q="Graph")
    assert len(graph_mentors) >= 1
    assert any("Sarah Lin" in m.name for m in graph_mentors)

    # 3. Filter by availability
    avail_mentors = get_peer_mentors(availability="available")
    assert len(avail_mentors) >= 2
    for m in avail_mentors:
        assert m.availability == "available"

def test_prevent_duplicate_pending_mentorship_requests():
    # Select mentor-2 (Dev Patel)
    req_payload = MentorshipRequestCreate(
        mentor_id="mentor-2",
        topic="Full-Stack System Architecture Review",
        message="Would love a review of our microservice API structure before the interview drive.",
        student_id="STU-2026-0842",
        student_name="Alex Rivera"
    )

    # First request should succeed
    created_req = None
    try:
        created_req = create_mentorship_request(req_payload)
        assert created_req.status == "pending"
        assert created_req.mentor_name == "Dev Patel"
    except HTTPException as e:
        if e.status_code == 400 and "already have an active pending mentorship request" in e.detail:
            pass  # Already pending from prior run

    # Second attempt MUST raise 400 Bad Request
    with pytest.raises(HTTPException) as excinfo:
        create_mentorship_request(req_payload)
    assert excinfo.value.status_code == 400
    assert "already have an active pending mentorship request" in excinfo.value.detail

    # Clean up request status to 'accepted' so tests remain idempotent
    if created_req:
        update_mentorship_request_status(
            request_id=created_req.id,
            update_in=MentorshipRequestStatusUpdate(status="accepted")
        )

def test_mentor_accept_and_decline_workflow():
    # Request for mentor-4 (Kevin Zhang)
    req_payload = MentorshipRequestCreate(
        mentor_id="mentor-4",
        topic="Network Sockets & Concurrency Review",
        message="Need guidance on socket polling and thread primitives.",
        student_id="STU-2026-0842",
        student_name="Alex Rivera"
    )

    req = create_mentorship_request(req_payload)
    assert req.status == "pending"

    # Mentor accepts
    accepted = update_mentorship_request_status(
        request_id=req.id,
        update_in=MentorshipRequestStatusUpdate(status="accepted")
    )
    assert accepted.status == "accepted"

    # Mentor can update to declined or re-evaluate
    declined = update_mentorship_request_status(
        request_id=req.id,
        update_in=MentorshipRequestStatusUpdate(status="declined")
    )
    assert declined.status == "declined"

def test_academic_resource_search_and_validation():
    # Search for "Operating Systems"
    os_resources = get_academic_resources(subject="Operating Systems")
    assert len(os_resources) >= 1
    for r in os_resources:
        assert r.subject == "Operating Systems"

    # Add a new resource
    new_res = ResourceCreate(
        title="CS308: Compiler Design & Abstract Syntax Trees Lecture Notes",
        subject="Compilers",
        resource_type="Lecture Notes",
        tags=["AST", "Parsing", "Lexer", "Grammars"],
        description="Detailed notes on bottom-up parsing, LR parser tables, and code generation.",
        url="",
        is_placeholder=True,
        uploaded_by="Alex Rivera (Student)"
    )

    created = create_academic_resource(new_res)
    assert created.is_placeholder is True
    assert created.url.startswith("placeholder://")
    assert created.downloads_count == 0

    # Increment download
    dl_res = download_resource(created.id)
    assert dl_res["downloads_count"] == 1
    assert dl_res["is_placeholder"] is True

def test_shared_activity_events_logged():
    activities = get_activities(limit=10)
    assert len(activities) > 0
    # Verify events contain valid module tag
    assert any(a.module == "academic-hub" for a in activities)
