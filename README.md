# Goal Tracker Card for Home Assistant

A Lovelace custom card for tracking goals with progress bars and daily status indicators.

## Features

- Actual progress with an expected-progress marker
- Daily progress boxes with editable per-day values
- Persistent goals stored in a Home Assistant `input_text` helper
- Optional YAML seed goals
- Optional debug controls for local test data

## Installation

### HACS

Install this repository as a Lovelace card. HACS loads the bundled `goal-tracker-card.js` resource from the repository root.

### Manual

Copy the bundled file to your Home Assistant config:

```text
/config/www/custom-cards/goal-tracker-card.js
```

Register it as a Lovelace module resource:

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /local/custom-cards/goal-tracker-card.js
      type: module
```

## Required Storage Helper

Create an `input_text` helper for persisted goal data:

```yaml
input_text:
  goal_tracker_data:
    name: Goal Tracker Data
    max: 32768
```

The card uses `input_text.goal_tracker_data` by default. To use another helper, set `storage_entity`.

## Card Configuration

```yaml
type: custom:goal-tracker-card
storage_entity: input_text.goal_tracker_data
debug: false
goals:
  - id: read-2026
    name: Read
    unit: pages
    target: 300
    progress: 0
    start: "2026-05-13"
    end: "2026-06-13"
    daysPerWeek: 5
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `storage_entity` | string | `input_text.goal_tracker_data` | `input_text` helper used to save goals. |
| `debug` | boolean | `false` | Shows Add/Remove Test Data controls when `true`. |
| `goals` | array | `[]` | Initial seed goals copied into storage once. |

YAML goals are seed data. After they are copied into storage, user edits are saved to the configured `input_text` helper and the same seed goals are not duplicated on reload.

## Development

Install dependencies, run tests, and build the bundled card:

```powershell
npm install
npm test
npm run build
```

The build writes the distributable bundle to `goal-tracker-card.js` and also updates the development Home Assistant copy at `dev_instance/config/www/custom-cards/goal-tracker-card.js`.

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
