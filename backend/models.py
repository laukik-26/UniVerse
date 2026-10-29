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

# ----------------- Smart Campus Ride-Pooling (Module B) -----------------

class CampusLocationResponse(BaseModel):
    id: str
    name: str
    category: str
    x: int
    y: int

class DriverRideCreate(BaseModel):
    origin_id: str
    destination_id: str
    departure_time: str = Field(..., pattern=r"^\d{2}:\d{2}$") # Format: HH:MM
    available_seats: int = Field(..., ge=1, le=8)
    max_detour_km: float = Field(..., ge=0.1, le=10.0)
    driver_id: Optional[str] = "DRV-2026-104"
    driver_name: Optional[str] = "Marcus Vance (Transit Coordinator)"

class DriverRideResponse(BaseModel):
    id: str
    driver_id: str
    driver_name: str
    origin_id: str
    origin_name: str
    destination_id: str
    destination_name: str
    departure_time: str
    available_seats: int
    total_seats: int
    max_detour_km: float
    direct_distance_km: float
    direct_path: List[str]
    status: str
    created_at: str

class PassengerRequestCreate(BaseModel):
    pickup_id: str
    dropoff_id: str
    preferred_time: str = Field(..., pattern=r"^\d{2}:\d{2}$") # Format: HH:MM
    time_flexibility_mins: int = Field(default=15, ge=0, le=60)
    seats_needed: int = Field(default=1, ge=1, le=6)
    max_detour_km: float = Field(default=3.0, ge=0.1, le=10.0)
    passenger_id: Optional[str] = "STU-2026-0842"
    passenger_name: Optional[str] = "Alex Rivera (Student)"

class PassengerRequestResponse(BaseModel):
    id: str
    passenger_id: str
    passenger_name: str
    pickup_id: str
    pickup_name: str
    dropoff_id: str
    dropoff_name: str
    preferred_time: str
    time_flexibility_mins: int
    seats_needed: int
    max_detour_km: float
    direct_distance_km: float
    status: str
    matched_ride_id: Optional[str] = None
    created_at: str

class MatchCandidate(BaseModel):
    ride_id: str
    driver_name: str
    driver_origin: str
    driver_destination: str
    departure_time: str
    available_seats: int
    driver_direct_distance_km: float
    passenger_direct_distance_km: float
    shared_distance_km: float
    detour_km: float
    time_difference_mins: int
    net_saved_distance_km: float
    estimated_cost_savings_inr: float
    estimated_co2_avoided_kg: float
    assumed_stop_order: List[str]
    shared_path_nodes: List[str]
    legs: dict
    match_score: float
    methodology_disclaimer: str

class RejectedCandidate(BaseModel):
    ride_id: str
    driver_name: str
    departure_time: str
    rejection_reason: str
    rejection_detail: str

class RideSearchResult(BaseModel):
    passenger_request: dict
    passenger_direct_distance_km: float
    matches_count: int
    compatible_matches: List[MatchCandidate]
    rejected_candidates: List[RejectedCandidate]

class TransportSavingsSummary(BaseModel):
    total_rides_offered: int
    active_rides_count: int
    total_carpools_completed: int
    total_saved_vkt_km: float
    total_cost_saved_inr: float
    total_co2_avoided_kg: float
    assumed_cost_per_km_inr: float
    assumed_emission_factor_g_km: float
    methodology_note: str

# ----------------- Sustainable Computing Observatory (Module C) -----------------

class WorkloadTelemetrySnapshot(BaseModel):
    mode_label: str
    request_count: int
    requests_per_second: float
    avg_latency_ms: float
    p95_latency_ms: float
    cpu_utilization_pct: float
    cpu_utilization_fraction: float
    memory_usage_mb: int
    optimization_techniques: str

class ServiceWorkloadResponse(BaseModel):
    id: str
    name: str
    module: str
    tech_stack: str
    workload_type: str
    observation_window_seconds: int
    baseline: WorkloadTelemetrySnapshot
    optimized: WorkloadTelemetrySnapshot

class CustomEstimateRequest(BaseModel):
    idle_power_w: float = Field(default=45.0, ge=0.0, le=5000.0)
    max_power_w: float = Field(default=220.0, ge=0.0, le=5000.0)
    utilization_fraction: float = Field(..., ge=0.0, le=1.0)
    duration_seconds: float = Field(default=3600.0, gt=0.0, le=864000.0)
    grid_factor_kg_per_kwh: float = Field(default=0.716, ge=0.0, le=5.0)

class ScenarioEnergyEvaluation(BaseModel):
    utilization_pct: float
    utilization_fraction: float
    average_power_w: float
    energy_kwh: float
    co2_kg: float
    co2_grams: float
    duration_seconds: float

class ServiceScenarioComparison(BaseModel):
    service_id: str
    service_name: str
    module: str
    baseline: ScenarioEnergyEvaluation
    optimized: ScenarioEnergyEvaluation
    absolute_energy_reduction_kwh: float
    energy_savings_percentage: float
    absolute_co2_reduction_kg: float
    co2_savings_percentage: float
    latency_reduction_percentage: float

class ObservatoryScenariosSummary(BaseModel):
    observation_window_seconds: float
    idle_power_w: float
    max_power_w: float
    grid_factor_kg_per_kwh: float
    grid_source_citation: str
    total_baseline_energy_kwh: float
    total_optimized_energy_kwh: float
    total_energy_saved_kwh: float
    overall_energy_savings_percentage: float
    total_baseline_co2_kg: float
    total_optimized_co2_kg: float
    total_co2_avoided_kg: float
    overall_co2_savings_percentage: float
    services: List[ServiceScenarioComparison]
    methodology_disclosure: str

class TransportVsComputeComparison(BaseModel):
    category_separation_note: str
    compute_energy_saved_kwh: float
    compute_co2_avoided_kg: float
    transport_distance_avoided_km: float
    transport_co2_avoided_kg: float
    transport_fuel_cost_saved_inr: float
    zero_double_counting_guarantee: str


