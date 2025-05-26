import { LitElement, html, css } from "/local/vendor/lit/lit.js";

class GoalTrackerCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
    goals: { state: true },
    showModal: { state: true },
    newGoal: { state: true },
    confirmingDelete: { state: true },
  };

  static styles = css`
    .goal-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .goal-row {
      border: 1px solid #ccc;
      padding: 12px;
      border-radius: 8px;
    }

    .goal-title {
      font-weight: bold;
      margin-bottom: 6px;
    }

    .goal-bar {
      position: relative;
      height: 20px;
      background: #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, #2ecc71, #27ae60);
    }

    .day-indicators {
      display: flex;
      gap: 5px;
      margin-top: 8px;
    }

    .day {
      width: 20px;
      height: 20px;
      background: #eee;
      border-radius: 4px;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      z-index: 10;
    }

    .modal-content {
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      max-width: 300px;
      width: 100%;
    }

    .modal-content h2 {
      margin-top: 0;
    }

    .modal-content label {
      display: block;
      margin: 10px 0 4px;
    }

    .modal-content input {
      width: 100%;
      padding: 6px;
      box-sizing: border-box;
    }

    button {
      margin-top: 10px;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background-color: #3498db;
      color: white;
      cursor: pointer;
    }

    button:hover {
      background-color: #2980b9;
    }

    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .goal-title {
      font-weight: bold;
    }

    .delete-button {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #b00;
      padding: 0;
    }

    .delete-button:hover {
      color: #f00;
    }

    .confirm-delete {
      margin-bottom: 8px;
    }
  `;

  constructor() {
    super();
    this.goals = [];
    this.showModal = false;
    this.newGoal = {};
  }

  setConfig(config) {
    this.config = config || {};
    this.goals = this.config.goals || [];
    this.confirmingDelete = null; // Holds goal currently pending deletion
  }

  render() {
    return html`
      <div class="goal-list">
        ${this.goals.map((goal) => this._renderGoal(goal))}
      </div>
      <button @click=${this._openAddModal}>+ Add Goal</button>
      <button @click=${this._addTestGoals}>Add Test Data</button>
      <button @click=${this._removeTestGoals}>Remove Test Data</button>

      ${this.showModal ? this._renderAddModal() : ""}
      ${this.confirmingDelete ? this._renderDeleteModal() : ""}
    `;
  }

  _renderGoal(goal) {
    const totalDays = this._calculateWorkingDays(
      goal.start,
      goal.end,
      goal.daysPerWeek
    );
    const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);
    const daysDone = Math.round((goal.progress / goal.target) * totalDays);

    return html`
      <div class="goal-row">
        <div class="goal-header">
          <div class="goal-title">
            ${goal.name} (${goal.progress}/${goal.target} ${goal.unit})
          </div>
          <button
            class="delete-button"
            title="Remove goal"
            @click=${() => this._confirmRemove(goal)}
          >
            🗑️
          </button>
        </div>

        ${this.confirmingDelete === goal
          ? html`
              <div class="confirm-delete">
                <em>Are you sure?</em>
                <button @click=${() => this._removeGoal(goal)}>Yes</button>
                <button @click=${this._cancelRemove}>No</button>
              </div>
            `
          : null}

        <div class="goal-bar">
          <div class="progress-fill" style="width: ${progressPercent}%;"></div>
        </div>

        <div class="day-indicators">
          ${[...Array(totalDays)].map((_, i) => {
            const color = i < daysDone ? "green" : "#eee";
            return html`<div class="day" style="background:${color}"></div>`;
          })}
        </div>
      </div>
    `;
  }

  _renderAddModal() {
    return html`
      <div class="modal" @click=${this._closeAddModal}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <h2>New Goal</h2>
          <label>Name</label>
          <input
            type="text"
            @input=${(e) => (this.newGoal.name = e.target.value)}
          />
          <label>Unit</label>
          <input
            type="text"
            @input=${(e) => (this.newGoal.unit = e.target.value)}
          />
          <label>Target</label>
          <input
            type="number"
            @input=${(e) => (this.newGoal.target = Number(e.target.value))}
          />
          <label>End Date</label>
          <input
            type="date"
            @input=${(e) => (this.newGoal.end = e.target.value)}
          />
          <label>Days/Week</label>
          <input
            type="number"
            @input=${(e) => (this.newGoal.daysPerWeek = Number(e.target.value))}
          />
          <button @click=${this._saveGoal}>Save</button>
          <button style="background-color: gray;" @click=${this._closeAddModal}>Cancel</button>
        </div>
      </div>
    `;
  }


  _openAddModal() {
    this.newGoal = {
      name: "",
      unit: "",
      target: 0,
      end: "",
      daysPerWeek: 5,
      start: new Date().toISOString().split("T")[0], // today
      progress: 0,
    };
    this.showModal = true;
  }

  _closeAddModal() {
    this.showModal = false;
  }

  _renderDeleteModal() {
    return html`
      <div class="modal" @click=${this._cancelRemove}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <h2>Delete Goal</h2>
          <p>
            Are you sure you want to delete "${this.confirmingDelete.name}"?
          </p>
          <button
            style="background-color: red;"
            @click=${() => this._removeGoal(this.confirmingDelete)}
          >
            Delete
          </button>
          <button @click=${this._cancelRemove}>Cancel</button>
        </div>
      </div>
    `;
  }

  _saveGoal() {
    this.goals = [...this.goals, { ...this.newGoal }];
    this.showModal = false;
  }

  _removeGoal(goalToRemove) {
    this.goals = this.goals.filter((goal) => goal !== goalToRemove);
  }

  _confirmRemove(goal) {
    this.confirmingDelete = goal;
  }

  _cancelRemove() {
    this.confirmingDelete = null;
  }

  _removeGoal(goalToRemove) {
    this.goals = this.goals.filter((goal) => goal !== goalToRemove);
    this.confirmingDelete = null;
  }

  _calculateWorkingDays(startDate, endDate, daysPerWeek) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.round((days / 7) * daysPerWeek);
  }

  getCardSize() {
    return 3 + this.goals.length;
  }

  _addTestGoals() {
    const today = new Date().toISOString().split("T")[0];

    const testGoals = [
      {
        name: "_TEST_ Run",
        unit: "km",
        target: 50,
        progress: 15,
        start: today,
        end: "2025-06-30",
        daysPerWeek: 4,
      },
      {
        name: "_TEST_ Read",
        unit: "pages",
        target: 300,
        progress: 120,
        start: today,
        end: "2025-07-15",
        daysPerWeek: 5,
      },
    ];

    this.goals = [...this.goals, ...testGoals];
  }

  _removeTestGoals() {
    this.goals = this.goals.filter((goal) => !goal.name.startsWith("_TEST_"));
  }
}

customElements.define("goal-tracker-card", GoalTrackerCard);
