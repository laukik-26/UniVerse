"""
UniVerse Sustainable Computing Observatory: Energy & Carbon Modeling Engine.
Implements unit-tested mathematical calculations for server power, energy consumption,
and grid carbon emissions using SPECpower / TDP hardware models.
"""

from typing import Dict, Any, Tuple

# Documented Default Benchmarks
# Typical 2U Dual-Socket Xeon/EPYC Campus Compute Server Node
DEFAULT_IDLE_POWER_W = 45.0   # Base chassis idle draw (Watts)
DEFAULT_MAX_POWER_W = 220.0   # Peak workload power draw at 100% utilization (Watts)
DEFAULT_DURATION_SECONDS = 3600 # 1-Hour observation window (3,600 seconds)

# Documented Grid Emission Factors
# Source: Central Electricity Authority (CEA) CO2 Baseline Database for Indian Power Sector (v19.0, 2024),
# Weighted average emission factor for Central / Regional Grid ~ 0.716 kg CO2/kWh.
DEFAULT_GRID_FACTOR_KG_PER_KWH = 0.716

# Alternative Grid Benchmarks for scenario modeling:
GRID_FACTOR_PRESETS = {
    "regional_coal_heavy": {
        "name": "Regional Grid (Thermal-Heavy Baseline)",
        "factor_kg_per_kwh": 0.820,
        "source": "CEA Regional Baseline Standard, 2024",
    },
    "national_average": {
        "name": "National Grid Average (India CEA v19.0)",
        "factor_kg_per_kwh": 0.716,
        "source": "CEA CO2 Baseline Database v19.0, Published 2024",
    },
    "campus_solar_mix": {
        "name": "Campus Rooftop Solar + Grid Blend (40% Solar PPA)",
        "factor_kg_per_kwh": 0.430,
        "source": "Campus Sustainability PPA Model (40% Solar @ 0.04kg/kWh, 60% Grid @ 0.716kg/kWh)",
    },
    "clean_renewable": {
        "name": "100% Certified Green Energy Tariff",
        "factor_kg_per_kwh": 0.050,
        "source": "Lifecycle Solar PV & Wind Benchmark (IPCC WG3)",
    },
}

def calculate_average_power(
    idle_power_w: float,
    max_power_w: float,
    utilization_fraction: float
) -> float:
    """
    Calculates average active power draw in Watts using the linear SPECpower server model:
      average_power_w = idle_power_w + (max_power_w - idle_power_w) * utilization_fraction
      
    Validations:
      - idle_power_w >= 0
      - max_power_w >= idle_power_w
      - 0.0 <= utilization_fraction <= 1.0
    """
    if idle_power_w < 0:
        raise ValueError(f"Idle power cannot be negative: {idle_power_w} W")
    if max_power_w < idle_power_w:
        raise ValueError(f"Max power ({max_power_w} W) cannot be less than idle power ({idle_power_w} W)")
    if not (0.0 <= utilization_fraction <= 1.0):
        raise ValueError(f"Utilization fraction must be between 0.0 and 1.0 (got {utilization_fraction})")

    avg_w = idle_power_w + (max_power_w - idle_power_w) * utilization_fraction
    return round(avg_w, 4)

def calculate_energy_kwh(
    average_power_w: float,
    duration_seconds: float
) -> float:
    """
    Calculates energy consumed in kilowatt-hours (kWh) over a duration in seconds:
      energy_kwh = average_power_w * duration_seconds / 3,600,000
      
    Validations:
      - average_power_w >= 0
      - duration_seconds > 0
    """
    if average_power_w < 0:
        raise ValueError(f"Average power cannot be negative: {average_power_w} W")
    if duration_seconds <= 0:
        raise ValueError(f"Duration must be strictly positive: {duration_seconds} s")

    kwh = (average_power_w * duration_seconds) / 3600000.0
    return round(kwh, 6)

def calculate_co2_kg(
    energy_kwh: float,
    grid_factor_kg_per_kwh: float
) -> float:
    """
    Calculates greenhouse gas emissions in kilograms of CO2 equivalent (kg CO2e):
      co2_kg = energy_kwh * grid_factor_kg_per_kwh
      
    Validations:
      - energy_kwh >= 0
      - grid_factor_kg_per_kwh >= 0
    """
    if energy_kwh < 0:
        raise ValueError(f"Energy cannot be negative: {energy_kwh} kWh")
    if grid_factor_kg_per_kwh < 0:
        raise ValueError(f"Grid emissions factor cannot be negative: {grid_factor_kg_per_kwh} kg/kWh")

    co2 = energy_kwh * grid_factor_kg_per_kwh
    return round(co2, 6)

def calculate_percentage_change(baseline: float, optimized: float) -> Tuple[float, float]:
    """
    Calculates the absolute difference and percentage reduction from baseline to optimized:
      absolute_reduction = baseline - optimized
      percentage_reduction = ((baseline - optimized) / baseline) * 100.0
      
    Safely handles zero baseline cases to avoid division by zero.
    Returns:
      (absolute_difference, percentage_change)
    """
    abs_diff = round(baseline - optimized, 6)
    if baseline <= 0.0:
        # Zero baseline: cannot divide by zero; percentage change is 0.0%
        return abs_diff, 0.0

    pct = round((abs_diff / baseline) * 100.0, 2)
    return abs_diff, pct

def evaluate_scenario(
    utilization_fraction: float,
    duration_seconds: float = DEFAULT_DURATION_SECONDS,
    idle_power_w: float = DEFAULT_IDLE_POWER_W,
    max_power_w: float = DEFAULT_MAX_POWER_W,
    grid_factor_kg_per_kwh: float = DEFAULT_GRID_FACTOR_KG_PER_KWH
) -> Dict[str, Any]:
    """
    Evaluates complete power, energy, and emissions profile for a single scenario.
    """
    avg_power = calculate_average_power(idle_power_w, max_power_w, utilization_fraction)
    energy_kwh = calculate_energy_kwh(avg_power, duration_seconds)
    co2_kg = calculate_co2_kg(energy_kwh, grid_factor_kg_per_kwh)
    co2_grams = round(co2_kg * 1000.0, 3)

    return {
        "utilization_fraction": utilization_fraction,
        "utilization_pct": round(utilization_fraction * 100.0, 1),
        "duration_seconds": duration_seconds,
        "duration_hours": round(duration_seconds / 3600.0, 2),
        "idle_power_w": idle_power_w,
        "max_power_w": max_power_w,
        "average_power_w": avg_power,
        "energy_kwh": energy_kwh,
        "co2_kg": co2_kg,
        "co2_grams": co2_grams,
        "grid_factor_kg_per_kwh": grid_factor_kg_per_kwh,
    }
