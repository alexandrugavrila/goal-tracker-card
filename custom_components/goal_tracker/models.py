from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any
from uuid import uuid4

STORAGE_VERSION = 1


def today_iso() -> str:
    return date.today().isoformat()


def parse_date(value: Any) -> date | None:
    if isinstance(value, date):
        return value
    if not isinstance(value, str):
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def count_days_between(start_value: Any, end_value: Any) -> int:
    start = parse_date(start_value)
    end = parse_date(end_value)
    if start is None or end is None or end < start:
        return 0
    return (end - start).days + 1


def sanitize_number(value: Any, fallback: float = 0, minimum: float | None = None) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback
    if number != number or number in (float("inf"), float("-inf")):
        return fallback
    if minimum is not None:
        return max(minimum, number)
    return number


def clamp(value: float, minimum: float, maximum: float) -> float:
    return min(max(value, minimum), maximum)


def normalize_daily(start_value: str, end_value: str, existing: Any = None) -> list[float]:
    length = count_days_between(start_value, end_value)
    source = existing if isinstance(existing, list) else []
    return [sanitize_number(source[index] if index < len(source) else 0, 0, 0) for index in range(length)]


def normalize_goal(raw: dict[str, Any] | None) -> dict[str, Any]:
    raw = raw or {}
    start = raw.get("start") if parse_date(raw.get("start")) else today_iso()
    raw_end = raw.get("end") if parse_date(raw.get("end")) else start
    end = raw_end if count_days_between(start, raw_end) > 0 else start
    target = sanitize_number(raw.get("target"), 1, 0)
    target = target if target > 0 else 1
    progress = clamp(sanitize_number(raw.get("progress"), 0, 0), 0, target)
    days_per_week = int(clamp(round(sanitize_number(raw.get("daysPerWeek"), 5, 1)), 1, 7))

    return {
        "id": raw.get("id") if isinstance(raw.get("id"), str) and raw.get("id") else str(uuid4()),
        "name": raw.get("name") if isinstance(raw.get("name"), str) else "",
        "unit": raw.get("unit") if isinstance(raw.get("unit"), str) else "",
        "target": target,
        "progress": progress,
        "start": start,
        "end": end,
        "daysPerWeek": days_per_week,
        "daily": normalize_daily(start, end, raw.get("daily")),
    }


def goal_seed_key(goal: dict[str, Any]) -> str:
    return "|".join(
        str(goal.get(key, ""))
        for key in ("id", "name", "unit", "target", "start", "end")
    )


def create_envelope(
    goals: list[dict[str, Any]] | None = None,
    seeded_config_keys: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "version": STORAGE_VERSION,
        "goals": [normalize_goal(goal) for goal in goals or []],
        "seeded_config_keys": [key for key in seeded_config_keys or [] if isinstance(key, str)],
    }


def migrate_envelope(data: Any) -> dict[str, Any]:
    if not data:
        return create_envelope()
    if isinstance(data, list):
        return create_envelope(data)
    if not isinstance(data, dict):
        return create_envelope()

    seeded_keys = data.get("seeded_config_keys")
    if seeded_keys is None:
        seeded_keys = data.get("seededConfigKeys")
    return create_envelope(data.get("goals") if isinstance(data.get("goals"), list) else [], seeded_keys)


def apply_config_seeds(
    envelope: dict[str, Any],
    config_goals: list[dict[str, Any]] | None,
) -> tuple[dict[str, Any], bool]:
    goals = list(envelope.get("goals", []))
    seeded_keys = set(envelope.get("seeded_config_keys", []))
    existing_keys = {goal_seed_key(goal) for goal in goals}
    changed = False

    for raw_goal in config_goals or []:
        goal = normalize_goal(raw_goal)
        key = goal_seed_key(goal)
        if key in seeded_keys or key in existing_keys:
            if key not in seeded_keys:
                changed = True
            seeded_keys.add(key)
            continue
        goals.append(goal)
        existing_keys.add(key)
        seeded_keys.add(key)
        changed = True

    return create_envelope(goals, sorted(seeded_keys)), changed


def add_days_iso(start_value: str, index: int) -> str:
    start = parse_date(start_value)
    if start is None:
        return ""
    return (start + timedelta(days=index)).isoformat()


def summary_for_goals(goals: list[dict[str, Any]]) -> dict[str, Any]:
    count = len(goals)
    target_total = sum(sanitize_number(goal.get("target"), 0, 0) for goal in goals)
    progress_total = sum(sanitize_number(goal.get("progress"), 0, 0) for goal in goals)
    completion = round((progress_total / target_total) * 100, 1) if target_total > 0 else 0
    return {
        "count": count,
        "completion": completion,
        "progress_total": progress_total,
        "target_total": target_total,
        "goals": [
            {
                "id": goal["id"],
                "name": goal["name"],
                "progress": goal["progress"],
                "target": goal["target"],
                "unit": goal["unit"],
            }
            for goal in goals
        ],
    }
