# Contributing

## Prerequisites

- Docker Desktop
- Node.js and npm
- PowerShell

Run commands from the repository root:

```powershell
cd C:\_Code\goal-tracker-card
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

The start script also opens this URL automatically. If the page loads before Home Assistant has finished booting, wait 30-60 seconds and refresh.

The dev instance uses trusted-network auth bypass. If Home Assistant still shows onboarding because local state was wiped, complete onboarding once, then use `.\scripts\start-dev.ps1` for normal development.

The dev configuration loads the `goal_tracker` integration from `dev_instance\config\custom_components\goal_tracker`. Goal data is saved in Home Assistant `.storage`.

## Updating After Code Changes

Edit frontend files under `src/` or integration files under `custom_components/goal_tracker`, then rebuild and sync the dev instance:

```powershell
npm run build
.\scripts\link-dev.ps1
```

Refresh the Home Assistant dashboard:

```text
http://localhost:8124/goal-tracker/test
```

If the browser serves stale JavaScript, hard refresh or clear site data for `localhost:8124`.

Run tests before committing:

```powershell
npm test
```

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

This wipes `dev_instance\config\.storage`, so Home Assistant will show onboarding again. For day-to-day card development, prefer:

```powershell
.\scripts\start-dev.ps1
```
