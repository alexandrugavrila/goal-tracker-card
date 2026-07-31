# Contributing

## Prerequisites

- Docker Desktop
- Node.js and npm
- PowerShell

Run commands from the repository root:

```powershell
cd C:\Workspace\projects\home-automation\cards\goal-tracker-card
```

## First-Time Dev Container Startup

Install dependencies and build the bundled card:

```powershell
npm install
npm run build
```

Start the Home Assistant dev container:

```powershell
.\scripts\start-dev.ps1
```

Open the dev dashboard:

```text
http://localhost:8124/goal-tracker/test
```

The start script waits for Home Assistant, creates a disposable `goal-tracker-dev` profile when the instance is clean, completes onboarding, and then opens this URL automatically.

The dev instance uses trusted-network auth bypass, so the disposable profile does not display a login prompt. The profile is only created on loopback and uses `goal-tracker-dev` as both its username and password.

Pass `-NoBrowser` to `start-dev.ps1` for unattended or CI startup.

The dev configuration loads the `goal_tracker` integration from `dev_instance\config\custom_components\goal_tracker`. Goal data is saved in Home Assistant `.storage`.

## Updating After Code Changes

Edit frontend files under `src/` or integration files under `custom_components/goal_tracker`, then rebuild and sync the dev instance:

```powershell
npm run build
.\scripts\link-dev.ps1
```

The sync script writes the Lovelace resource query string to the ignored `dev_instance\config\lovelace-resources.yaml` file so Home Assistant imports a fresh card module instead of a cached `goal-tracker-card.js`. The tracked `configuration.yaml` includes that generated file and remains unchanged between runs.

Refresh the Home Assistant dashboard:

```text
http://localhost:8124/goal-tracker/test
```

If the browser still serves stale JavaScript, hard refresh or clear site data for `localhost:8124`.

Run tests before committing:

```powershell
npm test
```

## Frontend Coding Standards

### Input semantics and touch keyboards

Every user-editable `<input>` must declare the semantic `type` that matches the value being entered. Text and numeric inputs must also declare an appropriate `inputmode` so touchscreen operating systems and kiosk browsers can present the correct on-screen keyboard:

- General text: `type="text"` with `inputmode="text"`
- Decimal or signed measurements: `type="number"` with `inputmode="decimal"` and `step="any"`
- Whole numbers: `type="number"` with `inputmode="numeric"` and an appropriate integer `step`
- Dates: `type="date"` so the device can use its native date picker
- Email, telephone, URL, password, checkbox, and other specialized values: use their corresponding HTML input type

`inputmode` is a keyboard-layout hint, not validation. Continue to declare applicable `min`, `max`, and `step` constraints and validate or normalize values in application code. Do not implement a card-specific on-screen keyboard when standard inputs and the device keyboard can provide the behavior globally.

## Rebuilding the Dev Container

Use this when you want to completely stop and recreate the Docker containers while preserving local Home Assistant state:

```powershell
.\scripts\rebuild-dev.ps1
```

The rebuild script:

- Runs `docker compose down --remove-orphans`
- Runs `npm run build`
- Copies the rebuilt card and integration into `dev_instance\config`
- Pulls the latest Home Assistant image
- Starts Docker with `--force-recreate --build`

This preserves `dev_instance\config\.storage`, so auth state and saved Goal Tracker data remain intact. Use `.\scripts\reset-dev.ps1` only when you intentionally want to wipe local Home Assistant state; the disposable profile and onboarding state are recreated automatically.

## Publishing an Update for HACS

After verifying the change locally, commit and push to `main`:

```powershell
git status
git add -A
git commit -m "fix: describe the change"
git push origin main
```

Tag a new version higher than the current release:

```powershell
git tag v0.1.1
git push origin v0.1.1
```

On HAOS, update through HACS:

1. Open **HACS**.
2. Open **Goal Tracker**.
3. Use **Update information** if the new tag is not visible.
4. Click **Download** or **Redownload** and choose the new version.
5. Restart Home Assistant.
6. Hard refresh the dashboard.

The dashboard resource should remain:

```yaml
- url: /goal_tracker_static/goal-tracker-card.js
  type: module
```

## Stopping the Dev Container

```powershell
docker rm -f homeassistant-goal-tracker-card-dev
```

## Resetting Local Home Assistant State

Use reset only when you intentionally want a clean Home Assistant dev instance:

```powershell
.\scripts\reset-dev.ps1
```

This wipes `dev_instance\config\.storage`, then recreates the disposable dev profile and completes onboarding automatically. For day-to-day card development, prefer:

```powershell
.\scripts\start-dev.ps1
```
