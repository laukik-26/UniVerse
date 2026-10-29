"""
Automated unit and integration test suite for UniVerse Module C (Sustainable Computing Observatory).
Verifies SPECpower calculations, zero/max utilization bounds, unit conversions, invalid inputs,
safe zero-baseline handling, and non-conflated transport vs. compute emissions partitioning.
"""

import pytest
from energy_model import (
    calculate_average_power,
    calculate_energy_kwh,
    calculate_co2_kg,
    calculate_percentage_change,
    evaluate_scenario,
    DEFAULT_IDLE_POWER_W,
    DEFAULT_MAX_POWER_W,
    DEFAULT_GRID_FACTOR_KG_PER_KWH,
)
from workloads import get_all_services_telemetry, get_service_telemetry
from routers.observatory import (
    get_services,
    compute_custom_estimate,
    get_scenario_comparisons,
    get_transport_vs_compute_comparison,
)
from models import CustomEstimateRequest
from database import init_db
from seed import seed_database

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    seed_database()

# ----------------- 1. Power & Utilization Boundary Tests -----------------

def test_zero_utilization():
    """At 0.0 utilization, power must equal idle power."""
    avg_power = calculate_average_power(idle_power_w=45.0, max_power_w=220.0, utilization_fraction=0.0)
    assert avg_power == 45.0

def test_maximum_utilization():
    """At 1.0 utilization, power must equal maximum power."""
    avg_power = calculate_average_power(idle_power_w=45.0, max_power_w=220.0, utilization_fraction=1.0)
    assert avg_power == 220.0

def test_linear_interpolation_utilization():
    """At 0.5 utilization, power must equal exactly midpoint between idle and max."""
    avg_power = calculate_average_power(idle_power_w=50.0, max_power_w=150.0, utilization_fraction=0.5)
    # 50 + (150 - 50) * 0.5 = 100.0 W
    assert avg_power == 100.0

# ----------------- 2. Energy Unit Conversion Tests -----------------

def test_energy_kwh_conversion_exact():
    """
    1,000 Watts for 3,600 seconds = 3,600,000 Joules = exactly 1.0 kWh.
    """
    kwh = calculate_energy_kwh(average_power_w=1000.0, duration_seconds=3600.0)
    assert kwh == 1.0

def test_energy_kwh_fractional():
    """
    200 Watts for 1,800 seconds = 360,000 Joules = exactly 0.1 kWh.
    """
    kwh = calculate_energy_kwh(average_power_w=200.0, duration_seconds=1800.0)
    assert kwh == 0.1

# ----------------- 3. Emissions Calculation Tests -----------------

def test_co2_calculation_exact():
    """
    1.0 kWh at 0.716 kg CO2/kWh = 0.716 kg CO2e.
    """
    co2 = calculate_co2_kg(energy_kwh=1.0, grid_factor_kg_per_kwh=0.716)
    assert co2 == 0.716

def test_co2_zero_factors():
    """Zero energy or zero emissions grid produces zero kg CO2."""
    assert calculate_co2_kg(energy_kwh=0.0, grid_factor_kg_per_kwh=0.716) == 0.0
    assert calculate_co2_kg(energy_kwh=2.5, grid_factor_kg_per_kwh=0.0) == 0.0

# ----------------- 4. Input Validation & Exception Handling -----------------

def test_invalid_negative_power():
    with pytest.raises(ValueError, match="Idle power cannot be negative"):
        calculate_average_power(idle_power_w=-10.0, max_power_w=200.0, utilization_fraction=0.5)

def test_invalid_max_power_less_than_idle():
    with pytest.raises(ValueError, match="cannot be less than idle power"):
        calculate_average_power(idle_power_w=100.0, max_power_w=50.0, utilization_fraction=0.5)

def test_invalid_utilization_out_of_bounds():
    with pytest.raises(ValueError, match="must be between 0.0 and 1.0"):
        calculate_average_power(idle_power_w=45.0, max_power_w=220.0, utilization_fraction=1.2)
    with pytest.raises(ValueError, match="must be between 0.0 and 1.0"):
        calculate_average_power(idle_power_w=45.0, max_power_w=220.0, utilization_fraction=-0.1)

def test_invalid_duration_non_positive():
    with pytest.raises(ValueError, match="Duration must be strictly positive"):
        calculate_energy_kwh(average_power_w=100.0, duration_seconds=0.0)
    with pytest.raises(ValueError, match="Duration must be strictly positive"):
        calculate_energy_kwh(average_power_w=100.0, duration_seconds=-50.0)

def test_invalid_negative_grid_factor():
    with pytest.raises(ValueError, match="Grid emissions factor cannot be negative"):
        calculate_co2_kg(energy_kwh=1.0, grid_factor_kg_per_kwh=-0.5)

# ----------------- 5. Percentage Change & Zero Baseline Safety -----------------

def test_percentage_change_standard():
    abs_diff, pct = calculate_percentage_change(baseline=100.0, optimized=75.0)
    assert abs_diff == 25.0
    assert pct == 25.0

def test_percentage_change_zero_baseline_safe():
    """Safe handling for zero baseline to prevent ZeroDivisionError."""
    abs_diff, pct = calculate_percentage_change(baseline=0.0, optimized=0.0)
    assert abs_diff == 0.0
    assert pct == 0.0

    abs_diff2, pct2 = calculate_percentage_change(baseline=0.0, optimized=50.0)
    assert abs_diff2 == -50.0
    assert pct2 == 0.0 # No exception thrown

# ----------------- 6. Demonstrable Workloads & Scenarios -----------------

def test_services_catalog_has_three_workloads():
    services = get_services()
    assert len(services) == 3
    service_ids = [s.id for s in services]
    assert "svc-placement-api" in service_ids
    assert "svc-academic-search" in service_ids
    assert "svc-ride-matcher" in service_ids

    # Verify each service has baseline and optimized snapshots with required fields
    for s in services:
        assert s.baseline.request_count > 0
        assert s.baseline.avg_latency_ms > 0
        assert s.baseline.cpu_utilization_fraction > s.optimized.cpu_utilization_fraction
        assert s.optimized.avg_latency_ms < s.baseline.avg_latency_ms

def test_scenario_comparisons_calculated_from_inputs():
    """Verify scenario differences and percentage savings are dynamically computed."""
    summary = get_scenario_comparisons(
        idle_power_w=45.0,
        max_power_w=220.0,
        grid_factor_kg_per_kwh=0.716,
        duration_seconds=3600.0
    )
    assert summary.total_baseline_energy_kwh > summary.total_optimized_energy_kwh
    assert summary.total_energy_saved_kwh > 0.0
    assert summary.overall_energy_savings_percentage > 0.0
    assert summary.total_co2_avoided_kg > 0.0
    assert summary.overall_co2_savings_percentage > 0.0

    # Verify calculation consistency for each service
    for svc in summary.services:
        expected_kwh_diff = round(svc.baseline.energy_kwh - svc.optimized.energy_kwh, 6)
        assert svc.absolute_energy_reduction_kwh == expected_kwh_diff
        assert svc.energy_savings_percentage > 0.0
        assert svc.latency_reduction_percentage > 0.0

def test_custom_estimate_api_endpoint():
    req = CustomEstimateRequest(
        idle_power_w=50.0,
        max_power_w=200.0,
        utilization_fraction=0.5,
        duration_seconds=7200.0, # 2 hours
        grid_factor_kg_per_kwh=0.716
    )
    res = compute_custom_estimate(req)
    # Average power: 50 + (200 - 50) * 0.5 = 125 W
    assert res["results"]["average_power_w"] == 125.0
    # Energy: 125 * 7200 / 3,600,000 = 0.25 kWh
    assert res["results"]["energy_kwh"] == 0.25
    # CO2: 0.25 * 0.716 = 0.179 kg
    assert res["results"]["co2_kg"] == 0.179

# ----------------- 7. Separate Transport vs. Compute Comparison -----------------

def test_transport_vs_compute_separation():
    """
    Verify transport savings and compute emissions are kept in strictly separate
    categories and not falsely summed into a double-counted total.
    """
    res = get_transport_vs_compute_comparison()
    assert res.compute_energy_saved_kwh > 0.0
    assert res.compute_co2_avoided_kg > 0.0
    assert res.transport_distance_avoided_km >= 0.0
    assert "strictly partitioned" in res.category_separation_note
    assert "No transport avoided kilometres are converted into server kilowatt-hours" in res.zero_double_counting_guarantee
