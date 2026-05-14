# Goal Tracker for Home Assistant

A Home Assistant integration and Lovelace card for tracking goals with progress bars and linked accountability practices.

## Features

- Goal data persisted in Home Assistant `.storage`
- Practice data persisted alongside goals in Home Assistant `.storage`
- Lovelace card served by the integration
- Actual progress with an expected-progress marker
- Linked practice rows with editable daily numeric or done/missed values
- Many-to-many links between goals and practices
- Compact summary sensor for automations and dashboards
- Optional YAML seed goals in the card config
- Optional debug controls for local test data

## HACS Installation

This repository is packaged as a HACS integration.

1. In HACS, open the three-dot menu and choose **Custom repositories**.
2. Add this repository URL.
3. Select repository type **Integration**.
4. Install **Goal Tracker**.
5. Restart Home Assistant.
6. Add **Goal Tracker** from **Settings > Devices & services**.

The integration stores full goal data in Home Assistant `.storage`, not in entity state. No `input_text` helper is required.

## Dashboard Configuration

After installing and adding the integration, add the card to a dashboard:

```yaml
type: custom:goal-tracker-card
debug: false
```

If your dashboard uses YAML resources, add the integration-served card resource:

```yaml
lovelace:
  resource_mode: yaml
  resources:
    - url: /goal_tracker_static/goal-tracker-card.js
      type: module
```

Storage-mode dashboards may get the resource registered automatically by the integration. If the card shows `custom element does not exist`, add the resource above through **Settings > Dashboards > Resources**.

## Card Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `debug` | boolean | `false` | Shows Add/Remove Test Data controls when `true`. |
| `goals` | array | `[]` | Initial seed goals copied into `.storage` once. |
| `storage_key` | string | `goal-tracker-card:goals` | Legacy browser storage key used only for one-time migration. |

YAML goals are seed data. After they are copied into `.storage`, user edits are saved by the backend integration and the same seed goals are not duplicated on reload.

Goal progress and practice accountability are intentionally separate. Goal progress is set manually with the goal controls, while practice rows show the work being done toward one or more linked goals.

## Development

Install dependencies, run tests, and build the bundled card:

```powershell
npm install
npm test
npm run build
```

The build writes the distributable bundle to:

- `goal-tracker-card.js`
- `custom_components/goal_tracker/www/goal-tracker-card.js`
- `dev_instance/config/www/custom-cards/goal-tracker-card.js`

Start the local Home Assistant dev instance without resetting onboarding/auth state:

```powershell
.\scripts\start-dev.ps1
```

Then open:

```text
http://localhost:8124/goal-tracker/test
```

Use `.\scripts\reset-dev.ps1` only when you intentionally want to wipe the local Home Assistant state and start from a clean dev instance.

## License

MIT License (c) 2025 Alexandru Gavrila
