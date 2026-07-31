# Goal Tracker for Home Assistant

A Home Assistant integration and Lovelace card for tracking goals with progress bars and linked accountability practices.

## Features

- Goal data persisted in Home Assistant `.storage`
- Practice data persisted alongside goals in Home Assistant `.storage`
- Lovelace card served by the integration
- Native touchscreen keyboard support through standard text, decimal, and numeric inputs
- Goals with start and end dates, including increasing or decreasing numeric targets
- Actual progress with an expected-progress marker
- Linked practice rows with their own days-per-week cadence and editable daily numeric or done/missed values
- Numeric practice targets with `>`, `≥`, `<`, `≤`, or `=` comparisons and optional partial-progress ranges
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

Each goal stores a starting value, current value, target value, start date, and end date. The progress bar works in either direction, such as moving from 0 to 100 pages or from 240 to 220 pounds. Days per week belongs to each practice rather than to the goal.

Numeric practices can compare each logged value against the daily target using greater than, greater than or equal to, less than, less than or equal to, or equal to. The comparison describes what counts as successful: greater-than targets are meant to be exceeded, while less-than targets are ceilings to stay below. For greater-than comparisons, optional partial progress requires a minimum and runs from that value up to the target. For less-than comparisons, it requires a maximum and runs from the target up to that value. Equal-to comparisons do not support partial progress. Completed values take precedence over the partial range; for example, a calorie target of `≤ 2000` with a partial maximum of `2200` is green at 2000 or below, yellow above 2000 through 2200, and red above 2200.

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

The script creates a disposable local test profile on a clean instance, completes onboarding automatically, and opens the Goal Tracker card:

```text
http://localhost:8124/goal-tracker/test
```

The disposable profile uses `goal-tracker-dev` as both its username and password. It is only created on loopback and trusted-network authentication bypasses its login prompt. Use `.\scripts\reset-dev.ps1` when you intentionally want to wipe the local Home Assistant state; the test profile will be recreated automatically.

For unattended startup, such as CI, suppress the browser launch:

```powershell
.\scripts\start-dev.ps1 -NoBrowser
```

## License

MIT License (c) 2025 Alexandru Gavrila
