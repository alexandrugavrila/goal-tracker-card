from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DATA_MANAGER, DOMAIN
from .storage import GoalTrackerStore


def _manager(hass: HomeAssistant) -> GoalTrackerStore:
    return hass.data[DOMAIN][DATA_MANAGER]


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get_goals)
    websocket_api.async_register_command(hass, ws_save_goal)
    websocket_api.async_register_command(hass, ws_delete_goal)
    websocket_api.async_register_command(hass, ws_set_progress)
    websocket_api.async_register_command(hass, ws_set_daily_value)
    websocket_api.async_register_command(hass, ws_seed_goals)
    websocket_api.async_register_command(hass, ws_remove_test_goals)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get_goals"})
@websocket_api.async_response
async def ws_get_goals(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    connection.send_result(msg["id"], {"goals": _manager(hass).goals})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/save_goal",
        vol.Required("goal"): dict,
    }
)
@websocket_api.async_response
async def ws_save_goal(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    goal = await _manager(hass).async_save_goal(msg["goal"])
    connection.send_result(msg["id"], {"goal": goal, "goals": _manager(hass).goals})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/delete_goal",
        vol.Required("goal_id"): str,
    }
)
@websocket_api.async_response
async def ws_delete_goal(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    goals = await _manager(hass).async_delete_goal(msg["goal_id"])
    connection.send_result(msg["id"], {"goals": goals})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_progress",
        vol.Required("goal_id"): str,
        vol.Required("progress"): vol.Coerce(float),
    }
)
@websocket_api.async_response
async def ws_set_progress(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    goal = await _manager(hass).async_set_progress(msg["goal_id"], msg["progress"])
    connection.send_result(msg["id"], {"goal": goal, "goals": _manager(hass).goals})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_daily_value",
        vol.Required("goal_id"): str,
        vol.Required("index"): vol.Coerce(int),
        vol.Required("value"): vol.Coerce(float),
    }
)
@websocket_api.async_response
async def ws_set_daily_value(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    goal = await _manager(hass).async_set_daily_value(msg["goal_id"], msg["index"], msg["value"])
    connection.send_result(msg["id"], {"goal": goal, "goals": _manager(hass).goals})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/seed_goals",
        vol.Required("goals"): list,
    }
)
@websocket_api.async_response
async def ws_seed_goals(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    goals = await _manager(hass).async_seed_goals(msg["goals"])
    connection.send_result(msg["id"], {"goals": goals})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/remove_test_goals"})
@websocket_api.async_response
async def ws_remove_test_goals(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    goals = await _manager(hass).async_remove_test_goals()
    connection.send_result(msg["id"], {"goals": goals})
