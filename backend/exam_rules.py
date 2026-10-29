"""
Observable Event Rules & Geometric Zone Logic for Responsible Examination Monitoring (Module E).
Implemented as pure, deterministic, unit-tested algorithms independent of computer-vision hardware.

ETHICAL SAFEGUARD:
These rules detect geometric triggers and temporal clusters as behavioral signals for HUMAN PROCTOR review.
They NEVER impose automated penalties, disqualifications, or accusations.
"""

from typing import List, Dict, Tuple, Optional, Any

def evaluate_event_window(
    event_timestamps_seconds: List[float],
    window_duration_seconds: float = 30.0,
    threshold_count: int = 3
) -> Dict[str, Any]:
    """
    Sliding-window temporal clustering rule (e.g. Repeated Head-Turn Cues).
    Triggers when at least `threshold_count` events occur within any sliding interval of `window_duration_seconds`.
    
    Returns:
      triggered: bool
      max_events_in_window: int
      trigger_windows: list of (window_start, window_end, count)
    """
    if window_duration_seconds <= 0:
        raise ValueError(f"Window duration ({window_duration_seconds}) must be strictly positive.")
    if threshold_count <= 0:
        raise ValueError(f"Threshold count ({threshold_count}) must be at least 1.")

    if not event_timestamps_seconds:
        return {
            "triggered": False,
            "max_events_in_window": 0,
            "trigger_windows": [],
            "total_events": 0,
            "rule_name": f"Sliding Window ({threshold_count} occurrences within {window_duration_seconds}s)",
        }

    # Sort timestamps ascending
    sorted_ts = sorted(event_timestamps_seconds)
    n = len(sorted_ts)

    max_count = 0
    trigger_windows = []

    # Two-pointer sliding window
    right = 0
    for left in range(n):
        window_start = sorted_ts[left]
        window_end = window_start + window_duration_seconds

        while right < n and sorted_ts[right] <= window_end:
            right += 1

        count = right - left
        if count > max_count:
            max_count = count

        if count >= threshold_count:
            trigger_windows.append({
                "window_start": window_start,
                "window_end": window_end,
                "count": count,
            })

    return {
        "triggered": max_count >= threshold_count,
        "max_events_in_window": max_count,
        "trigger_windows": trigger_windows,
        "total_events": n,
        "rule_name": f"Sliding Window ({threshold_count} occurrences within {window_duration_seconds}s)",
    }

def is_point_in_box(
    point: Tuple[float, float],
    box: Tuple[float, float, float, float],
    tolerance: float = 0.0
) -> bool:
    """
    Checks if 2D coordinate (x, y) is located inside a rectangular bounding box.
    Box format: (x_min, y_min, x_max, y_max)
    Coordinates are normalized in [0.0, 1.0].
    Optional tolerance expands the boundary.
    """
    px, py = point
    x_min, y_min, x_max, y_max = box

    if x_max < x_min or y_max < y_min:
        raise ValueError(f"Invalid box coordinates: min ({x_min}, {y_min}) > max ({x_max}, {y_max})")

    return (x_min - tolerance) <= px <= (x_max + tolerance) and \
           (y_min - tolerance) <= py <= (y_max + tolerance)

def compute_box_intersection_iou(
    box_a: Tuple[float, float, float, float],
    box_b: Tuple[float, float, float, float]
) -> Tuple[bool, float, float]:
    """
    Computes geometric overlap and Intersection over Union (IoU) between two bounding boxes.
    Returns: (is_overlapping: bool, intersection_area: float, iou: float)
    """
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b

    # Intersection coordinates
    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)

    inter_w = max(0.0, ix2 - ix1)
    inter_h = max(0.0, iy2 - iy1)
    inter_area = inter_w * inter_h

    # Areas
    area_a = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    area_b = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    union_area = area_a + area_b - inter_area

    iou = (inter_area / union_area) if union_area > 0 else 0.0
    is_overlapping = inter_area > 0.0

    return is_overlapping, round(inter_area, 4), round(iou, 4)

def evaluate_zone_geometry(
    detected_object_box: Tuple[float, float, float, float],
    restricted_zone_box: Tuple[float, float, float, float],
    min_overlap_threshold: float = 0.01
) -> Dict[str, Any]:
    """
    Evaluates whether a detected object or hand region penetrates a configured restricted zone.
    Example: Secondary device zone or unauthorized book compartment.
    """
    is_overlap, inter_area, iou = compute_box_intersection_iou(detected_object_box, restricted_zone_box)
    penetration_triggered = is_overlap and (inter_area >= min_overlap_threshold)

    return {
        "intrusion_triggered": penetration_triggered,
        "is_overlapping": is_overlap,
        "intersection_area": inter_area,
        "iou": iou,
        "min_overlap_threshold": min_overlap_threshold,
        "detected_box": list(detected_object_box),
        "restricted_zone_box": list(restricted_zone_box),
        "rule_description": "2D Cartesian intersection test against proctor-defined restricted bounding polygon.",
    }
