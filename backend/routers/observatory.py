"""
Sustainable Computing Observatory router for UniVerse Module C.
Handles Service Workload Telemetry, SPECpower Energy Estimation,
Baseline vs. Optimized Scenario Comparisons, and Cross-Module Carbon Disclosures.
"""

from typing import List, Optional
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, status

from database import get_connection
from energy_model import (
    calculate_average_power,
    calculate_energy_kwh,
    calculate_co2_kg,
    calculate_percentage_change,
    evaluate_scenario,
    DEFAULT_IDLE_POWER_W,
    DEFAULT_MAX_POWER_W,
    DEFAULT_DURATION_SECONDS,
    DEFAULT_GRID_FACTOR_KG_PER_KWH,
    GRID_FACTOR_PRESETS,
)
from workloads import get_all_services_telemetry, get_service_telemetry
from models import (
    ServiceWorkloadResponse,
    CustomEstimateRequest,
    ScenarioEnergyEvaluation,
    ServiceScenarioComparison,
    ObservatoryScenariosSummary,
    TransportVsComputeComparison,
)

router = APIRouter(prefix="/api/observatory", tags=["Sustainable Computing Observatory"])

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

# ----------------- 1. Service Workload Telemetry -----------------

@router.get("/services", response_model=List[ServiceWorkloadResponse])
def get_services():
    """
    Returns demonstrable application workloads (Placement API, Resource Search, Ride Matcher)
    with reproducible, seeded telemetry across Baseline and Optimized modes.
    """
    services = get_all_services_telemetry()
    return [ServiceWorkloadResponse(**svc) for svc in services]

@router.get("/services/{service_id}", response_model=ServiceWorkloadResponse)
def get_service_by_id(service_id: str):
    """Returns telemetry details for a single campus microservice."""
    try:
        svc = get_service_telemetry(service_id)
        return ServiceWorkloadResponse(**svc)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found.")

# ----------------- 2. Custom Energy Estimation Endpoint -----------------

@router.post("/estimate")
def compute_custom_estimate(req: CustomEstimateRequest):
    """
    Computes energy consumption and carbon emissions for custom inputs using verified formulas:
      average_power_w = idle_power_w + (max_power_w - idle_power_w) * utilization_fraction
      energy_kwh = average_power_w * duration_seconds / 3,600,000
      co2_kg = energy_kwh * grid_factor_kg_per_kwh
    """
    try:
        avg_power = calculate_average_power(req.idle_power_w, req.max_power_w, req.utilization_fraction)
        kwh = calculate_energy_kwh(avg_power, req.duration_seconds)
        co2_kg = calculate_co2_kg(kwh, req.grid_factor_kg_per_kwh)
        co2_grams = round(co2_kg * 1000.0, 3)

        return {
            "inputs": {
                "idle_power_w": req.idle_power_w,
                "max_power_w": req.max_power_w,
                "utilization_fraction": req.utilization_fraction,
                "utilization_pct": round(req.utilization_fraction * 100.0, 1),
                "duration_seconds": req.duration_seconds,
                "grid_factor_kg_per_kwh": req.grid_factor_kg_per_kwh,
            },
            "results": {
                "average_power_w": avg_power,
                "energy_kwh": kwh,
                "energy_joules": round(avg_power * req.duration_seconds, 2),
                "co2_kg": co2_kg,
                "co2_grams": co2_grams,
            },
            "formula_citations": {
                "power_model": "Linear SPECpower model: P_idle + (P_max - P_idle) * U",
                "energy_conversion": "1 kWh = 3,600,000 Joules (W * s / 3,600,000)",
                "emissions_model": "CEA Indian Grid Baseline Standard (v19.0, 2024)",
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- 3. Baseline vs. Optimized Scenarios Comparison -----------------

@router.get("/scenarios", response_model=ObservatoryScenariosSummary)
def get_scenario_comparisons(
    idle_power_w: float = Query(DEFAULT_IDLE_POWER_W, ge=0.0, le=5000.0),
    max_power_w: float = Query(DEFAULT_MAX_POWER_W, ge=0.0, le=5000.0),
    grid_factor_kg_per_kwh: float = Query(DEFAULT_GRID_FACTOR_KG_PER_KWH, ge=0.0, le=5.0),
    duration_seconds: float = Query(DEFAULT_DURATION_SECONDS, gt=0.0, le=864000.0),
):
    """
    Computes side-by-side Baseline versus Eco-Optimized scenario evaluations across all 3 services.
    Calculates absolute difference and percentage reductions directly from inputs (never hardcoded).
    """
    # Handle direct Python invocations where Query defaults may not be unwrapped
    idle_power_w = float(getattr(idle_power_w, "default", idle_power_w))
    max_power_w = float(getattr(max_power_w, "default", max_power_w))
    grid_factor_kg_per_kwh = float(getattr(grid_factor_kg_per_kwh, "default", grid_factor_kg_per_kwh))
    duration_seconds = float(getattr(duration_seconds, "default", duration_seconds))

    if max_power_w < idle_power_w:
        raise HTTPException(status_code=400, detail="Max power cannot be less than idle power.")

    services = get_all_services_telemetry()
    service_comparisons: List[ServiceScenarioComparison] = []

    total_base_kwh = 0.0
    total_opt_kwh = 0.0
    total_base_co2 = 0.0
    total_opt_co2 = 0.0

    for svc in services:
        base_u = svc["baseline"]["cpu_utilization_fraction"]
        opt_u = svc["optimized"]["cpu_utilization_fraction"]

        # Evaluate Baseline
        base_eval = evaluate_scenario(
            utilization_fraction=base_u,
            duration_seconds=duration_seconds,
            idle_power_w=idle_power_w,
            max_power_w=max_power_w,
            grid_factor_kg_per_kwh=grid_factor_kg_per_kwh
        )

        # Evaluate Optimized
        opt_eval = evaluate_scenario(
            utilization_fraction=opt_u,
            duration_seconds=duration_seconds,
            idle_power_w=idle_power_w,
            max_power_w=max_power_w,
            grid_factor_kg_per_kwh=grid_factor_kg_per_kwh
        )

        # Energy difference & percentage
        abs_kwh_diff, pct_kwh_change = calculate_percentage_change(base_eval["energy_kwh"], opt_eval["energy_kwh"])
        abs_co2_diff, pct_co2_change = calculate_percentage_change(base_eval["co2_kg"], opt_eval["co2_kg"])

        # Latency difference & percentage
        base_lat = svc["baseline"]["avg_latency_ms"]
        opt_lat = svc["optimized"]["avg_latency_ms"]
        _, pct_lat_change = calculate_percentage_change(base_lat, opt_lat)

        total_base_kwh += base_eval["energy_kwh"]
        total_opt_kwh += opt_eval["energy_kwh"]
        total_base_co2 += base_eval["co2_kg"]
        total_opt_co2 += opt_eval["co2_kg"]

        service_comparisons.append(
            ServiceScenarioComparison(
                service_id=svc["id"],
                service_name=svc["name"],
                module=svc["module"],
                baseline=ScenarioEnergyEvaluation(
                    utilization_pct=base_eval["utilization_pct"],
                    utilization_fraction=base_u,
                    average_power_w=base_eval["average_power_w"],
                    energy_kwh=base_eval["energy_kwh"],
                    co2_kg=base_eval["co2_kg"],
                    co2_grams=base_eval["co2_grams"],
                    duration_seconds=duration_seconds,
                ),
                optimized=ScenarioEnergyEvaluation(
                    utilization_pct=opt_eval["utilization_pct"],
                    utilization_fraction=opt_u,
                    average_power_w=opt_eval["average_power_w"],
                    energy_kwh=opt_eval["energy_kwh"],
                    co2_kg=opt_eval["co2_kg"],
                    co2_grams=opt_eval["co2_grams"],
                    duration_seconds=duration_seconds,
                ),
                absolute_energy_reduction_kwh=abs_kwh_diff,
                energy_savings_percentage=pct_kwh_change,
                absolute_co2_reduction_kg=abs_co2_diff,
                co2_savings_percentage=pct_co2_change,
                latency_reduction_percentage=pct_lat_change,
            )
        )

    tot_kwh_saved, tot_kwh_pct = calculate_percentage_change(total_base_kwh, total_opt_kwh)
    tot_co2_saved, tot_co2_pct = calculate_percentage_change(total_base_co2, total_opt_co2)

    return ObservatoryScenariosSummary(
        observation_window_seconds=duration_seconds,
        idle_power_w=idle_power_w,
        max_power_w=max_power_w,
        grid_factor_kg_per_kwh=grid_factor_kg_per_kwh,
        grid_source_citation="Central Electricity Authority (CEA) Indian Power Sector Baseline v19.0 (Published 2024)",
        total_baseline_energy_kwh=round(total_base_kwh, 4),
        total_optimized_energy_kwh=round(total_opt_kwh, 4),
        total_energy_saved_kwh=tot_kwh_saved,
        overall_energy_savings_percentage=tot_kwh_pct,
        total_baseline_co2_kg=round(total_base_co2, 4),
        total_optimized_co2_kg=round(total_opt_co2, 4),
        total_co2_avoided_kg=tot_co2_saved,
        overall_co2_savings_percentage=tot_co2_pct,
        services=service_comparisons,
        methodology_disclosure=(
            "Calculations use the linear SPECpower server model with non-negative bounds and safe division for zero baselines. "
            "Telemetry is synthetically simulated for demonstration purposes and does not represent hardware sensor probes."
        ),
    )

# ----------------- 4. Separate Transport vs. Computing Comparison -----------------

@router.get("/transport-comparison", response_model=TransportVsComputeComparison)
def get_transport_vs_compute_comparison():
    """
    Provides side-by-side presentation of Module B transport savings and Module C computing savings.
    Strictly partitions both domains into separate metrics to prevent double-counting or false additive claims.
    """
    # 1. Fetch Module B transport savings from database
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT 
            COALESCE(SUM(saved_distance_km), 0.0),
            COALESCE(SUM(saved_cost_inr), 0.0),
            COALESCE(SUM(avoided_co2_kg), 0.0)
        FROM carpool_match_records
        """
    )
    row = cursor.fetchone()
    conn.close()

    transport_vkt_km = round(row[0], 2)
    transport_cost_inr = round(row[1], 2)
    transport_co2_kg = round(row[2], 3)

    # 2. Calculate Module C computing savings for 1-hour window
    services = get_all_services_telemetry()
    total_compute_kwh_saved = 0.0
    total_compute_co2_saved = 0.0

    for svc in services:
        base_eval = evaluate_scenario(svc["baseline"]["cpu_utilization_fraction"])
        opt_eval = evaluate_scenario(svc["optimized"]["cpu_utilization_fraction"])
        total_compute_kwh_saved += (base_eval["energy_kwh"] - opt_eval["energy_kwh"])
        total_compute_co2_saved += (base_eval["co2_kg"] - opt_eval["co2_kg"])

    return TransportVsComputeComparison(
        category_separation_note=(
            "Transport-related commuter emissions and Datacenter computing workloads are strictly partitioned into separate operational boundaries. "
            "They are reported under their own documented methodologies and must not be conflated or added into a single net-zero number."
        ),
        compute_energy_saved_kwh=round(total_compute_kwh_saved, 4),
        compute_co2_avoided_kg=round(total_compute_co2_saved, 4),
        transport_distance_avoided_km=transport_vkt_km,
        transport_co2_avoided_kg=transport_co2_kg,
        transport_fuel_cost_saved_inr=transport_cost_inr,
        zero_double_counting_guarantee=(
            "Verified: No transport avoided kilometres are converted into server kilowatt-hours, "
            "and no compute optimizations are credited toward commuting reductions."
        ),
    )
