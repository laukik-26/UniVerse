"""
Responsible Examination Monitoring REST API router for UniVerse Module E.
Manages Incident Review Workflow, Proctor Audit Logging, and Observable Rule Evaluation.

ETHICAL COMPLIANCE:
Automated flags are behavioral cues requiring mandatory human proctor review.
Zero automated penalties or disqualifications.
"""

from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from database import get_connection
from exam_rules import (
    evaluate_event_window,
    is_point_in_box,
    compute_box_intersection_iou,
    evaluate_zone_geometry,
)

router = APIRouter(prefix="/api/exam", tags=["Responsible Examination Monitoring"])

# ----------------- Pydantic Models -----------------

VALID_STATUSES = ["pending_review", "in_review", "dismissed", "resolved"]
VALID_EVENT_TYPES = [
    "Repeated Head-Turn Cues",
    "Restricted Zone Intrusion",
    "Prolonged Absence",
    "Multiple Faces In Frame",
]

class IncidentResponse(BaseModel):
    id: str
    session_id: str
    desk_label: str
    source: str
    event_type: str
    confidence: float
    timestamp: str
    status: str
    reviewer_notes: str
    created_at: str
    updated_at: str

class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., description="Target status: pending_review, in_review, dismissed, resolved")
    reviewer_notes: Optional[str] = Field(None, description="Proctor evaluation justification note")
    actor_name: str = Field("Human Proctor", description="Name of the authenticated reviewing invigilator")

class IncidentCreateRequest(BaseModel):
    session_id: str = "EXAM-2026-CS301"
    desk_label: str = "Desk 08 (Anonymous)"
    source: str = "Synthetic Demo"
    event_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    timestamp: Optional[str] = None
    reviewer_notes: Optional[str] = ""

class AuditLogEntryResponse(BaseModel):
    id: str
    incident_id: str
    action: str
    actor_role: str
    previous_status: str
    new_status: str
    notes: str
    timestamp: str

class RuleEvaluationRequest(BaseModel):
    rule_type: str = Field(..., description="'head_turn_window' or 'zone_intrusion'")
    # For head_turn_window
    timestamps: Optional[List[float]] = None
    window_seconds: Optional[float] = 30.0
    threshold_count: Optional[int] = 3
    # For zone_intrusion
    detected_box: Optional[List[float]] = None  # [x1, y1, x2, y2]
    restricted_zone_box: Optional[List[float]] = None  # [x1, y1, x2, y2]

def log_activity_event(cursor, module: str, title: str, event_type: str = "info"):
    event_id = f"act-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """
        INSERT INTO activity_events (
            id, module, title, event_type, timestamp, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?)
        """,
        (event_id, module, title, event_type, "Just now", now_str),
    )

# ----------------- Endpoints -----------------

@router.get("/incidents", response_model=List[IncidentResponse])
def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    event_type_filter: Optional[str] = Query(None, alias="event_type"),
):
    """
    Returns exam monitoring incidents queue.
    Supports filtering by review status and observable event type.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Safely unwrap FastAPI Query object for direct test calls
    status_val = status_filter if isinstance(status_filter, str) else None
    event_val = event_type_filter if isinstance(event_type_filter, str) else None

    query = """
    SELECT id, session_id, desk_label, source, event_type, confidence,
           timestamp, status, reviewer_notes, created_at, updated_at
    FROM exam_incidents
    WHERE 1=1
    """
    params = []

    if status_val:
        query += " AND status = ?"
        params.append(status_val)
    if event_val:
        query += " AND event_type = ?"
        params.append(event_val)

    query += " ORDER BY created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [
        IncidentResponse(
            id=r[0],
            session_id=r[1],
            desk_label=r[2],
            source=r[3],
            event_type=r[4],
            confidence=r[5],
            timestamp=r[6],
            status=r[7],
            reviewer_notes=r[8],
            created_at=r[9],
            updated_at=r[10],
        )
        for r in rows
    ]

@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str):
    """Returns single incident details."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, session_id, desk_label, source, event_type, confidence,
               timestamp, status, reviewer_notes, created_at, updated_at
        FROM exam_incidents
        WHERE id = ?
        """,
        (incident_id,),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")

    return IncidentResponse(
        id=row[0],
        session_id=row[1],
        desk_label=row[2],
        source=row[3],
        event_type=row[4],
        confidence=row[5],
        timestamp=row[6],
        status=row[7],
        reviewer_notes=row[8],
        created_at=row[9],
        updated_at=row[10],
    )

@router.patch("/incidents/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(incident_id: str, payload: IncidentStatusUpdate):
    """
    HUMAN REVIEW WORKFLOW ACTION:
    Updates incident status ('pending_review', 'in_review', 'dismissed', 'resolved')
    and appends reviewer evaluation notes.
    MANDATORY AUDIT TRAIL: Automatically writes an immutable entry into `exam_audit_log`.
    """
    target_status = payload.status.lower().strip()
    if target_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Must be one of: {VALID_STATUSES}",
        )

    conn = get_connection()
    cursor = conn.cursor()

    # Verify incident exists and fetch previous status
    cursor.execute("SELECT status, reviewer_notes, event_type, desk_label FROM exam_incidents WHERE id = ?", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")

    prev_status = row[0]
    existing_notes = row[1]
    event_type = row[2]
    desk_label = row[3]

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Combine or replace reviewer notes
    new_notes = existing_notes
    if payload.reviewer_notes is not None:
        note_entry = f"[{now_str}] {payload.actor_name}: {payload.reviewer_notes.strip()}"
        new_notes = f"{existing_notes}\n{note_entry}".strip() if existing_notes else note_entry

    # 1. Update incident record
    cursor.execute(
        """
        UPDATE exam_incidents
        SET status = ?, reviewer_notes = ?, updated_at = ?
        WHERE id = ?
        """,
        (target_status, new_notes, now_str, incident_id),
    )

    # 2. Immutable Audit Trail Entry
    audit_id = f"aud-{uuid.uuid4().hex[:8]}"
    cursor.execute(
        """
        INSERT INTO exam_audit_log (
            id, incident_id, action, actor_role, previous_status, new_status, notes, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            audit_id,
            incident_id,
            f"status_transition_to_{target_status}",
            payload.actor_name,
            prev_status,
            target_status,
            payload.reviewer_notes or "Status updated by human proctor.",
            now_str,
        ),
    )

    # 3. Log to activity feed
    activity_type = "success" if target_status in ["dismissed", "resolved"] else "info"
    status_label = target_status.replace("_", " ").title()
    title = f"Proctor Review: {desk_label} [{event_type}] marked as '{status_label}' by {payload.actor_name}."
    log_activity_event(cursor, "exam-monitoring", title, activity_type)

    conn.commit()

    # Re-fetch updated row
    cursor.execute(
        """
        SELECT id, session_id, desk_label, source, event_type, confidence,
               timestamp, status, reviewer_notes, created_at, updated_at
        FROM exam_incidents
        WHERE id = ?
        """,
        (incident_id,),
    )
    updated = cursor.fetchone()
    conn.close()

    return IncidentResponse(
        id=updated[0],
        session_id=updated[1],
        desk_label=updated[2],
        source=updated[3],
        event_type=updated[4],
        confidence=updated[5],
        timestamp=updated[6],
        status=updated[7],
        reviewer_notes=updated[8],
        created_at=updated[9],
        updated_at=updated[10],
    )

@router.post("/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(incident: IncidentCreateRequest):
    """
    Creates a new exam monitoring incident.
    Source is clearly identified (e.g. 'Synthetic Demo' or 'Local CV Model').
    """
    inc_id = f"inc-{uuid.uuid4().hex[:6]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    time_display = incident.timestamp or datetime.now().strftime("%H:%M:%S")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO exam_incidents (
            id, session_id, desk_label, source, event_type, confidence,
            timestamp, status, reviewer_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, ?, ?)
        """,
        (
            inc_id,
            incident.session_id,
            incident.desk_label,
            incident.source,
            incident.event_type,
            incident.confidence,
            time_display,
            incident.reviewer_notes or "",
            now_str,
            now_str,
        ),
    )

    # Initial audit log
    audit_id = f"aud-{uuid.uuid4().hex[:8]}"
    cursor.execute(
        """
        INSERT INTO exam_audit_log (
            id, incident_id, action, actor_role, previous_status, new_status, notes, timestamp
        ) VALUES (?, ?, 'incident_registered', 'System Detection Engine', 'none', 'pending_review', 'Registered for mandatory human review.', ?)
        """,
        (audit_id, inc_id, now_str),
    )

    conn.commit()
    conn.close()

    return IncidentResponse(
        id=inc_id,
        session_id=incident.session_id,
        desk_label=incident.desk_label,
        source=incident.source,
        event_type=incident.event_type,
        confidence=incident.confidence,
        timestamp=time_display,
        status="pending_review",
        reviewer_notes=incident.reviewer_notes or "",
        created_at=now_str,
        updated_at=now_str,
    )

@router.get("/audit-log", response_model=List[AuditLogEntryResponse])
def get_audit_trail(incident_id: Optional[str] = None):
    """Returns proctor audit logging trail for compliance verification."""
    conn = get_connection()
    cursor = conn.cursor()

    if incident_id:
        cursor.execute(
            """
            SELECT id, incident_id, action, actor_role, previous_status, new_status, notes, timestamp
            FROM exam_audit_log
            WHERE incident_id = ?
            ORDER BY timestamp DESC, rowid DESC
            """,
            (incident_id,),
        )
    else:
        cursor.execute(
            """
            SELECT id, incident_id, action, actor_role, previous_status, new_status, notes, timestamp
            FROM exam_audit_log
            ORDER BY timestamp DESC, rowid DESC
            LIMIT 50
            """
        )

    rows = cursor.fetchall()
    conn.close()

    return [
        AuditLogEntryResponse(
            id=r[0],
            incident_id=r[1],
            action=r[2],
            actor_role=r[3],
            previous_status=r[4],
            new_status=r[5],
            notes=r[6],
            timestamp=r[7],
        )
        for r in rows
    ]

@router.post("/evaluate-rules")
def evaluate_exam_rules(req: RuleEvaluationRequest):
    """
    Algorithmically evaluates event-window and geometric zone rules.
    Runs independently of physical video feeds.
    """
    if req.rule_type == "head_turn_window":
        ts = req.timestamps or []
        win = req.window_seconds or 30.0
        thresh = req.threshold_count or 3
        result = evaluate_event_window(ts, window_duration_seconds=win, threshold_count=thresh)
        return {
            "rule_type": "head_turn_window",
            "evaluation": result,
            "ethical_note": "Rule triggers a behavioral cue for proctor evaluation; does not represent misconduct.",
        }

    elif req.rule_type == "zone_intrusion":
        if not req.detected_box or len(req.detected_box) != 4:
            raise HTTPException(status_code=400, detail="detected_box must be a 4-element list [x1, y1, x2, y2]")
        if not req.restricted_zone_box or len(req.restricted_zone_box) != 4:
            raise HTTPException(status_code=400, detail="restricted_zone_box must be a 4-element list [x1, y1, x2, y2]")

        det = tuple(req.detected_box)
        res = tuple(req.restricted_zone_box)
        geom = evaluate_zone_geometry(det, res)
        return {
            "rule_type": "zone_intrusion",
            "evaluation": geom,
            "ethical_note": "Zone overlap indicates proximity cue for proctor inspection.",
        }

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown rule_type '{req.rule_type}'. Choose 'head_turn_window' or 'zone_intrusion'.",
        )
