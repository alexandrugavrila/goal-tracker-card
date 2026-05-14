from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import EVENT_GOALS_UPDATED, STORAGE_KEY, STORAGE_VERSION
from .models import (
    add_days_iso,
    apply_config_seeds,
    create_envelope,
    migrate_envelope,
    normalize_goal,
    normalize_practice,
    summary_for_goals,
    unlink_goal_from_practices,
)


class GoalTrackerStore:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data = create_envelope()

    @property
    def goals(self) -> list[dict[str, Any]]:
        return list(self._data["goals"])

    @property
    def practices(self) -> list[dict[str, Any]]:
        return list(self._data["practices"])

    @property
    def data(self) -> dict[str, Any]:
        return {
            "goals": self.goals,
            "practices": self.practices,
        }

    @property
    def summary(self) -> dict[str, Any]:
        return summary_for_goals(self._data["goals"])

    async def async_load(self) -> None:
        self._data = migrate_envelope(await self._store.async_load())

    async def async_save(self) -> None:
        await self._store.async_save(self._data)
        self.hass.bus.async_fire(EVENT_GOALS_UPDATED, self.summary)

    async def async_seed_goals(self, goals: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
        self._data, changed = apply_config_seeds(self._data, goals)
        if changed:
            await self.async_save()
        return self.goals

    async def async_save_goal(self, raw_goal: dict[str, Any]) -> dict[str, Any]:
        goal = normalize_goal(raw_goal)
        goals = self._data["goals"]
        for index, existing in enumerate(goals):
            if existing["id"] == goal["id"]:
                goals[index] = goal
                break
        else:
            goals.append(goal)
        await self.async_save()
        return goal

    async def async_delete_goal(self, goal_id: str) -> list[dict[str, Any]]:
        self._data["goals"] = [goal for goal in self._data["goals"] if goal["id"] != goal_id]
        self._data["practices"] = unlink_goal_from_practices(self._data["practices"], goal_id)
        await self.async_save()
        return self.goals

    async def async_set_progress(self, goal_id: str, progress: float) -> dict[str, Any] | None:
        for goal in self._data["goals"]:
            if goal["id"] == goal_id:
                goal["progress"] = progress
                updated = normalize_goal(goal)
                goal.update(updated)
                await self.async_save()
                return updated
        return None

    async def async_set_daily_value(self, goal_id: str, index: int, value: float) -> dict[str, Any] | None:
        for goal in self._data["goals"]:
            if goal["id"] != goal_id or index < 0 or index >= len(goal["daily"]):
                continue
            practice = next(
                (
                    item
                    for item in self._data["practices"]
                    if goal_id in item["goalIds"]
                ),
                None,
            )
            if practice is not None:
                date_key = add_days_iso(goal["start"], index)
                if date_key:
                    practice["entries"][date_key] = max(0, value)
                    practice.update(normalize_practice(practice))
            old_value = goal["daily"][index]
            goal["daily"][index] = max(0, value)
            goal["progress"] = goal["progress"] + (goal["daily"][index] - old_value)
            updated = normalize_goal(goal)
            goal.update(updated)
            await self.async_save()
            return updated
        return None

    async def async_save_practice(self, raw_practice: dict[str, Any]) -> dict[str, Any]:
        practice = normalize_practice(raw_practice)
        practices = self._data["practices"]
        for index, existing in enumerate(practices):
            if existing["id"] == practice["id"]:
                practices[index] = practice
                break
        else:
            practices.append(practice)
        await self.async_save()
        return practice

    async def async_delete_practice(self, practice_id: str) -> list[dict[str, Any]]:
        self._data["practices"] = [
            practice for practice in self._data["practices"] if practice["id"] != practice_id
        ]
        await self.async_save()
        return self.practices

    async def async_set_practice_value(
        self,
        practice_id: str,
        date_key: str,
        value: float,
    ) -> dict[str, Any] | None:
        for practice in self._data["practices"]:
            if practice["id"] != practice_id:
                continue
            practice["entries"][date_key] = value
            updated = normalize_practice(practice)
            practice.update(updated)
            await self.async_save()
            return updated
        return None

    async def async_remove_test_goals(self) -> list[dict[str, Any]]:
        removed_goal_ids = {
            goal["id"] for goal in self._data["goals"] if goal["name"].startswith("_TEST_")
        }
        self._data["goals"] = [
            goal for goal in self._data["goals"] if not goal["name"].startswith("_TEST_")
        ]
        self._data["practices"] = [
            practice for practice in self._data["practices"] if not practice["name"].startswith("_TEST_")
        ]
        for practice in self._data["practices"]:
            practice["goalIds"] = [
                goal_id for goal_id in practice["goalIds"] if goal_id not in removed_goal_ids
            ]
        await self.async_save()
        return self.goals

    async def async_clear_goals(self) -> None:
        self._data = create_envelope()
        await self.async_save()
