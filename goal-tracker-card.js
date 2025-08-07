//#region ===== Imports and Setup =====
import { LitElement, html, css } from "/local/vendor/lit/lit.js";
//#endregion

//#region ===== Component Definition =====
class GoalTrackerCard extends LitElement {
  //#region ===== Reactive Properties =====
  static properties = {
    hass: {},
    config: {},
    goals: { state: true },
    showModal: { state: true },
    newGoal: { state: true },
    confirmingDeleteId: { state: true },
    progressEditingGoal: { state: true },
    dailyEdit: { state: true },
    showDailyModal: { state: true },
  };
  //#endregion

  //#region ===== Styles =====
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

    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }

    .goal-title {
      font-weight: bold;
      flex: 1;
    }

    .goal-actions {
      display: flex;
      gap: 6px;
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
    .progress-marker {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #000000ff;
      z-index: 2;
    }

    .day-indicators {
      display: grid;
      gap: 5px;
      margin-top: 8px;
    }
    .day {
      height: 20px;
      background: #eee;
      border-radius: 4px;
    }
    .day.today {
      outline: 2px solid #000;
      outline-offset: 1px;
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

    .set-button,
    .adjust-button {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #333;
      padding: 4px 8px;
      border-radius: 6px;
      background-color: #e6e6e6;
    }

    .set-button:hover,
    .adjust-button:hover {
      background-color: #ccc;
    }

    .delete-button {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #b00;
      padding: 4px 8px;
      border-radius: 6px;
      background-color: #f3d6d6;
    }

    .delete-button:hover {
      background-color: #f8bcbc;
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

    .confirm-delete {
      margin-bottom: 8px;
    }
  `;
  //#endregion

  //#region ===== Constructor & Configuration =====
  constructor() {
    super();
    this.goals = [];
    this.showModal = false;
    this.newGoal = {};
    this.confirmingDeleteId = null;
    this.progressEditingGoal = null;
    this.dailyEdit = {
      goalId: null,
      index: 0,
      value: 0,
    };
    this.showDailyModal = false;
  }

  setConfig(config) {
    this.config = config || {};
    const savedGoals = this._getGoalsFromState();
    const configGoals = this.config.goals || [];
    this.goals = [...configGoals, ...savedGoals];
  }
  //#endregion

  //#region ===== Lifecycle and Rendering =====
  render() {
    return html`
      <ha-card>
        <div class="goal-list">
          ${this.goals.map((goal) => this._renderGoal(goal))}
        </div>
        <button @click=${this._openAddModal}>+ Add Goal</button>
        <button @click=${this._addTestGoals}>Add Test Data</button>
        <button @click=${this._removeTestGoals}>Remove Test Data</button>
        ${this.showModal ? this._renderAddModal() : ""}
        ${this.confirmingDeleteId ? this._renderDeleteModal() : ""}
        ${this.progressEditingGoal ? this._renderSetProgressModal() : ""}
        ${this.showDailyModal ? this._renderDailyModal() : ""}
      </ha-card>
    `;
  }

  updated(changed) {
    if (changed.has("hass") && this.hass && this.goals.length === 0) {
      const saved = this._getGoalsFromState();
      const configGoals = this.config?.goals || [];
      this.goals = [...configGoals, ...saved];
    }
  }

  _renderGoal(goal) {
    const totalDays = goal.daily?.length || 0;
    const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);

    return html`
      <div class="goal-row">
        <div class="goal-header">
          <div class="goal-title">
            ${goal.name} (${goal.progress}/${goal.target} ${goal.unit})
          </div>
          <div class="goal-actions">
            <button
              class="adjust-button"
              @click=${() => this._incrementProgress(goal.id, -1)}
            >
              -1
            </button>
            <button
              class="adjust-button"
              @click=${() => this._incrementProgress(goal.id, 1)}
            >
              +1
            </button>
            <button
              class="set-button"
              @click=${() => this._openSetProgressModal(goal)}
            >
              Set
            </button>
            <button
              class="delete-button"
              @click=${() => this._confirmRemove(goal.id)}
            >
              🗑️
            </button>
          </div>
        </div>

        ${this.confirmingDeleteId === goal.id
          ? html`
              <div class="confirm-delete">
                <em>Are you sure?</em>
                <button @click=${() => this._removeGoalImmediately(goal.id)}>
                  Yes
                </button>
                <button @click=${this._cancelRemove}>No</button>
              </div>
            `
          : null}

        <div class="goal-bar">
          <div class="progress-fill" style="width: ${progressPercent}%;"></div>
          <div
            class="progress-marker"
            style="left: ${this._getExpectedProgressPercent(goal)}%;"
            title="Expected progress by today"
          ></div>
        </div>

        <div
          class="day-indicators"
          style="grid-template-columns: repeat(${Math.max(totalDays, 1)}, 1fr);"
        >
          ${Array.from({ length: Math.max(0, totalDays) }, (_, i) => {
            const value = goal.daily?.[i] ?? 0;
            const color = this._getDayColor(goal, i);
            const tooltip = `${value} ${goal.unit}`;
            const isToday =
              new Date().setHours(0, 0, 0, 0) ===
              new Date(goal.start).setHours(0, 0, 0, 0) + i * 86400000;

            return html`
              <div
                class="day ${isToday ? "today" : ""}"
                style="background:${color}; cursor: pointer;"
                title="${tooltip}"
                @click=${() => this._openDailyModal(goal.id, i)}
              ></div>
            `;
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
          <label>Starting Progress</label>
          <input
            type="number"
            @input=${(e) => (this.newGoal.progress = Number(e.target.value))}
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
          <button style="background-color: gray;" @click=${this._closeAddModal}>
            Cancel
          </button>
        </div>
      </div>
    `;
  }

  _renderDeleteModal() {
    const goal = this.goals.find((g) => g.id === this.confirmingDeleteId);
    return html`
      <div class="modal" @click=${this._cancelRemove}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <h2>Delete Goal</h2>
          <p>Are you sure you want to delete "${goal?.name}"?</p>
          <button
            style="background-color: red;"
            @click=${() => this._removeGoalImmediately(goal.id)}
          >
            Delete
          </button>
          <button @click=${this._cancelRemove}>Cancel</button>
        </div>
      </div>
    `;
  }

  _renderSetProgressModal() {
    return html`
      <div class="modal" @click=${this._closeSetProgressModal}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <h2>Set Progress</h2>
          <p>${this.progressEditingGoal.name}</p>
          <label>Progress (${this.progressEditingGoal.unit})</label>
          <input
            type="number"
            .value=${this.progressEditingGoal.progress}
            @input=${(e) =>
              (this.progressEditingGoal.progress = Number(e.target.value))}
          />
          <button @click=${this._saveProgress}>Save</button>
          <button
            style="background-color: gray;"
            @click=${this._closeSetProgressModal}
          >
            Cancel
          </button>
        </div>
      </div>
    `;
  }

  _renderDailyModal() {
    const goal = this.goals.find((g) => g.id === this.dailyEdit.goalId);
    if (!goal) return;

    const date = new Date(goal.start);
    date.setDate(date.getDate() + this.dailyEdit.index);
    const dateStr = date.toISOString().split("T")[0];
    const unit = goal.unit;

    return html`
      <div class="modal" @click=${this._closeDailyModal}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <h2>Edit Daily Progress</h2>
          <p>${goal.name} — <strong>${dateStr}</strong></p>
          <label>Progress (${unit})</label>
          <input
            type="number"
            .value=${this.dailyEdit.value}
            @input=${(e) =>
              (this.dailyEdit = {
                ...this.dailyEdit,
                value: Number(e.target.value),
              })}
          />
          <div
            style="display: flex; justify-content: space-between; margin-top: 12px;"
          >
            <button @click=${this._prevDay}>← Previous</button>
            <button @click=${this._setToday}>Today</button>
            <button @click=${this._nextDay}>Next →</button>
          </div>
          <button style="margin-top: 12px;" @click=${this._saveDailyValue}>
            Save
          </button>
          <button
            style="background-color: gray;"
            @click=${this._closeDailyModal}
          >
            Cancel
          </button>
        </div>
      </div>
    `;
  }
  //#endregion

  //#region ===== Modal Control =====
  _openAddModal() {
    this.newGoal = {
      id: crypto.randomUUID(),
      name: "",
      unit: "",
      target: 0,
      progress: 0,
      end: "",
      daysPerWeek: 5,
      start: new Date().toISOString().split("T")[0],
    };
    this.showModal = true;
  }

  _closeAddModal() {
    this.showModal = false;
  }

  _openSetProgressModal(goal) {
    this.progressEditingGoal = { ...goal };
  }

  _closeSetProgressModal() {
    this.progressEditingGoal = null;
  }

  _openDailyModal(goalId, index) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal) return;

    this.dailyEdit = {
      goalId,
      index,
      value: goal.daily?.[index] ?? 0,
    };
    this.showDailyModal = true;
  }

  _closeDailyModal() {
    this.showDailyModal = false;
  }
  //#endregion

  //#region ===== Goal Management =====
  _saveGoal() {
    const newGoal = {
      ...this.newGoal,
      daily: this._generateDailyArray(this.newGoal.start, this.newGoal.end),
    };
    this.goals = [...this.goals, newGoal];
    this.showModal = false;
    this._saveGoalsToState();
  }

  _confirmRemove(goalId) {
    this.confirmingDeleteId = goalId;
    this._saveGoalsToState();
  }

  _cancelRemove() {
    this.confirmingDeleteId = null;
    this._saveGoalsToState();
  }

  _removeGoalImmediately(goalId) {
    this.goals = this.goals.filter((goal) => goal.id !== goalId);
    this.confirmingDeleteId = null;
    this._saveGoalsToState();
  }

  _saveProgress() {
    this.goals = this.goals.map((goal) =>
      goal.id === this.progressEditingGoal.id
        ? { ...this.progressEditingGoal }
        : goal
    );
    this._saveGoalsToState();
    this._closeSetProgressModal();
  }

  _incrementProgress(goalId, delta) {
    this.goals = this.goals.map((goal) => {
      if (goal.id === goalId) {
        const newProgress = Math.max(
          0,
          Math.min(goal.target, goal.progress + delta)
        );
        return {
          ...goal,
          progress: newProgress,
        };
      }
      return goal;
    });
    this._saveGoalsToState();
  }

  _saveDailyValue() {
    const { goalId, index, value } = this.dailyEdit;
    this.goals = this.goals.map((goal) => {
      if (goal.id === goalId && Array.isArray(goal.daily)) {
        const updatedDaily = [...goal.daily];
        const oldValue = updatedDaily[index] ?? 0;
        const clamped = Math.max(0, value);
        updatedDaily[index] = clamped;

        const rawProgress = goal.progress + (clamped - oldValue);
        const boundedProgress = Math.max(0, Math.min(rawProgress, goal.target));

        return {
          ...goal,
          daily: updatedDaily,
          progress: boundedProgress,
        };
      }
      return goal;
    });
    this._saveGoalsToState();
    this._closeDailyModal();
  }

  _nextDay() {
    const goal = this.goals.find((g) => g.id === this.dailyEdit.goalId);
    if (!goal) return;
    const max = goal.daily.length - 1;
    const newIndex = Math.min(this.dailyEdit.index + 1, max);
    this.dailyEdit = {
      goalId: goal.id,
      index: newIndex,
      value: goal.daily[newIndex],
    };
  }

  _prevDay() {
    const newIndex = Math.max(this.dailyEdit.index - 1, 0);
    const goal = this.goals.find((g) => g.id === this.dailyEdit.goalId);
    if (!goal) return;
    this.dailyEdit = {
      goalId: goal.id,
      index: newIndex,
      value: goal.daily[newIndex],
    };
  }

  _setToday() {
    const goal = this.goals.find((g) => g.id === this.dailyEdit.goalId);
    if (!goal) return;

    const today = new Date().toISOString().split("T")[0];
    const start = new Date(goal.start);
    const end = new Date(goal.end);
    const date = new Date(today);

    if (date < start || date > end) return;

    const index = Math.floor((date - start) / (1000 * 60 * 60 * 24));

    // ✅ Clamp index just in case rounding lands on an edge
    const safeIndex = Math.min(Math.max(0, index), goal.daily.length - 1);

    this.dailyEdit = {
      goalId: goal.id,
      index: safeIndex,
      value: goal.daily[safeIndex],
    };
  }

  //#endregion

  //#region ===== Storage =====
  async _saveGoalsToState() {
    if (!this.hass) return;
    try {
      const value = JSON.stringify(this.goals);
      await this.hass.callService("input_text", "set_value", {
        entity_id: "input_text.goal_tracker_data",
        value,
      });
    } catch (e) {
      console.warn("Failed to save goals to input_text:", e);
    }
  }

  _getGoalsFromState() {
    if (!this.hass) return [];
    try {
      const entity = this.hass.states["input_text.goal_tracker_data"];
      if (entity && entity.state) {
        const parsed = JSON.parse(entity.state);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse goals from input_text:", e);
    }
    return [];
  }
  //#endregion

  //#region ===== Utilities =====
  _calculateWorkingDays(startDate, endDate, daysPerWeek) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.round((days / 7) * daysPerWeek);
  }

  _countDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(days, 0);
  }

  _generateDailyArray(startDate, endDate) {
    const length = this._countDaysBetween(startDate, endDate);
    return new Array(length).fill(0);
  }

  _getCardSize() {
    return 3 + this.goals.length;
  }

  _getDayColor(goal, index) {
    const today = new Date().setHours(0, 0, 0, 0);
    const goalStart = new Date(goal.start).setHours(0, 0, 0, 0);
    const dayDate = new Date(goalStart + index * 86400000); // ms/day
    const value = goal.daily?.[index] ?? 0;

    if (dayDate > today) return "#eee"; // future day
    if (value === 0) return "#e74c3c"; // red
    const expectedPerDay = goal.target / goal.daily.length;
    if (value < expectedPerDay) return "#f1c40f"; // yellow
    return "#2ecc71"; // green
  }

  _getExpectedProgressPercent(goal) {
    if (!goal.start || !goal.end || !goal.target) return 0;

    const now = new Date().setHours(0, 0, 0, 0);
    const start = new Date(goal.start).setHours(0, 0, 0, 0);
    const end = new Date(goal.end).setHours(0, 0, 0, 0);

    if (now < start) return 0;
    if (now > end) return 100;

    const elapsedRatio = (now - start) / (end - start);
    return Math.round(elapsedRatio * 100);
  }

  //#endregion

  //#region ===== Debug/Test Data =====
  _addTestGoals() {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const runStart = new Date(today);
    runStart.setDate(runStart.getDate() - 15);
    const runStartStr = runStart.toISOString().split("T")[0];

    const runEnd = new Date(today);
    runEnd.setDate(runEnd.getDate() + 15);
    const runEndStr = runEnd.toISOString().split("T")[0];

    const readEnd = new Date(today);
    readEnd.setDate(readEnd.getDate() + 30);
    const readEndStr = readEnd.toISOString().split("T")[0];

    const runDays = this._countDaysBetween(runStartStr, runEndStr);
    const readDays = this._countDaysBetween(todayStr, readEndStr);

    const runDaily = this._generateMockDaily(
      [
        [0, 0], // red
        [1, 1], // yellow (partial)
        [2, 3], // green (complete)
        [3, 0], // red
        [4, 2], // green
      ],
      runDays
    );

    const readDaily = this._generateMockDaily(
      [
        [0, 10],
        [1, 10],
        [2, 0],
        [3, 10],
        [4, 5],
      ],
      readDays
    );

    const testGoals = [
      {
        id: crypto.randomUUID(),
        name: "_TEST_ Run",
        unit: "km",
        target: 50,
        start: runStartStr,
        end: runEndStr,
        daysPerWeek: 4,
        daily: runDaily,
        progress: runDaily.reduce((a, b) => a + b, 0),
      },
      {
        id: crypto.randomUUID(),
        name: "_TEST_ Read",
        unit: "pages",
        target: 300,
        start: todayStr,
        end: readEndStr,
        daysPerWeek: 5,
        daily: readDaily,
        progress: readDaily.reduce((a, b) => a + b, 0),
      },
    ];

    this.goals = [...this.goals, ...testGoals];
    this._saveGoalsToState();
  }

  _removeTestGoals() {
    this.goals = this.goals.filter((goal) => !goal.name.startsWith("_TEST_"));
    this._saveGoalsToState();
  }

  _generateMockDaily(values, totalLength) {
    const arr = new Array(totalLength).fill(0);
    values.forEach(([index, val]) => {
      if (index >= 0 && index < totalLength) arr[index] = val;
    });
    return arr;
  }
  //#endregion
}
//#endregion

//#region ===== Registration =====
customElements.define("goal-tracker-card", GoalTrackerCard);
//#endregion
