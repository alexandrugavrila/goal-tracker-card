import { LitElement, html, css } from "lit";
import {
  DEFAULT_STORAGE_KEY,
  addDaysIso,
  countDaysBetween,
  createId,
  createPracticeFromGoalDaily,
  generateDailyArray,
  getExpectedProgressPercent,
  getPracticeDayColor,
  getPracticeValueForDate,
  getProgressPercent,
  isTodayForGoalIndex,
  normalizeGoal,
  normalizePractice,
  parseStoredGoals,
  todayIso,
  toIsoDate,
} from "./goal-utils.js";

class GoalTrackerCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
    goals: { state: true },
    practices: { state: true },
    showModal: { state: true },
    newGoal: { state: true },
    confirmingDeleteId: { state: true },
    confirmingPracticeDeleteId: { state: true },
    progressEditingGoal: { state: true },
    practiceEditing: { state: true },
    practiceDayEdit: { state: true },
    showPracticeDayModal: { state: true },
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

    .practice-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }

    .practice-row {
      border-top: 1px solid var(--divider-color, #ddd);
      padding-top: 8px;
    }

    .practice-header {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: center;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .practice-title {
      font-weight: 600;
      min-width: 0;
    }

    .practice-actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .practice-empty {
      color: var(--secondary-text-color, #666);
      font-size: 13px;
      margin-top: 8px;
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

    .modal-content input[type="checkbox"] {
      width: auto;
    }

    .modal-content select {
      width: 100%;
      padding: 6px;
      box-sizing: border-box;
    }

    .goal-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 6px;
    }

    .goal-checkboxes label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .goal-checkboxes input {
      width: auto;
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
    this.practices = [];
    this.showModal = false;
    this.newGoal = {};
    this.confirmingDeleteId = null;
    this.confirmingPracticeDeleteId = null;
    this.progressEditingGoal = null;
    this.practiceEditing = null;
    this.practiceDayEdit = {
      practiceId: null,
      goalId: null,
      date: "",
      value: 0,
    };
    this.showPracticeDayModal = false;
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
          <button @click=${this._openAddPracticeModal}>Add Practice</button>
          ${this.config.debug
            ? html`
                <button @click=${this._addTestGoals}>Add Test Data</button>
                <button @click=${this._removeTestGoals}>Remove Test Data</button>
              `
            : ""}
        </div>
        ${this.showModal ? this._renderAddModal() : ""}
        ${this.confirmingDeleteId ? this._renderDeleteModal() : ""}
        ${this.confirmingPracticeDeleteId ? this._renderPracticeDeleteModal() : ""}
        ${this.progressEditingGoal ? this._renderSetProgressModal() : ""}
        ${this.practiceEditing ? this._renderPracticeModal() : ""}
        ${this.showPracticeDayModal ? this._renderPracticeDayModal() : ""}
      </ha-card>
    `;
  }

  _renderGoal(goal) {
    const totalDays = countDaysBetween(goal.start, goal.end);
    const linkedPractices = this.practices.filter((practice) => practice.goalIds.includes(goal.id));

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

        ${linkedPractices.length
          ? html`
              <div class="practice-list">
                ${linkedPractices.map((practice) => this._renderPracticeForGoal(goal, practice, totalDays))}
              </div>
            `
          : html`<div class="practice-empty">No linked practices.</div>`}
      </div>
    `;
  }

  _renderPracticeForGoal(goal, practice, totalDays) {
    const targetLabel = practice.mode === "checkbox"
      ? "done / missed"
      : `${practice.targetPerDay} ${practice.unit || "units"}/day`;

    return html`
      <div class="practice-row">
        <div class="practice-header">
          <div class="practice-title">${practice.name || "Practice"} (${targetLabel})</div>
          <div class="practice-actions">
            <button class="set-button" @click=${() => this._openEditPracticeModal(practice)}>Edit</button>
            <button class="delete-button" @click=${() => this._confirmRemovePractice(practice.id)}>Delete</button>
          </div>
        </div>
        <div class="day-indicators" style="grid-template-columns: repeat(${Math.max(totalDays, 1)}, 1fr);">
          ${Array.from({ length: totalDays }, (_, i) => {
            const dateKey = addDaysIso(goal.start, i);
            const value = getPracticeValueForDate(practice, dateKey);
            const unit = practice.mode === "checkbox" ? (value > 0 ? "done" : "missed") : `${value} ${practice.unit}`;
            const tooltip = `${dateKey}: ${unit}`;
            return html`
              <div
                class="day ${isTodayForGoalIndex(goal, i) ? "today" : ""}"
                style="background:${getPracticeDayColor(practice, dateKey)}; cursor: pointer;"
                title="${tooltip}"
                @click=${() => this._openPracticeDayModal(practice.id, goal.id, dateKey)}
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

  _renderPracticeModal() {
    const practice = this.practiceEditing;

    return html`
      <div class="modal" @click=${this._closePracticeModal}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>${practice.id && this.practices.some((item) => item.id === practice.id) ? "Edit Practice" : "New Practice"}</h2>
          <label>Name</label>
          <input
            type="text"
            .value=${practice.name}
            @input=${(event) => this._updatePractice("name", event.target.value)}
          />
          <label>Mode</label>
          <select .value=${practice.mode} @change=${(event) => this._updatePractice("mode", event.target.value)}>
            <option value="number">Number</option>
            <option value="checkbox">Checkbox</option>
          </select>
          ${practice.mode === "number"
            ? html`
                <label>Unit</label>
                <input type="text" .value=${practice.unit} @input=${(event) => this._updatePractice("unit", event.target.value)} />
                <label>Daily Target</label>
                <input
                  type="number"
                  min="1"
                  .value=${practice.targetPerDay}
                  @input=${(event) => this._updatePractice("targetPerDay", Number(event.target.value))}
                />
              `
            : ""}
          <label>Linked Goals</label>
          <div class="goal-checkboxes">
            ${this.goals.map((goal) => html`
              <label>
                <input
                  type="checkbox"
                  .checked=${practice.goalIds.includes(goal.id)}
                  @change=${(event) => this._togglePracticeGoal(goal.id, event.target.checked)}
                />
                ${goal.name || "Untitled goal"}
              </label>
            `)}
          </div>
          <div class="modal-actions">
            <button @click=${this._savePractice}>Save</button>
            <button class="secondary-button" @click=${this._closePracticeModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPracticeDeleteModal() {
    const practice = this.practices.find((item) => item.id === this.confirmingPracticeDeleteId);
    if (!practice) {
      this.confirmingPracticeDeleteId = null;
      return "";
    }

    return html`
      <div class="modal" @click=${this._cancelRemovePractice}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Delete Practice</h2>
          <p>Are you sure you want to delete "${practice.name}"?</p>
          <div class="modal-actions">
            <button class="danger-button" @click=${() => this._removePracticeImmediately(practice.id)}>Delete</button>
            <button class="secondary-button" @click=${this._cancelRemovePractice}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPracticeDayModal() {
    const practice = this.practices.find((item) => item.id === this.practiceDayEdit.practiceId);
    const goal = this.goals.find((item) => item.id === this.practiceDayEdit.goalId);
    if (!practice || !goal) return "";

    return html`
      <div class="modal" @click=${this._closePracticeDayModal}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Edit Practice</h2>
          <p>${practice.name} <strong>${this.practiceDayEdit.date}</strong></p>
          ${practice.mode === "checkbox"
            ? html`
                <label>
                  <input
                    type="checkbox"
                    .checked=${this.practiceDayEdit.value > 0}
                    @change=${(event) =>
                      (this.practiceDayEdit = {
                        ...this.practiceDayEdit,
                        value: event.target.checked ? 1 : 0,
                      })}
                  />
                  Done
                </label>
              `
            : html`
                <label>Value (${practice.unit})</label>
                <input
                  type="number"
                  min="0"
                  .value=${this.practiceDayEdit.value}
                  @input=${(event) =>
                    (this.practiceDayEdit = {
                      ...this.practiceDayEdit,
                      value: Number(event.target.value),
                    })}
                />
              `}
          <div class="day-nav">
            <button @click=${this._prevPracticeDay}>Previous</button>
            <button @click=${this._setPracticeToday}>Today</button>
            <button @click=${this._nextPracticeDay}>Next</button>
          </div>
          <div class="modal-actions">
            <button @click=${this._savePracticeValue}>Save</button>
            <button class="secondary-button" @click=${this._closePracticeDayModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _openAddModal() {
    const start = todayIso();
    this.newGoal = {
      id: createId(),
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

  _openAddPracticeModal() {
    this.practiceEditing = normalizePractice({
      id: createId(),
      name: "",
      mode: "number",
      unit: "",
      targetPerDay: 1,
      goalIds: this.goals[0] ? [this.goals[0].id] : [],
      entries: {},
    });
  }

  _openEditPracticeModal(practice) {
    this.practiceEditing = normalizePractice(practice);
  }

  _closePracticeModal() {
    this.practiceEditing = null;
  }

  _updatePractice(key, value) {
    this.practiceEditing = normalizePractice({
      ...this.practiceEditing,
      [key]: value,
    }, this.practiceEditing);
  }

  _togglePracticeGoal(goalId, checked) {
    const goalIds = checked
      ? [...this.practiceEditing.goalIds, goalId]
      : this.practiceEditing.goalIds.filter((item) => item !== goalId);
    this._updatePractice("goalIds", goalIds);
  }

  _openPracticeDayModal(practiceId, goalId, date) {
    const practice = this.practices.find((item) => item.id === practiceId);
    if (!practice) return;

    this.practiceDayEdit = {
      practiceId,
      goalId,
      date,
      value: getPracticeValueForDate(practice, date),
    };
    this.showPracticeDayModal = true;
  }

  _closePracticeDayModal() {
    this.showPracticeDayModal = false;
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
      this.practices = result.practices || this.practices;
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

  async _savePractice() {
    const practice = normalizePractice(this.practiceEditing);
    this._closePracticeModal();
    await this._savePracticeToBackend(practice);
  }

  _confirmRemovePractice(practiceId) {
    this.confirmingPracticeDeleteId = practiceId;
  }

  _cancelRemovePractice() {
    this.confirmingPracticeDeleteId = null;
  }

  async _removePracticeImmediately(practiceId) {
    this.confirmingPracticeDeleteId = null;
    try {
      const result = await this._callGoalTracker("delete_practice", { practice_id: practiceId });
      this.goals = result.goals || this.goals;
      this.practices = result.practices || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  async _savePracticeValue() {
    const { practiceId, date, value } = this.practiceDayEdit;
    this._closePracticeDayModal();
    try {
      const result = await this._callGoalTracker("set_practice_value", {
        practice_id: practiceId,
        date,
        value,
      });
      this.goals = result.goals || this.goals;
      this.practices = result.practices || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _movePracticeDay(delta) {
    const goal = this.goals.find((item) => item.id === this.practiceDayEdit.goalId);
    const practice = this.practices.find((item) => item.id === this.practiceDayEdit.practiceId);
    if (!goal || !practice) return;
    const currentIndex = countDaysBetween(goal.start, this.practiceDayEdit.date) - 1;
    const totalDays = countDaysBetween(goal.start, goal.end);
    const index = Math.min(Math.max(currentIndex + delta, 0), totalDays - 1);
    const date = addDaysIso(goal.start, index);
    this.practiceDayEdit = {
      practiceId: practice.id,
      goalId: goal.id,
      date,
      value: getPracticeValueForDate(practice, date),
    };
  }

  _nextPracticeDay() {
    this._movePracticeDay(1);
  }

  _prevPracticeDay() {
    this._movePracticeDay(-1);
  }

  _setPracticeToday() {
    const goal = this.goals.find((item) => item.id === this.practiceDayEdit.goalId);
    const practice = this.practices.find((item) => item.id === this.practiceDayEdit.practiceId);
    if (!goal || !practice) return;
    const today = todayIso();
    if (today < goal.start || today > goal.end) return;
    this.practiceDayEdit = {
      practiceId: practice.id,
      goalId: goal.id,
      date: today,
      value: getPracticeValueForDate(practice, today),
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

      let result = await this._callGoalTracker("get_data");
      if (!this._migratedLocalStorage && (!result.goals || result.goals.length === 0)) {
        const migrated = this._readLegacyBrowserData();
        if (migrated.goals.length) {
          await this._callGoalTracker("seed_goals", { goals: migrated.goals });
          for (const practice of migrated.practices) {
            await this._callGoalTracker("save_practice", { practice });
          }
          result = await this._callGoalTracker("get_data");
          this.storageNotice = "Imported existing browser-stored goals into Home Assistant storage.";
        }
        this._migratedLocalStorage = true;
      }

      this.goals = result.goals || [];
      this.practices = result.practices || [];
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
      this.practices = result.practices || this.practices;
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
      this.practices = result.practices || this.practices;
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

  async _savePracticeToBackend(practice) {
    try {
      const result = await this._callGoalTracker("save_practice", { practice });
      this.goals = result.goals || this.goals;
      this.practices = result.practices || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _readLegacyBrowserData() {
    try {
      const value = window.localStorage.getItem(this.config.storage_key || DEFAULT_STORAGE_KEY);
      const parsed = value ? parseStoredGoals(value) : null;
      return {
        goals: parsed?.goals || [],
        practices: parsed?.practices || [],
      };
    } catch (error) {
      console.warn("Failed to read legacy browser storage:", error);
      return { goals: [], practices: [] };
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
    return 3 + this.goals.length + this.practices.length;
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
        id: createId(),
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
        id: createId(),
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

    const testPractices = testGoals.map(createPracticeFromGoalDaily).filter(Boolean);

    for (const goal of testGoals) {
      await this._saveGoalToBackend(goal);
    }
    for (const practice of testPractices) {
      await this._savePracticeToBackend({
        ...practice,
        name: `_TEST_ ${practice.name.replace(/^_TEST_ /, "")} Practice`,
      });
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
