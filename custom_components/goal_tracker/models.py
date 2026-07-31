from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any
from uuid import uuid4

STORAGE_VERSION = 3
PRACTICE_MODES = {"checkbox", "number"}
PRACTICE_COMPARISONS = {
    "greater_than",
    "greater_than_or_equal",
    "less_than",
    "less_than_or_equal",
    "equal",
}


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
    start_value = sanitize_number(raw.get("startValue"), 0)
    target = sanitize_number(raw.get("target"), 1)
    progress = clamp(
        sanitize_number(raw.get("progress"), start_value),
        min(start_value, target),
        max(start_value, target),
    )

    return {
        "id": raw.get("id") if isinstance(raw.get("id"), str) and raw.get("id") else str(uuid4()),
        "name": raw.get("name") if isinstance(raw.get("name"), str) else "",
        "unit": raw.get("unit") if isinstance(raw.get("unit"), str) else "",
        "startValue": start_value,
        "target": target,
        "progress": progress,
        "start": start,
        "end": end,
        "daily": normalize_daily(start, end, raw.get("daily")),
    }


def normalize_practice(raw: dict[str, Any] | None) -> dict[str, Any]:
    raw = raw or {}
    mode = raw.get("mode") if raw.get("mode") in PRACTICE_MODES else "number"
    comparison = (
        raw.get("comparison")
        if raw.get("comparison") in PRACTICE_COMPARISONS
        else "greater_than_or_equal"
    )
    target_per_day = sanitize_number(raw.get("targetPerDay"), 1, 0)
    target_per_day = target_per_day if target_per_day > 0 else 1
    requested_partial_progress = (
        raw.get("partialProgressEnabled")
        if isinstance(raw.get("partialProgressEnabled"), bool)
        else True
    )
    partial_progress_enabled = comparison != "equal" and requested_partial_progress
    raw_partial_min = sanitize_number(raw.get("partialProgressMin"), 0, 0)
    raw_partial_max = sanitize_number(
        raw.get("partialProgressMax"),
        target_per_day,
        0,
    )
    is_greater_comparison = comparison in {"greater_than", "greater_than_or_equal"}
    is_less_comparison = comparison in {"less_than", "less_than_or_equal"}
    partial_progress_min = (
        min(raw_partial_min, target_per_day)
        if is_greater_comparison
        else target_per_day
    )
    partial_progress_max = (
        max(raw_partial_max, target_per_day)
        if is_less_comparison
        else target_per_day
    )
    days_per_week = int(clamp(round(sanitize_number(raw.get("daysPerWeek"), 5, 1)), 1, 7))
    goal_ids = []
    for goal_id in raw.get("goalIds") if isinstance(raw.get("goalIds"), list) else []:
        if isinstance(goal_id, str) and goal_id and goal_id not in goal_ids:
            goal_ids.append(goal_id)

    entries: dict[str, float] = {}
    raw_entries = raw.get("entries") if isinstance(raw.get("entries"), dict) else {}
    for key, value in raw_entries.items():
        if parse_date(key) is None:
            continue
        entry_value = sanitize_number(value, 0, 0)
        entries[key] = 1 if mode == "checkbox" and entry_value > 0 else entry_value

    return {
        "id": raw.get("id") if isinstance(raw.get("id"), str) and raw.get("id") else str(uuid4()),
        "name": raw.get("name") if isinstance(raw.get("name"), str) else "",
        "mode": mode,
        "unit": raw.get("unit") if isinstance(raw.get("unit"), str) else "",
        "targetPerDay": target_per_day,
        "comparison": comparison,
        "partialProgressEnabled": partial_progress_enabled,
        "partialProgressMin": partial_progress_min,
        "partialProgressMax": partial_progress_max,
        "daysPerWeek": days_per_week,
        "goalIds": goal_ids,
        "entries": entries,
    }


def create_practice_from_goal_daily(goal: dict[str, Any], daily: list[Any]) -> dict[str, Any] | None:
    if not daily:
        return None
    normalized_daily = normalize_daily(goal["start"], goal["end"], daily)
    if not normalized_daily:
        return None
    target_per_day = abs(goal["target"] - goal["startValue"]) / len(normalized_daily) if normalized_daily else 1
    entries = {
        add_days_iso(goal["start"], index): value
        for index, value in enumerate(normalized_daily)
        if add_days_iso(goal["start"], index)
    }
    return normalize_practice(
        {
            "name": goal["name"],
            "mode": "number",
            "unit": goal["unit"],
            "targetPerDay": max(1, target_per_day),
            "daysPerWeek": goal.get("daysPerWeek", 5),
            "goalIds": [goal["id"]],
            "entries": entries,
        }
    )


def unlink_goal_from_practices(
    practices: list[dict[str, Any]],
    goal_id: str,
) -> list[dict[str, Any]]:
    return [
        normalize_practice(
            {
                **practice,
                "goalIds": [linked_id for linked_id in practice.get("goalIds", []) if linked_id != goal_id],
            }
        )
        for practice in practices
    ]


def goal_seed_key(goal: dict[str, Any]) -> str:
    return "|".join(
        str(goal.get(key, ""))
        for key in ("id", "name", "unit", "startValue", "target", "start", "end")
    )


def create_envelope(
    goals: list[dict[str, Any]] | None = None,
    practices: list[dict[str, Any]] | None = None,
    seeded_config_keys: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "version": STORAGE_VERSION,
        "goals": [normalize_goal(goal) for goal in goals or []],
        "practices": [normalize_practice(practice) for practice in practices or []],
        "seeded_config_keys": [key for key in seeded_config_keys or [] if isinstance(key, str)],
    }


def migrate_envelope(data: Any) -> dict[str, Any]:
    if not data:
        return create_envelope()
    if isinstance(data, list):
        goals = [normalize_goal(goal) for goal in data]
        practices = [
            practice
            for goal, raw_goal in zip(goals, data, strict=False)
            if (
                practice := create_practice_from_goal_daily(
                    {
                        **goal,
                        "daysPerWeek": raw_goal.get("daysPerWeek", 5)
                        if isinstance(raw_goal, dict)
                        else 5,
                    },
                    raw_goal.get("daily") if isinstance(raw_goal, dict) else [],
                )
            )
        ]
        return create_envelope(goals, practices)
    if not isinstance(data, dict):
        return create_envelope()

    seeded_keys = data.get("seeded_config_keys")
    if seeded_keys is None:
        seeded_keys = data.get("seededConfigKeys")
    raw_goals = data.get("goals") if isinstance(data.get("goals"), list) else []
    goals = [normalize_goal(goal) for goal in raw_goals]
    raw_practices = data.get("practices") if isinstance(data.get("practices"), list) else []
    legacy_days_by_goal_id = {
        goal["id"]: int(
            clamp(
                round(sanitize_number(raw_goal.get("daysPerWeek"), 5, 1)),
                1,
                7,
            )
        )
        for goal, raw_goal in zip(goals, raw_goals, strict=False)
        if isinstance(raw_goal, dict)
    }
    practices = [
        normalize_practice(
            {
                "daysPerWeek": next(
                    (
                        legacy_days_by_goal_id[goal_id]
                        for goal_id in practice.get("goalIds", [])
                        if goal_id in legacy_days_by_goal_id
                    ),
                    5,
                ),
                **practice,
            }
        )
        for practice in raw_practices
    ]
    if not isinstance(data.get("practices"), list):
        practices = [
            practice
            for goal, raw_goal in zip(goals, raw_goals, strict=False)
            if isinstance(raw_goal, dict)
            if (
                practice := create_practice_from_goal_daily(
                    {**goal, "daysPerWeek": raw_goal.get("daysPerWeek", 5)},
                    raw_goal.get("daily"),
                )
            )
        ]
    return create_envelope(goals, practices, seeded_keys)


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

    return create_envelope(goals, envelope.get("practices", []), sorted(seeded_keys)), changed


def add_days_iso(start_value: str, index: int) -> str:
    start = parse_date(start_value)
    if start is None:
        return ""
    return (start + timedelta(days=index)).isoformat()


def summary_for_goals(goals: list[dict[str, Any]]) -> dict[str, Any]:
    count = len(goals)
    target_total = sum(
        abs(sanitize_number(goal.get("target"), 0) - sanitize_number(goal.get("startValue"), 0))
        for goal in goals
    )
    progress_total = sum(
        abs(sanitize_number(goal.get("progress"), 0) - sanitize_number(goal.get("startValue"), 0))
        for goal in goals
    )
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
                "startValue": goal["startValue"],
                "target": goal["target"],
                "unit": goal["unit"],
            }
            for goal in goals
        ],
    }
