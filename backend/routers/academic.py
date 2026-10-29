"""
Academic Hub router for UniVerse Module A.
Handles Student Profile, Placement Tasks & Progress, Peer Mentorship, and Academic Resources.
"""

from typing import List, Optional
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, status

from database import get_connection
from models import (
    StudentProfileModel,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    PlacementProgressResponse,
    MentorResponse,
    MentorshipRequestCreate,
    MentorshipRequestStatusUpdate,
    MentorshipRequestResponse,
    ResourceCreate,
    AcademicResourceResponse,
)

router = APIRouter(prefix="/api/academic", tags=["Academic Hub"])

def log_activity_event(cursor, module: str, title: str, event_type: str = "info"):
    event_id = f"act-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """
        INSERT INTO activity_events (
            id, module, title, event_type, timestamp, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?)
        """,
        (event_id, module, title, event_type, "Just now", now_str)
    )

# ----------------- Student Profile & Tasks -----------------

@router.get("/profile", response_model=StudentProfileModel)
def get_student_profile(student_id: str = "STU-2026-0842"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_profiles WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile with ID '{student_id}' not found."
        )

    return StudentProfileModel(
        id=row["id"],
        name=row["name"],
        student_id=row["student_id"],
        department=row["department"],
        term=row["term"],
        cgpa=row["cgpa"],
        placement_goal=row["placement_goal"],
        skills=json.loads(row["skills"]),
        interests=json.loads(row["interests"])
    )

@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(student_id: str = "STU-2026-0842"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM placement_tasks WHERE student_id = ? ORDER BY created_at ASC",
        (student_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        TaskResponse(
            id=row["id"],
            student_id=row["student_id"],
            title=row["title"],
            category=row["category"],
            status=row["status"],
            due_date=row["due_date"],
            created_at=row["created_at"]
        )
        for row in rows
    ]

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, student_id: str = "STU-2026-0842"):
    task_id = f"task-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO placement_tasks (
            id, student_id, title, category, status, due_date, created_at
        ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
        """,
        (task_id, student_id, task_in.title, task_in.category, task_in.due_date, now_str)
    )

    log_activity_event(
        cursor,
        module="academic-hub",
        title=f"New placement task added: '{task_in.title}' ({task_in.category})",
        event_type="info"
    )

    conn.commit()
    conn.close()

    return TaskResponse(
        id=task_id,
        student_id=student_id,
        title=task_in.title,
        category=task_in.category,
        status="pending",
        due_date=task_in.due_date,
        created_at=now_str
    )

@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, task_in: TaskUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM placement_tasks WHERE id = ?", (task_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found."
        )

    updated_title = task_in.title if task_in.title is not None else row["title"]
    updated_category = task_in.category if task_in.category is not None else row["category"]
    updated_status = task_in.status if task_in.status is not None else row["status"]
    updated_due = task_in.due_date if task_in.due_date is not None else row["due_date"]

    cursor.execute(
        """
        UPDATE placement_tasks 
        SET title = ?, category = ?, status = ?, due_date = ?
        WHERE id = ?
        """,
        (updated_title, updated_category, updated_status, updated_due, task_id)
    )

    # If status changed to completed, generate an activity event
    if row["status"] != "completed" and updated_status == "completed":
        log_activity_event(
            cursor,
            module="academic-hub",
            title=f"Placement milestone completed: '{updated_title}'",
            event_type="success"
        )

    conn.commit()
    conn.close()

    return TaskResponse(
        id=task_id,
        student_id=row["student_id"],
        title=updated_title,
        category=updated_category,
        status=updated_status,
        due_date=updated_due,
        created_at=row["created_at"]
    )

@router.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM placement_tasks WHERE id = ?", (task_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found."
        )

    cursor.execute("DELETE FROM placement_tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Task '{task_id}' removed."}

@router.get("/progress", response_model=PlacementProgressResponse)
def get_placement_progress(student_id: str = "STU-2026-0842"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT category, status FROM placement_tasks WHERE student_id = ?", (student_id,))
    rows = cursor.fetchall()
    conn.close()

    total_tasks = len(rows)
    completed_tasks = sum(1 for r in rows if r["status"] == "completed")
    completion_percentage = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    categories = ["DSA", "Development", "CS Fundamentals", "Aptitude", "Interview Prep"]
    tasks_by_category = {}
    for cat in categories:
        cat_total = sum(1 for r in rows if r["category"] == cat)
        cat_completed = sum(1 for r in rows if r["category"] == cat and r["status"] == "completed")
        tasks_by_category[cat] = {
            "total": cat_total,
            "completed": cat_completed,
            "percent": round((cat_completed / cat_total * 100), 1) if cat_total > 0 else 0.0
        }

    return PlacementProgressResponse(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        completion_percentage=completion_percentage,
        tasks_by_category=tasks_by_category
    )

# ----------------- Peer Mentors -----------------

@router.get("/mentors", response_model=List[MentorResponse])
def get_peer_mentors(
    q: Optional[str] = None,
    availability: Optional[str] = None
):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM peer_mentors ORDER BY rating DESC")
    rows = cursor.fetchall()
    conn.close()

    mentors = []
    query_str = (q or "").lower().strip()

    for row in rows:
        skills = json.loads(row["skills"])
        expertise = json.loads(row["expertise"])
        name = row["name"]
        bio = row["bio"]
        avail = row["availability"]

        if availability and availability != "all" and avail != availability:
            continue

        if query_str:
            matched = (
                query_str in name.lower() or
                query_str in bio.lower() or
                any(query_str in s.lower() for s in skills) or
                any(query_str in e.lower() for e in expertise)
            )
            if not matched:
                continue

        mentors.append(
            MentorResponse(
                id=row["id"],
                name=name,
                role_title=row["role_title"],
                department=row["department"],
                bio=bio,
                skills=skills,
                expertise=expertise,
                availability=avail,
                rating=row["rating"],
                sessions_count=row["sessions_count"]
            )
        )

    return mentors

# ----------------- Mentorship Requests -----------------

@router.get("/mentorship-requests", response_model=List[MentorshipRequestResponse])
def get_mentorship_requests(
    mentor_id: Optional[str] = None,
    student_id: Optional[str] = None,
    status_filter: Optional[str] = None
):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM mentorship_requests WHERE 1=1"
    params = []

    if mentor_id:
        query += " AND mentor_id = ?"
        params.append(mentor_id)
    if student_id:
        query += " AND student_id = ?"
        params.append(student_id)
    if status_filter and status_filter != "all":
        query += " AND status = ?"
        params.append(status_filter)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()

    return [
        MentorshipRequestResponse(
            id=row["id"],
            mentor_id=row["mentor_id"],
            mentor_name=row["mentor_name"],
            student_id=row["student_id"],
            student_name=row["student_name"],
            topic=row["topic"],
            message=row["message"],
            status=row["status"],
            created_at=row["created_at"]
        )
        for row in rows
    ]

@router.post("/mentorship-requests", response_model=MentorshipRequestResponse, status_code=status.HTTP_201_CREATED)
def create_mentorship_request(req_in: MentorshipRequestCreate):
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Fetch mentor to verify existence and get name
    cursor.execute("SELECT name FROM peer_mentors WHERE id = ?", (req_in.mentor_id,))
    mentor_row = cursor.fetchone()
    if not mentor_row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Peer mentor with ID '{req_in.mentor_id}' does not exist."
        )

    mentor_name = mentor_row["name"]
    student_id = req_in.student_id or "STU-2026-0842"
    student_name = req_in.student_name or "Alex Rivera"

    # 2. Check for duplicate pending requests (CRITICAL REQUIREMENT)
    cursor.execute(
        """
        SELECT COUNT(*) FROM mentorship_requests 
        WHERE mentor_id = ? AND student_id = ? AND status = 'pending'
        """,
        (req_in.mentor_id, student_id)
    )
    if cursor.fetchone()[0] > 0:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have an active pending mentorship request with {mentor_name}. Please wait for their response."
        )

    req_id = f"req-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        """
        INSERT INTO mentorship_requests (
            id, mentor_id, mentor_name, student_id, student_name, topic, message, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        """,
        (req_id, req_in.mentor_id, mentor_name, student_id, student_name, req_in.topic, req_in.message, now_str)
    )

    # Shared integration activity event
    log_activity_event(
        cursor,
        module="academic-hub",
        title=f"Mentorship request submitted to {mentor_name} for '{req_in.topic}'",
        event_type="info"
    )

    conn.commit()
    conn.close()

    return MentorshipRequestResponse(
        id=req_id,
        mentor_id=req_in.mentor_id,
        mentor_name=mentor_name,
        student_id=student_id,
        student_name=student_name,
        topic=req_in.topic,
        message=req_in.message,
        status="pending",
        created_at=now_str
    )

@router.patch("/mentorship-requests/{request_id}/status", response_model=MentorshipRequestResponse)
def update_mentorship_request_status(request_id: str, update_in: MentorshipRequestStatusUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mentorship_requests WHERE id = ?", (request_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mentorship request '{request_id}' not found."
        )

    new_status = update_in.status
    cursor.execute(
        "UPDATE mentorship_requests SET status = ? WHERE id = ?",
        (new_status, request_id)
    )

    # Shared integration activity event
    log_activity_event(
        cursor,
        module="academic-hub",
        title=f"Mentorship request from {row['student_name']} was {new_status} by {row['mentor_name']}",
        event_type="success" if new_status == "accepted" else "warning"
    )

    conn.commit()
    conn.close()

    return MentorshipRequestResponse(
        id=request_id,
        mentor_id=row["mentor_id"],
        mentor_name=row["mentor_name"],
        student_id=row["student_id"],
        student_name=row["student_name"],
        topic=row["topic"],
        message=row["message"],
        status=new_status,
        created_at=row["created_at"]
    )

# ----------------- Academic Resources -----------------

@router.get("/resources", response_model=List[AcademicResourceResponse])
def get_academic_resources(
    q: Optional[str] = None,
    subject: Optional[str] = None,
    resource_type: Optional[str] = None
):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM academic_resources ORDER BY downloads_count DESC")
    rows = cursor.fetchall()
    conn.close()

    resources = []
    query_str = (q or "").lower().strip()

    for row in rows:
        tags = json.loads(row["tags"])
        res_subj = row["subject"]
        res_type = row["resource_type"]
        title = row["title"]
        desc = row["description"]

        if subject and subject != "all" and res_subj.lower() != subject.lower():
            continue

        if resource_type and resource_type != "all" and res_type.lower() != resource_type.lower():
            continue

        if query_str:
            matched = (
                query_str in title.lower() or
                query_str in desc.lower() or
                query_str in res_subj.lower() or
                any(query_str in t.lower() for t in tags)
            )
            if not matched:
                continue

        resources.append(
            AcademicResourceResponse(
                id=row["id"],
                title=title,
                subject=res_subj,
                resource_type=res_type,
                tags=tags,
                description=desc,
                url=row["url"],
                is_placeholder=bool(row["is_placeholder"]),
                uploaded_by=row["uploaded_by"],
                created_at=row["created_at"],
                downloads_count=row["downloads_count"]
            )
        )

    return resources

@router.post("/resources", response_model=AcademicResourceResponse, status_code=status.HTTP_201_CREATED)
def create_academic_resource(res_in: ResourceCreate):
    res_id = f"res-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # If user provided a link, validate it; otherwise use an explicit placeholder URL
    user_url = res_in.url.strip() if res_in.url else ""
    is_placeholder = res_in.is_placeholder or (not user_url.startswith("http"))
    final_url = user_url if (user_url.startswith("http")) else f"placeholder://campus-repository/{res_id}.pdf"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO academic_resources (
            id, title, subject, resource_type, tags, description, url, is_placeholder, uploaded_by, created_at, downloads_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        """,
        (
            res_id,
            res_in.title,
            res_in.subject,
            res_in.resource_type,
            json.dumps(res_in.tags),
            res_in.description,
            final_url,
            1 if is_placeholder else 0,
            res_in.uploaded_by or "Alex Rivera (Student)",
            now_str
        )
    )

    # Shared activity event
    log_activity_event(
        cursor,
        module="academic-hub",
        title=f"New academic resource cataloged: '{res_in.title}' ({res_in.subject})",
        event_type="info"
    )

    conn.commit()
    conn.close()

    return AcademicResourceResponse(
        id=res_id,
        title=res_in.title,
        subject=res_in.subject,
        resource_type=res_in.resource_type,
        tags=res_in.tags,
        description=res_in.description,
        url=final_url,
        is_placeholder=is_placeholder,
        uploaded_by=res_in.uploaded_by or "Alex Rivera (Student)",
        created_at=now_str,
        downloads_count=0
    )

@router.post("/resources/{resource_id}/download")
def download_resource(resource_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM academic_resources WHERE id = ?", (resource_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID '{resource_id}' not found."
        )

    new_count = row["downloads_count"] + 1
    cursor.execute("UPDATE academic_resources SET downloads_count = ? WHERE id = ?", (new_count, resource_id))
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "downloads_count": new_count,
        "url": row["url"],
        "is_placeholder": bool(row["is_placeholder"])
    }
