import { LitElement, html, css } from '/local/vendor/lit/lit.js';

class GoalTrackerCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
  };

  static styles = css`
    .goal-bar {
      width: 100%;
      height: 24px;
      position: relative;
      background: linear-gradient(to right, #ccc 0%, #ccc 100%);
    }

    .progress-should {
      position: absolute;
      height: 100%;
      background: linear-gradient(to right, rgba(0, 150, 250, 0.5), transparent);
    }

    .progress-actual {
      position: absolute;
      height: 100%;
      background: linear-gradient(to right, rgba(0, 250, 100, 0.7), transparent);
    }

    .day-boxes {
      display: flex;
      gap: 5px;
      margin-bottom: 10px;
    }

    .day {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background: #eee;
    }

    .day.done { background: green; }
    .day.missed { background: red; }
    .day.partial { background: yellow; }
  `;

  setConfig(config) {
    this.config = {
      expected_progress: 50,
      actual_progress: 30,
      days: ["partial", "partial", "done", "missed", "done", "partial", "done"],
      ...config,
    };
  }

  render() {
    const { expected_progress, actual_progress, days } = this.config;

    return html`
      <div class="day-boxes">
        ${days.map((status) => html`<div class="day ${status}"></div>`)}
      </div>

      <div class="goal-bar">
        <div
          class="progress-should"
          style="width: ${expected_progress}%;"
        ></div>
        <div
          class="progress-actual"
          style="width: ${actual_progress}%;"
        ></div>
      </div>
    `;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define('goal-tracker-card', GoalTrackerCard);
