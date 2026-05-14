from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import lovelace
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_URL, Platform
from homeassistant.core import HomeAssistant, ServiceCall
import homeassistant.helpers.config_validation as cv

from .const import CARD_FILENAME, CARD_URL, DATA_MANAGER, DOMAIN
from .storage import GoalTrackerStore
from .websocket import async_register_websocket_commands

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR]
CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    await _async_setup_backend(hass)
    if DOMAIN in config:
        _LOGGER.info("Goal Tracker loaded from YAML for development")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await _async_setup_backend(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_setup_backend(hass: HomeAssistant) -> None:
    domain_data = hass.data.setdefault(DOMAIN, {})
    if DATA_MANAGER not in domain_data:
        manager = GoalTrackerStore(hass)
        await manager.async_load()
        domain_data[DATA_MANAGER] = manager
        _register_services(hass)
        async_register_websocket_commands(hass)

    await _register_static_path(hass)
    await _register_lovelace_resource(hass)


async def _register_static_path(hass: HomeAssistant) -> None:
    card_path = Path(__file__).parent / "www" / CARD_FILENAME
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_path), True)]
    )


async def _register_lovelace_resource(hass: HomeAssistant) -> None:
    resources = hass.data.get(lovelace.LOVELACE_DATA)
    if resources is None:
        return

    collection = resources.resources
    try:
        if hasattr(collection, "async_get_info"):
            await collection.async_get_info()
        items = collection.async_items()
        if any(item.get(CONF_URL) == CARD_URL for item in items):
            return
        if not hasattr(collection, "async_create_item"):
            _LOGGER.debug("Lovelace is using YAML resources; skipping automatic resource registration")
            return
        await collection.async_create_item({"res_type": "module", CONF_URL: CARD_URL})
    except Exception as err:  # pragma: no cover - best-effort frontend registration
        _LOGGER.debug("Could not auto-register Goal Tracker Lovelace resource: %s", err)


def _register_services(hass: HomeAssistant) -> None:
    async def create_or_update_goal(call: ServiceCall) -> None:
        await hass.data[DOMAIN][DATA_MANAGER].async_save_goal(call.data["goal"])

    async def delete_goal(call: ServiceCall) -> None:
        await hass.data[DOMAIN][DATA_MANAGER].async_delete_goal(call.data["goal_id"])

    async def set_daily_value(call: ServiceCall) -> None:
        await hass.data[DOMAIN][DATA_MANAGER].async_set_daily_value(
            call.data["goal_id"], call.data["index"], call.data["value"]
        )

    async def create_or_update_practice(call: ServiceCall) -> None:
        await hass.data[DOMAIN][DATA_MANAGER].async_save_practice(call.data["practice"])

    async def delete_practice(call: ServiceCall) -> None:
        await hass.data[DOMAIN][DATA_MANAGER].async_delete_practice(call.data["practice_id"])

    async def set_practice_value(call: ServiceCall) -> None:
        await hass.data[DOMAIN][DATA_MANAGER].async_set_practice_value(
            call.data["practice_id"], call.data["date"], call.data["value"]
        )

    async def clear_goals(call: ServiceCall) -> None:
        await hass.data[DOMAIN][DATA_MANAGER].async_clear_goals()

    goal_schema = vol.Schema({vol.Required("goal"): dict})
    hass.services.async_register(DOMAIN, "create_goal", create_or_update_goal, schema=goal_schema)
    hass.services.async_register(DOMAIN, "update_goal", create_or_update_goal, schema=goal_schema)
    hass.services.async_register(
        DOMAIN,
        "delete_goal",
        delete_goal,
        schema=vol.Schema({vol.Required("goal_id"): cv.string}),
    )
    hass.services.async_register(
        DOMAIN,
        "set_daily_value",
        set_daily_value,
        schema=vol.Schema(
            {
                vol.Required("goal_id"): cv.string,
                vol.Required("index"): vol.Coerce(int),
                vol.Required("value"): vol.Coerce(float),
            }
        ),
    )
    practice_schema = vol.Schema({vol.Required("practice"): dict})
    hass.services.async_register(DOMAIN, "create_practice", create_or_update_practice, schema=practice_schema)
    hass.services.async_register(DOMAIN, "update_practice", create_or_update_practice, schema=practice_schema)
    hass.services.async_register(
        DOMAIN,
        "delete_practice",
        delete_practice,
        schema=vol.Schema({vol.Required("practice_id"): cv.string}),
    )
    hass.services.async_register(
        DOMAIN,
        "set_practice_value",
        set_practice_value,
        schema=vol.Schema(
            {
                vol.Required("practice_id"): cv.string,
                vol.Required("date"): cv.string,
                vol.Required("value"): vol.Coerce(float),
            }
        ),
    )
    hass.services.async_register(DOMAIN, "clear_goals", clear_goals)
