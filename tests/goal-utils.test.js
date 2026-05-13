import { describe, expect, it } from "vitest";
import {
  applyConfigSeeds,
  countDaysBetween,
  getExpectedProgressPercent,
  getProgressPercent,
  normalizeGoal,
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
        },
      ])
    );

    expect(parsed.needsSave).toBe(true);
    expect(parsed.goals).toHaveLength(1);
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
