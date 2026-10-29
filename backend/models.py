"""
Pydantic data schemas and validation models for UniVerse Module A.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# ----------------- Student & Tasks -----------------

class StudentProfileModel(BaseModel):
    id: str
    name: str
    student_id: str
    department: str
    term: str
    cgpa: float
    placement_goal: str
    skills: List[str]
    interests: List[str]

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    category: Literal["DSA", "Development", "CS Fundamentals", "Aptitude", "Interview Prep"]
    due_date: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    category: Optional[Literal["DSA", "Development", "CS Fundamentals", "Aptitude", "Interview Prep"]] = None
    status: Optional[Literal["pending", "completed"]] = None
    due_date: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    student_id: str
    title: str
    category: str
    status: str
    due_date: Optional[str] = None
    created_at: str

class PlacementProgressResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_percentage: float
    tasks_by_category: dict

# ----------------- Mentorship -----------------

class MentorResponse(BaseModel):
    id: str
    name: str
    role_title: str
    department: str
    bio: str
    skills: List[str]
    expertise: List[str]
    availability: Literal["available", "busy", "away"]
    rating: float
    sessions_count: int

class MentorshipRequestCreate(BaseModel):
    mentor_id: str
    topic: str = Field(..., min_length=3, max_length=100)
    message: str = Field(..., min_length=5, max_length=500)
    student_id: Optional[str] = "STU-2026-0842"
    student_name: Optional[str] = "Alex Rivera"

class MentorshipRequestStatusUpdate(BaseModel):
    status: Literal["accepted", "declined"]

class MentorshipRequestResponse(BaseModel):
    id: str
    mentor_id: str
    mentor_name: str
    student_id: str
    student_name: str
    topic: str
    message: str
    status: str
    created_at: str

# ----------------- Academic Resources -----------------

class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    subject: str = Field(..., min_length=2, max_length=100)
    resource_type: Literal["Lecture Notes", "Question Paper", "Practice Exercise", "Reference Guide"]
    tags: List[str] = Field(default_factory=list)
    description: str = Field(..., min_length=5, max_length=600)
    url: Optional[str] = None
    is_placeholder: bool = False
    uploaded_by: Optional[str] = "Alex Rivera (Student)"

class AcademicResourceResponse(BaseModel):
    id: str
    title: str
    subject: str
    resource_type: str
    tags: List[str]
    description: str
    url: str
    is_placeholder: bool
    uploaded_by: str
    created_at: str
    downloads_count: int

# ----------------- Shared Activity Events -----------------

class ActivityEventResponse(BaseModel):
    id: str
    module: str
    title: str
    event_type: str
    timestamp: str
    is_read: bool
    created_at: str

class ActivityEventCreate(BaseModel):
    module: str
    title: str
    event_type: Literal["info", "success", "warning", "alert"] = "info"
