import { LitElement, html, css } from "lit";
import {
  DEFAULT_STORAGE_KEY,
  addDaysIso,
  countDaysBetween,
  generateDailyArray,
  getDayColor,
  getExpectedProgressPercent,
  getProgressPercent,
  isTodayForGoalIndex,
  normalizeGoal,
  parseStoredGoals,
  todayIso,
  toIsoDate,
} from "./goal-utils.js";

class GoalTrackerCard extends LitElement {
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
    storageError: { state: true },
    storageNotice: { state: true },
  };

  static styles = css`
    ha-card {
      display: block;
      padding: 16px;
    }

    .goal-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .goal-row {
      border: 1px solid var(--divider-color, #ccc);
      padding: 12px;
      border-radius: 8px;
      background: var(--card-background-color, #fff);
    }

    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 6px;
    }

    .goal-title {
      font-weight: 700;
      flex: 1;
      min-width: 0;
    }

    .goal-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: flex-end;
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
      background-color: #000;
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
      outline: 2px solid var(--primary-text-color, #000);
      outline-offset: 1px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background-color: var(--primary-color, #3498db);
      color: var(--text-primary-color, #fff);
      cursor: pointer;
    }

    button:hover {
      filter: brightness(0.92);
    }

    .set-button,
    .adjust-button {
      font-size: 14px;
      color: #333;
      padding: 4px 8px;
      background-color: #e6e6e6;
    }

    .delete-button {
      color: #b00;
      padding: 4px 8px;
      background-color: #f3d6d6;
    }

    .secondary-button {
      background-color: #777;
    }

    .danger-button {
      background-color: #c0392b;
    }

    .error {
      border: 1px solid #c0392b;
      background: #fdecea;
      color: #7b1d14;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .notice {
      border: 1px solid #b7791f;
      background: #fff8e1;
      color: #6b4e00;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .empty {
      color: var(--secondary-text-color, #666);
      margin: 0 0 12px;
    }

    .modal {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      z-index: 10;
      padding: 16px;
      box-sizing: border-box;
    }

    .modal-content {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
      padding: 20px;
      border-radius: 8px;
      max-width: 320px;
      width: 100%;
      box-sizing: border-box;
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

    .modal-actions,
    .day-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
  `;

  constructor() {
    super();
    this.config = {};
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
    this.storageError = "";
    this.storageNotice = "";
    this._loaded = false;
    this._loadingGoals = false;
    this._seededConfig = false;
    this._migratedLocalStorage = false;
  }

  setConfig(config) {
    this.config = {
      storage_key: DEFAULT_STORAGE_KEY,
      debug: false,
      goals: [],
      ...(config || {}),
    };
    this._loaded = false;
    this._seededConfig = false;
    this._loadGoals();
  }

  updated(changed) {
    if ((changed.has("hass") || changed.has("config")) && !this._loaded) {
      this._loadGoals();
    }
  }

  render() {
    return html`
      <ha-card>
        ${this.storageError ? html`<div class="error">${this.storageError}</div>` : ""}
        ${this.storageNotice ? html`<div class="notice">${this.storageNotice}</div>` : ""}
        ${this.goals.length
          ? html`<div class="goal-list">${this.goals.map((goal) => this._renderGoal(goal))}</div>`
          : html`<p class="empty">No goals yet.</p>`}
        <div class="actions">
          <button @click=${this._openAddModal}>Add Goal</button>
          ${this.config.debug
            ? html`
                <button @click=${this._addTestGoals}>Add Test Data</button>
                <button @click=${this._removeTestGoals}>Remove Test Data</button>
              `
            : ""}
        </div>
        ${this.showModal ? this._renderAddModal() : ""}
        ${this.confirmingDeleteId ? this._renderDeleteModal() : ""}
        ${this.progressEditingGoal ? this._renderSetProgressModal() : ""}
        ${this.showDailyModal ? this._renderDailyModal() : ""}
      </ha-card>
    `;
  }

  _renderGoal(goal) {
    const totalDays = goal.daily?.length || 0;

    return html`
      <div class="goal-row">
        <div class="goal-header">
          <div class="goal-title">${goal.name} (${goal.progress}/${goal.target} ${goal.unit})</div>
          <div class="goal-actions">
            <button class="adjust-button" @click=${() => this._incrementProgress(goal.id, -1)}>-1</button>
            <button class="adjust-button" @click=${() => this._incrementProgress(goal.id, 1)}>+1</button>
            <button class="set-button" @click=${() => this._openSetProgressModal(goal)}>Set</button>
            <button class="delete-button" @click=${() => this._confirmRemove(goal.id)}>Delete</button>
          </div>
        </div>

        <div class="goal-bar">
          <div class="progress-fill" style="width: ${getProgressPercent(goal)}%;"></div>
          <div
            class="progress-marker"
            style="left: ${getExpectedProgressPercent(goal)}%;"
            title="Expected progress by today"
          ></div>
        </div>

        <div class="day-indicators" style="grid-template-columns: repeat(${Math.max(totalDays, 1)}, 1fr);">
          ${Array.from({ length: totalDays }, (_, i) => {
            const value = goal.daily?.[i] ?? 0;
            const tooltip = `${addDaysIso(goal.start, i)}: ${value} ${goal.unit}`;
            return html`
              <div
                class="day ${isTodayForGoalIndex(goal, i) ? "today" : ""}"
                style="background:${getDayColor(goal, i)}; cursor: pointer;"
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
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>New Goal</h2>
          <label>Name</label>
          <input type="text" .value=${this.newGoal.name} @input=${(event) => this._updateNewGoal("name", event.target.value)} />
          <label>Unit</label>
          <input type="text" .value=${this.newGoal.unit} @input=${(event) => this._updateNewGoal("unit", event.target.value)} />
          <label>Target</label>
          <input type="number" min="1" .value=${this.newGoal.target} @input=${(event) => this._updateNewGoal("target", Number(event.target.value))} />
          <label>Starting Progress</label>
          <input type="number" min="0" .value=${this.newGoal.progress} @input=${(event) => this._updateNewGoal("progress", Number(event.target.value))} />
          <label>End Date</label>
          <input type="date" .value=${this.newGoal.end} @input=${(event) => this._updateNewGoal("end", event.target.value)} />
          <label>Days/Week</label>
          <input type="number" min="1" max="7" .value=${this.newGoal.daysPerWeek} @input=${(event) => this._updateNewGoal("daysPerWeek", Number(event.target.value))} />
          <div class="modal-actions">
            <button @click=${this._saveGoal}>Save</button>
            <button class="secondary-button" @click=${this._closeAddModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderDeleteModal() {
    const goal = this.goals.find((item) => item.id === this.confirmingDeleteId);
    if (!goal) {
      this.confirmingDeleteId = null;
      return "";
    }

    return html`
      <div class="modal" @click=${this._cancelRemove}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Delete Goal</h2>
          <p>Are you sure you want to delete "${goal.name}"?</p>
          <div class="modal-actions">
            <button class="danger-button" @click=${() => this._removeGoalImmediately(goal.id)}>Delete</button>
            <button class="secondary-button" @click=${this._cancelRemove}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderSetProgressModal() {
    return html`
      <div class="modal" @click=${this._closeSetProgressModal}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Set Progress</h2>
          <p>${this.progressEditingGoal.name}</p>
          <label>Progress (${this.progressEditingGoal.unit})</label>
          <input
            type="number"
            min="0"
            .value=${this.progressEditingGoal.progress}
            @input=${(event) =>
              (this.progressEditingGoal = {
                ...this.progressEditingGoal,
                progress: Number(event.target.value),
              })}
          />
          <div class="modal-actions">
            <button @click=${this._saveProgress}>Save</button>
            <button class="secondary-button" @click=${this._closeSetProgressModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderDailyModal() {
    const goal = this.goals.find((item) => item.id === this.dailyEdit.goalId);
    if (!goal) return "";

    const dateStr = addDaysIso(goal.start, this.dailyEdit.index);

    return html`
      <div class="modal" @click=${this._closeDailyModal}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Edit Daily Progress</h2>
          <p>${goal.name} <strong>${dateStr}</strong></p>
          <label>Progress (${goal.unit})</label>
          <input
            type="number"
            min="0"
            .value=${this.dailyEdit.value}
            @input=${(event) =>
              (this.dailyEdit = {
                ...this.dailyEdit,
                value: Number(event.target.value),
              })}
          />
          <div class="day-nav">
            <button @click=${this._prevDay}>Previous</button>
            <button @click=${this._setToday}>Today</button>
            <button @click=${this._nextDay}>Next</button>
          </div>
          <div class="modal-actions">
            <button @click=${this._saveDailyValue}>Save</button>
            <button class="secondary-button" @click=${this._closeDailyModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _openAddModal() {
    const start = todayIso();
    this.newGoal = {
      id: crypto.randomUUID(),
      name: "",
      unit: "",
      target: 1,
      progress: 0,
      start,
      end: start,
      daysPerWeek: 5,
    };
    this.showModal = true;
  }

  _closeAddModal() {
    this.showModal = false;
  }

  _updateNewGoal(key, value) {
    this.newGoal = {
      ...this.newGoal,
      [key]: value,
    };
  }

  _openSetProgressModal(goal) {
    this.progressEditingGoal = { ...goal };
  }

  _closeSetProgressModal() {
    this.progressEditingGoal = null;
  }

  _openDailyModal(goalId, index) {
    const goal = this.goals.find((item) => item.id === goalId);
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

  async _saveGoal() {
    const goal = normalizeGoal({
      ...this.newGoal,
      daily: generateDailyArray(this.newGoal.start, this.newGoal.end),
    });
    this.showModal = false;
    await this._saveGoalToBackend(goal);
  }

  _confirmRemove(goalId) {
    this.confirmingDeleteId = goalId;
  }

  _cancelRemove() {
    this.confirmingDeleteId = null;
  }

  async _removeGoalImmediately(goalId) {
    this.confirmingDeleteId = null;
    try {
      const result = await this._callGoalTracker("delete_goal", { goal_id: goalId });
      this.goals = result.goals || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  async _saveProgress() {
    const updatedGoal = normalizeGoal(this.progressEditingGoal);
    this._closeSetProgressModal();
    await this._setProgress(updatedGoal.id, updatedGoal.progress);
  }

  async _incrementProgress(goalId, delta) {
    const goal = this.goals.find((item) => item.id === goalId);
    if (!goal) return;
    await this._setProgress(goalId, goal.progress + delta);
  }

  async _saveDailyValue() {
    const { goalId, index, value } = this.dailyEdit;
    this._closeDailyModal();
    try {
      const result = await this._callGoalTracker("set_daily_value", {
        goal_id: goalId,
        index,
        value,
      });
      this.goals = result.goals || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _nextDay() {
    const goal = this.goals.find((item) => item.id === this.dailyEdit.goalId);
    if (!goal?.daily?.length) return;
    const index = Math.min(this.dailyEdit.index + 1, goal.daily.length - 1);
    this.dailyEdit = {
      goalId: goal.id,
      index,
      value: goal.daily[index],
    };
  }

  _prevDay() {
    const goal = this.goals.find((item) => item.id === this.dailyEdit.goalId);
    if (!goal?.daily?.length) return;
    const index = Math.max(this.dailyEdit.index - 1, 0);
    this.dailyEdit = {
      goalId: goal.id,
      index,
      value: goal.daily[index],
    };
  }

  _setToday() {
    const goal = this.goals.find((item) => item.id === this.dailyEdit.goalId);
    if (!goal?.daily?.length) return;
    const today = todayIso();
    if (today < goal.start || today > goal.end) return;
    const index = countDaysBetween(goal.start, today) - 1;
    this.dailyEdit = {
      goalId: goal.id,
      index,
      value: goal.daily[index],
    };
  }

  async _loadGoals() {
    if (!this.hass || !this.config || this._loadingGoals) return;
    this._loadingGoals = true;
    try {
      if (!this._seededConfig && Array.isArray(this.config.goals) && this.config.goals.length) {
        await this._callGoalTracker("seed_goals", { goals: this.config.goals });
        this._seededConfig = true;
      }

      let result = await this._callGoalTracker("get_goals");
      if (!this._migratedLocalStorage && (!result.goals || result.goals.length === 0)) {
        const migratedGoals = this._readLegacyBrowserGoals();
        if (migratedGoals.length) {
          result = await this._callGoalTracker("seed_goals", { goals: migratedGoals });
          this.storageNotice = "Imported existing browser-stored goals into Home Assistant storage.";
        }
        this._migratedLocalStorage = true;
      }

      this.goals = result.goals || [];
      this._loaded = true;
      this.storageError = "";
    } catch (error) {
      this._handleBackendError(error);
    } finally {
      this._loadingGoals = false;
    }
  }

  async _saveGoalToBackend(goal) {
    try {
      const result = await this._callGoalTracker("save_goal", { goal });
      this.goals = result.goals || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  async _setProgress(goalId, progress) {
    try {
      const result = await this._callGoalTracker("set_progress", {
        goal_id: goalId,
        progress,
      });
      this.goals = result.goals || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _callGoalTracker(command, payload = {}) {
    if (!this.hass?.callWS) {
      return Promise.reject(new Error("Home Assistant WebSocket API is not available."));
    }
    return this.hass.callWS({
      type: `goal_tracker/${command}`,
      ...payload,
    });
  }

  _readLegacyBrowserGoals() {
    try {
      const value = window.localStorage.getItem(this.config.storage_key || DEFAULT_STORAGE_KEY);
      const parsed = value ? parseStoredGoals(value) : null;
      return parsed?.goals || [];
    } catch (error) {
      console.warn("Failed to read legacy browser storage:", error);
      return [];
    }
  }

  _handleBackendError(error) {
    this.storageError = "Goal Tracker integration is not loaded. Add the Goal Tracker integration or restart Home Assistant after installing it.";
    this.storageNotice = "";
    console.warn("Goal Tracker backend call failed:", error);
  }

  _clearStorageMessages() {
    this.storageError = "";
    this.storageNotice = "";
  }

  _getCardSize() {
    return 3 + this.goals.length;
  }

  async _addTestGoals() {
    const today = new Date();
    const todayStr = toIsoDate(today);

    const runStart = new Date(today);
    runStart.setUTCDate(runStart.getUTCDate() - 15);
    const runStartStr = toIsoDate(runStart);

    const runEnd = new Date(today);
    runEnd.setUTCDate(runEnd.getUTCDate() + 15);
    const runEndStr = toIsoDate(runEnd);

    const readEnd = new Date(today);
    readEnd.setUTCDate(readEnd.getUTCDate() + 30);
    const readEndStr = toIsoDate(readEnd);

    const runDaily = this._generateMockDaily(
      [
        [0, 0],
        [1, 1],
        [2, 3],
        [3, 0],
        [4, 2],
      ],
      countDaysBetween(runStartStr, runEndStr)
    );

    const readDaily = this._generateMockDaily(
      [
        [0, 10],
        [1, 10],
        [2, 0],
        [3, 10],
        [4, 5],
      ],
      countDaysBetween(todayStr, readEndStr)
    );

    const testGoals = [
      normalizeGoal({
        id: crypto.randomUUID(),
        name: "_TEST_ Run",
        unit: "km",
        target: 50,
        start: runStartStr,
        end: runEndStr,
        daysPerWeek: 4,
        daily: runDaily,
        progress: runDaily.reduce((sum, value) => sum + value, 0),
      }),
      normalizeGoal({
        id: crypto.randomUUID(),
        name: "_TEST_ Read",
        unit: "pages",
        target: 300,
        start: todayStr,
        end: readEndStr,
        daysPerWeek: 5,
        daily: readDaily,
        progress: readDaily.reduce((sum, value) => sum + value, 0),
      }),
    ];

    for (const goal of testGoals) {
      await this._saveGoalToBackend(goal);
    }
  }

  async _removeTestGoals() {
    try {
      const result = await this._callGoalTracker("remove_test_goals");
      this.goals = result.goals || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _generateMockDaily(values, totalLength) {
    const arr = new Array(totalLength).fill(0);
    values.forEach(([index, value]) => {
      if (index >= 0 && index < totalLength) arr[index] = value;
    });
    return arr;
  }
}

customElements.define("goal-tracker-card", GoalTrackerCard);
