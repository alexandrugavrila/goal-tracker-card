import { describe, expect, it } from "vitest";
import {
  applyConfigSeeds,
  countDaysBetween,
  getExpectedProgressPercent,
  getPracticeDayColor,
  getPracticeValueForDate,
  getProgressPercent,
  normalizeGoal,
  normalizePractice,
  parseStoredGoals,
  serializeStorage,
} from "../src/goal-utils.js";

describe("countDaysBetween", () => {
  it("counts inclusive date ranges", () => {
    expect(countDaysBetween("2026-05-13", "2026-05-13")).toBe(1);
    expect(countDaysBetween("2026-05-13", "2026-05-15")).toBe(3);
  });

  it("returns zero for invalid or reversed ranges", () => {
    expect(countDaysBetween("bad", "2026-05-15")).toBe(0);
    expect(countDaysBetween("2026-05-16", "2026-05-15")).toBe(0);
  });
});

describe("normalizeGoal", () => {
  it("clamps progress and repairs daily length", () => {
    const goal = normalizeGoal({
      id: "goal-1",
      name: "Run",
      unit: "km",
      target: 10,
      progress: 12,
      start: "2026-05-13",
      end: "2026-05-15",
      daily: [1],
      daysPerWeek: 9,
    });

    expect(goal.progress).toBe(10);
    expect(goal.daily).toEqual([1, 0, 0]);
    expect(goal.daysPerWeek).toBe(7);
  });

  it("defaults invalid target and dates to stable values", () => {
    const goal = normalizeGoal({
      target: 0,
      progress: Number.POSITIVE_INFINITY,
      start: "not-a-date",
      end: "also-bad",
    });

    expect(goal.target).toBe(1);
    expect(goal.progress).toBe(0);
    expect(goal.daily.length).toBe(1);
  });
});

describe("progress calculations", () => {
  it("returns safe progress percentages", () => {
    expect(getProgressPercent({ progress: 5, target: 10 })).toBe(50);
    expect(getProgressPercent({ progress: 20, target: 10 })).toBe(100);
    expect(getProgressPercent({ progress: 1, target: 0 })).toBe(0);
  });

  it("returns expected progress from 0 to 100", () => {
    const goal = {
      start: "2026-05-10",
      end: "2026-05-20",
    };

    expect(getExpectedProgressPercent(goal, new Date("2026-05-01T00:00:00Z"))).toBe(0);
    expect(getExpectedProgressPercent(goal, new Date("2026-05-15T00:00:00Z"))).toBe(50);
    expect(getExpectedProgressPercent(goal, new Date("2026-05-21T00:00:00Z"))).toBe(100);
  });

  it("handles same-day goals without division by zero", () => {
    expect(
      getExpectedProgressPercent(
        {
          start: "2026-05-13",
          end: "2026-05-13",
        },
        new Date("2026-05-13T00:00:00Z")
      )
    ).toBe(100);
  });
});

describe("storage helpers", () => {
  it("migrates the old saved array format", () => {
    const parsed = parseStoredGoals(
      JSON.stringify([
        {
          id: "goal-1",
          name: "Run",
          target: 10,
          start: "2026-05-13",
          end: "2026-05-13",
          daily: [2],
        },
      ])
    );

    expect(parsed.needsSave).toBe(true);
    expect(parsed.goals).toHaveLength(1);
    expect(parsed.practices).toHaveLength(1);
    expect(parsed.practices[0].goalIds).toEqual(["goal-1"]);
    expect(parsed.practices[0].entries).toEqual({ "2026-05-13": 2 });
  });

  it("does not duplicate config seed goals across repeated loads", () => {
    const configGoals = [
      {
        id: "seed-1",
        name: "Read",
        target: 100,
        start: "2026-05-13",
        end: "2026-05-14",
      },
    ];

    const first = applyConfigSeeds(parseStoredGoals(""), configGoals);
    const second = applyConfigSeeds(parseStoredGoals(serializeStorage(first.goals, first.seededConfigKeys)), configGoals);

    expect(first.goals).toHaveLength(1);
    expect(first.changed).toBe(true);
    expect(second.goals).toHaveLength(1);
    expect(second.changed).toBe(false);
  });

  it("does not re-create practices from v2 empty practice lists", () => {
    const parsed = parseStoredGoals(
      JSON.stringify({
        version: 2,
        goals: [
          {
            id: "goal-1",
            name: "Read",
            target: 100,
            start: "2026-05-13",
            end: "2026-05-14",
            daily: [0, 0],
          },
        ],
        practices: [],
      })
    );

    expect(parsed.practices).toEqual([]);
  });

  it("persists missing seed markers for already-saved config goals", () => {
    const configGoals = [
      {
        id: "seed-1",
        name: "Read",
        target: 100,
        start: "2026-05-13",
        end: "2026-05-14",
      },
    ];
    const envelopeWithoutSeedMarker = parseStoredGoals(serializeStorage(configGoals, []));
    const result = applyConfigSeeds(envelopeWithoutSeedMarker, configGoals);

    expect(result.goals).toHaveLength(1);
    expect(result.seededConfigKeys).toHaveLength(1);
    expect(result.changed).toBe(true);
  });
});

describe("practice helpers", () => {
  it("normalizes numeric and checkbox practices", () => {
    const practice = normalizePractice({
      id: "practice-1",
      name: "Stretch",
      mode: "checkbox",
      targetPerDay: 0,
      goalIds: ["goal-1", "goal-1", ""],
      entries: {
        "2026-05-13": 3,
        bad: 2,
        "2026-05-14": -1,
      },
    });

    expect(practice.targetPerDay).toBe(1);
    expect(practice.goalIds).toEqual(["goal-1"]);
    expect(practice.entries).toEqual({ "2026-05-13": 1, "2026-05-14": 0 });
  });

  it("calculates practice values and colors by mode", () => {
    const numeric = normalizePractice({
      mode: "number",
      targetPerDay: 10,
      entries: {
        "2026-05-13": 0,
        "2026-05-14": 5,
        "2026-05-15": 10,
      },
    });
    const checkbox = normalizePractice({
      mode: "checkbox",
      entries: {
        "2026-05-13": 1,
      },
    });
    const now = new Date("2026-05-15T00:00:00Z");

    expect(getPracticeValueForDate(numeric, "2026-05-14")).toBe(5);
    expect(getPracticeDayColor(numeric, "2026-05-13", now)).toBe("#e74c3c");
    expect(getPracticeDayColor(numeric, "2026-05-14", now)).toBe("#f1c40f");
    expect(getPracticeDayColor(numeric, "2026-05-15", now)).toBe("#2ecc71");
    expect(getPracticeDayColor(numeric, "2026-05-16", now)).toBe("#eee");
    expect(getPracticeDayColor(checkbox, "2026-05-13", now)).toBe("#2ecc71");
  });
});
