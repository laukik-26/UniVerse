"""
Activity events router for UniVerse shared notifications.
"""

from typing import List, Optional
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from database import get_connection
from models import ActivityEventResponse, ActivityEventCreate

router = APIRouter(prefix="/api/activities", tags=["Activities"])

@router.get("", response_model=List[ActivityEventResponse])
def get_activities(limit: int = 20):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, module, title, event_type, timestamp, is_read, created_at
        FROM activity_events
        ORDER BY created_at DESC
        LIMIT ?
        """,
        (limit,)
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        ActivityEventResponse(
            id=row["id"],
            module=row["module"],
            title=row["title"],
            event_type=row["event_type"],
            timestamp=row["timestamp"],
            is_read=bool(row["is_read"]),
            created_at=row["created_at"]
        )
        for row in rows
    ]

@router.post("", response_model=ActivityEventResponse)
def create_activity(event: ActivityEventCreate):
    event_id = f"act-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    timestamp_display = "Just now"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO activity_events (
            id, module, title, event_type, timestamp, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?)
        """,
        (event_id, event.module, event.title, event.event_type, timestamp_display, now_str)
    )
    conn.commit()
    conn.close()

    return ActivityEventResponse(
        id=event_id,
        module=event.module,
        title=event.title,
        event_type=event.event_type,
        timestamp=timestamp_display,
        is_read=False,
        created_at=now_str
    )

@router.patch("/mark-all-read")
def mark_all_read():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE activity_events SET is_read = 1")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "All notifications marked as read"}
