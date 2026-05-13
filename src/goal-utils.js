export const DEFAULT_STORAGE_KEY = "goal-tracker-card:goals";
export const STORAGE_VERSION = 1;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function todayIso() {
  return toIsoDate(new Date());
}

export function toIsoDate(value) {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export function parseDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function addDaysIso(startIso, index) {
  const start = parseDate(startIso);
  if (!start) return "";
  return toIsoDate(new Date(start.getTime() + index * MS_PER_DAY));
}

export function countDaysBetween(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || end < start) return 0;
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

export function generateDailyArray(startDate, endDate, existing = []) {
  const length = countDaysBetween(startDate, endDate);
  return Array.from({ length }, (_, index) => sanitizeNumber(existing[index], 0, 0));
}

export function sanitizeNumber(value, fallback = 0, min = Number.NEGATIVE_INFINITY) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, number);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeGoal(raw = {}, fallback = {}) {
  const start = parseDate(raw.start) ? raw.start : fallback.start ?? todayIso();
  const rawEnd = parseDate(raw.end) ? raw.end : fallback.end ?? start;
  const end = countDaysBetween(start, rawEnd) > 0 ? rawEnd : start;
  const target = sanitizeNumber(raw.target, fallback.target ?? 1, 0);
  const safeTarget = target > 0 ? target : 1;
  const daily = generateDailyArray(start, end, Array.isArray(raw.daily) ? raw.daily : []);
  const progress = clamp(sanitizeNumber(raw.progress, fallback.progress ?? 0, 0), 0, safeTarget);

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID(),
    name: typeof raw.name === "string" ? raw.name : fallback.name ?? "",
    unit: typeof raw.unit === "string" ? raw.unit : fallback.unit ?? "",
    target: safeTarget,
    progress,
    start,
    end,
    daysPerWeek: clamp(Math.round(sanitizeNumber(raw.daysPerWeek, fallback.daysPerWeek ?? 5, 1)), 1, 7),
    daily,
  };
}

export function goalSeedKey(goal) {
  return [
    goal.id || "",
    goal.name || "",
    goal.unit || "",
    goal.target ?? "",
    goal.start || "",
    goal.end || "",
  ].join("|");
}

export function parseStoredGoals(state) {
  if (!state || state === "unknown" || state === "unavailable") {
    return createStorageEnvelope();
  }

  try {
    const parsed = JSON.parse(state);
    if (Array.isArray(parsed)) {
      return {
        ...createStorageEnvelope(parsed),
        needsSave: true,
      };
    }

    if (parsed && typeof parsed === "object" && Array.isArray(parsed.goals)) {
      return {
        version: STORAGE_VERSION,
        goals: parsed.goals.map((goal) => normalizeGoal(goal)),
        seededConfigKeys: Array.isArray(parsed.seededConfigKeys)
          ? parsed.seededConfigKeys.filter((key) => typeof key === "string")
          : [],
        needsSave: parsed.version !== STORAGE_VERSION,
      };
    }
  } catch {
    return {
      ...createStorageEnvelope(),
      error: "Stored goal data is not valid JSON.",
    };
  }

  return {
    ...createStorageEnvelope(),
    error: "Stored goal data has an unsupported format.",
  };
}

export function createStorageEnvelope(goals = [], seededConfigKeys = []) {
  return {
    version: STORAGE_VERSION,
    goals: goals.map((goal) => normalizeGoal(goal)),
    seededConfigKeys: [...seededConfigKeys],
    needsSave: false,
  };
}

export function applyConfigSeeds(envelope, configGoals = []) {
  const seededConfigKeys = new Set(envelope.seededConfigKeys || []);
  const existingKeys = new Set(envelope.goals.map(goalSeedKey));
  const goals = [...envelope.goals];
  let changed = false;

  for (const rawGoal of Array.isArray(configGoals) ? configGoals : []) {
    const goal = normalizeGoal(rawGoal);
    const key = goalSeedKey(goal);
    if (seededConfigKeys.has(key) || existingKeys.has(key)) {
      if (!seededConfigKeys.has(key)) changed = true;
      seededConfigKeys.add(key);
      continue;
    }
    goals.push(goal);
    existingKeys.add(key);
    seededConfigKeys.add(key);
    changed = true;
  }

  return {
    version: STORAGE_VERSION,
    goals,
    seededConfigKeys: [...seededConfigKeys],
    changed,
  };
}

export function serializeStorage(goals, seededConfigKeys = []) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    goals: goals.map((goal) => normalizeGoal(goal)),
    seededConfigKeys,
  });
}

export function getProgressPercent(goal) {
  const target = sanitizeNumber(goal?.target, 0, 0);
  if (target <= 0) return 0;
  const progress = sanitizeNumber(goal?.progress, 0, 0);
  return clamp((progress / target) * 100, 0, 100);
}

export function getExpectedProgressPercent(goal, nowValue = new Date()) {
  if (!goal?.start || !goal?.end) return 0;
  const now = parseDate(toIsoDate(nowValue));
  const start = parseDate(goal.start);
  const end = parseDate(goal.end);
  if (!now || !start || !end || end < start) return 0;
  if (now < start) return 0;
  if (now > end) return 100;
  if (start.getTime() === end.getTime()) return 100;
  return Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100);
}

export function isTodayForGoalIndex(goal, index, nowValue = new Date()) {
  return addDaysIso(goal.start, index) === toIsoDate(nowValue);
}

export function getDayColor(goal, index, nowValue = new Date()) {
  const dayIso = addDaysIso(goal.start, index);
  if (!dayIso || dayIso > toIsoDate(nowValue)) return "#eee";

  const value = sanitizeNumber(goal.daily?.[index], 0, 0);
  if (value === 0) return "#e74c3c";

  const expectedPerDay = goal.daily?.length ? goal.target / goal.daily.length : goal.target;
  if (expectedPerDay > 0 && value < expectedPerDay) return "#f1c40f";
  return "#2ecc71";
}
