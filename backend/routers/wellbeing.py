"""
Privacy-Aware Digital Wellbeing REST API router for UniVerse Module D.
Accepts only privacy-preserving aggregate metrics. Never logs raw URLs or personal browsing.
"""

from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from database import get_connection
from wellbeing import (
    DEFAULT_CATEGORIZATION_RULES,
    normalize_domain,
    categorize_domain,
    calculate_focus_duration,
    calculate_context_switches,
    calculate_dwell_and_distraction,
)

router = APIRouter(prefix="/api/wellbeing", tags=["Digital Wellbeing"])

# ----------------- Pydantic Models -----------------

class AggregateSessionCreate(BaseModel):
    session_duration_seconds: int = Field(..., ge=0, description="Total session duration including pauses")
    paused_seconds: int = Field(0, ge=0, description="Sum of paused intervals")
    effective_duration_seconds: int = Field(..., ge=0, description="Active focus duration excluding pauses")
    context_switches: int = Field(0, ge=0, description="Transitions between different domain categories")
    distraction_dwell_seconds: int = Field(0, ge=0, description="Estimated seconds on distracting categories")
    productivity_score_pct: float = Field(..., ge=0.0, le=100.0, description="Percentage score")

class AggregateSessionResponse(BaseModel):
    id: str
    session_duration_seconds: int
    paused_seconds: int
    effective_duration_seconds: int
    context_switches: int
    distraction_dwell_seconds: int
    productivity_score_pct: float
    created_at: str

class SyntheticEventItem(BaseModel):
    raw_domain_or_url: str
    timestamp_seconds: float

class EvaluateEventsRequest(BaseModel):
    events: List[SyntheticEventItem]
    custom_rules: Optional[Dict[str, str]] = None
    max_dwell_cap_seconds: float = 300.0

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

@router.get("/default-rules")
def get_default_rules():
    """Returns standard domain categorization rules."""
    return {"rules": DEFAULT_CATEGORIZATION_RULES}

@router.post("/evaluate-events")
def evaluate_synthetic_events(payload: EvaluateEventsRequest):
    """
    Evaluates synthetic demonstration events with domain normalization and dwell time estimation.
    Zero raw browser data is retained on the server.
    """
    categorized_events = []
    for ev in payload.events:
        norm = normalize_domain(ev.raw_domain_or_url)
        cat = categorize_domain(norm, payload.custom_rules)
        categorized_events.append({
            "normalized_domain": norm,
            "category": cat,
            "timestamp_seconds": ev.timestamp_seconds,
        })

    metrics = calculate_dwell_and_distraction(
        categorized_events,
        max_dwell_cap_seconds=payload.max_dwell_cap_seconds
    )

    return {
        "categorized_events": categorized_events,
        "metrics": metrics,
        "privacy_disclosure": (
            "All event evaluation is analytical. No raw URLs, search queries, or page contents "
            "are stored in server-side logs."
        ),
    }

@router.post("/sessions", response_model=AggregateSessionResponse, status_code=status.HTTP_201_CREATED)
def record_aggregate_session(session: AggregateSessionCreate):
    """
    Saves an aggregate focus session.
    MINIMAL DATA PRINCIPLE: Only high-level duration and context-switch counts are stored.
    """
    session_id = f"foc-{uuid.uuid4().hex[:8]}"
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO wellbeing_sessions (
            id, session_duration_seconds, paused_seconds, effective_duration_seconds,
            context_switches, distraction_dwell_seconds, productivity_score_pct, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            session_id,
            session.session_duration_seconds,
            session.paused_seconds,
            session.effective_duration_seconds,
            session.context_switches,
            session.distraction_dwell_seconds,
            session.productivity_score_pct,
            created_at,
        ),
    )

    # Log aggregate summary to shared activity feed
    effective_mins = round(session.effective_duration_seconds / 60, 1)
    title = (
        f"Focus Session Completed: {effective_mins} mins effective focus "
        f"({session.context_switches} context switches, {session.productivity_score_pct}% productive)"
    )
    log_activity_event(cursor, "digital-wellbeing", title, "success")

    conn.commit()
    conn.close()

    return AggregateSessionResponse(
        id=session_id,
        session_duration_seconds=session.session_duration_seconds,
        paused_seconds=session.paused_seconds,
        effective_duration_seconds=session.effective_duration_seconds,
        context_switches=session.context_switches,
        distraction_dwell_seconds=session.distraction_dwell_seconds,
        productivity_score_pct=session.productivity_score_pct,
        created_at=created_at,
    )

@router.get("/sessions", response_model=List[AggregateSessionResponse])
def list_aggregate_sessions():
    """Lists saved aggregate focus sessions."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT 
            id, session_duration_seconds, paused_seconds, effective_duration_seconds,
            context_switches, distraction_dwell_seconds, productivity_score_pct, created_at
        FROM wellbeing_sessions
        ORDER BY created_at DESC
        """
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        AggregateSessionResponse(
            id=row[0],
            session_duration_seconds=row[1],
            paused_seconds=row[2],
            effective_duration_seconds=row[3],
            context_switches=row[4],
            distraction_dwell_seconds=row[5],
            productivity_score_pct=row[6],
            created_at=row[7],
        )
        for row in rows
    ]

@router.delete("/data", status_code=status.HTTP_200_OK)
def purge_wellbeing_data():
    """
    PERMANENT USER DATA PURGE:
    Deletes all saved aggregate focus sessions in accordance with user data sovereignty.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM wellbeing_sessions")
    deleted_count = cursor.fetchone()[0]

    cursor.execute("DELETE FROM wellbeing_sessions")
    log_activity_event(
        cursor,
        "digital-wellbeing",
        f"User Data Sovereignty: Purged {deleted_count} local wellbeing session records.",
        "warning",
    )
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "deleted_records": deleted_count,
        "message": "All server-side wellbeing records have been permanently erased.",
    }
