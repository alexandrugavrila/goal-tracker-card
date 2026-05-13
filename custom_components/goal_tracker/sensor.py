from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DATA_MANAGER, DOMAIN, EVENT_GOALS_UPDATED


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([GoalTrackerSummarySensor(hass)])


class GoalTrackerSummarySensor(SensorEntity):
    _attr_name = "Goal Tracker Summary"
    _attr_icon = "mdi:bullseye-arrow"
    _attr_unique_id = "goal_tracker_summary"

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._summary = hass.data[DOMAIN][DATA_MANAGER].summary

    @property
    def native_value(self) -> int:
        return self._summary["count"]

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "completion": self._summary["completion"],
            "progress_total": self._summary["progress_total"],
            "target_total": self._summary["target_total"],
            "goals": self._summary["goals"],
        }

    async def async_added_to_hass(self) -> None:
        @callback
        def _handle_update(event) -> None:
            self._summary = event.data
            self.async_write_ha_state()

        self.async_on_remove(
            self.hass.bus.async_listen(EVENT_GOALS_UPDATED, _handle_update)
        )
