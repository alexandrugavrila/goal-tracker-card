# Goal Tracker Card for Home Assistant

A lightweight, customizable Lovelace card for tracking goals using progress bars and daily status indicators. Built with LitElement.

![screenshot](https://user-images.githubusercontent.com/your-placeholder-image.png)

## Features

- ✅ Expected vs actual progress bars
- ✅ Daily progress boxes (done / missed / partial)
- ⚡ Fast and minimal with LitElement
- 📦 Easy to integrate with YAML dashboards

---

## Installation

1. **Copy the JS file** to your Home Assistant `www` folder:
```

/config/www/custom-cards/goal-tracker-card.js

````

2. **Register the card** in `configuration.yaml`:

```yaml
lovelace:
mode: yaml
resources:
 - url: /local/custom-cards/goal-tracker-card.js?v=1
   type: module
````

3. **Use in your dashboard YAML**:

```yaml
- type: custom:goal-tracker-card
  expected_progress: 60
  actual_progress: 45
  days:
    - done
    - partial
    - missed
    - done
    - partial
    - done
    - done
```

## Configuration Options

| Option              | Description                                     | Type      | Default |
| ------------------- | ----------------------------------------------- | --------- | ------- |
| `expected_progress` | The target goal progress percentage             | number    | `50`    |
| `actual_progress`   | The actual achieved progress percentage         | number    | `30`    |
| `days`              | Array of 7 strings: `done`, `missed`, `partial` | string\[] | varies  |

---

## License

MIT License © 2025 Alexandru Gavrila