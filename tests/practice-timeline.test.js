import { describe, expect, it } from "vitest";
import { normalizePractice } from "../src/goal-utils.js";
import {
  createPracticeTimeline,
  formatPracticeBlockSummary,
  getPracticeBlockAppearance,
  getTimelineBlockHeight,
  getTimelineExpansionGroups,
  splitTimelineRange,
} from "../src/practice-timeline.js";

describe("practice timeline ranges", () => {
  it("splits ranges on calendar boundaries while clipping the goal edges", () => {
    expect(splitTimelineRange("2026-05-27", "2026-06-03", "week")).toEqual([
      expect.objectContaining({ unit: "week", start: "2026-05-27", end: "2026-05-31", days: 5 }),
      expect.objectContaining({ unit: "week", start: "2026-06-01", end: "2026-06-03", days: 3 }),
    ]);

    expect(splitTimelineRange("2026-11-15", "2027-02-10", "year")).toEqual([
      expect.objectContaining({ unit: "year", start: "2026-11-15", end: "2026-12-31" }),
      expect.objectContaining({ unit: "year", start: "2027-01-01", end: "2027-02-10" }),
    ]);
  });
});

describe("adaptive practice timeline", () => {
  it("renders all days when they satisfy the minimum-width capacity", () => {
    const timeline = createPracticeTimeline({
      start: "2026-05-01",
      end: "2026-05-31",
      availableWidth: 1000,
      nowValue: new Date("2026-05-13T00:00:00Z"),
    });

    expect(timeline.baseUnit).toBe("day");
    expect(timeline.largestUnit).toBe("day");
    expect(timeline.blocks).toHaveLength(31);
    expect(timeline.blocks.every((block) => block.unit === "day")).toBe(true);
  });

  it("condenses a long range and expands today's path through days", () => {
    const timeline = createPracticeTimeline({
      start: "2026-01-01",
      end: "2026-12-31",
      availableWidth: 300,
      nowValue: new Date("2026-05-13T00:00:00Z"),
    });

    expect(timeline.baseUnit).toBe("month");
    expect(timeline.largestUnit).toBe("month");
    expect(timeline.blocks.some((block) => block.unit === "month")).toBe(true);
    expect(timeline.blocks.some((block) => block.unit === "week")).toBe(true);
    expect(timeline.blocks.filter((block) => block.unit === "day")).toHaveLength(7);
    expect(timeline.expandedBlocks).toEqual([
      expect.objectContaining({ unit: "month", start: "2026-05-01", end: "2026-05-31" }),
      expect.objectContaining({ unit: "week", start: "2026-05-11", end: "2026-05-17" }),
    ]);
    expect(timeline.blocks.find((block) => block.current)).toEqual(
      expect.objectContaining({ unit: "day", start: "2026-05-13", selected: true })
    );
    const groups = getTimelineExpansionGroups(timeline);
    const weekGroup = groups.find((group) => group.block.unit === "week");
    expect(weekGroup).toEqual(expect.objectContaining({ columnSpan: 7, height: 25 }));
    expect(
      timeline.blocks
        .slice(weekGroup.columnStart - 1, weekGroup.columnStart - 1 + weekGroup.columnSpan)
        .every((block) => block.unit === "day")
    ).toBe(true);
  });

  it("moves the one open path and expands only one level for a clicked aggregate", () => {
    const timeline = createPracticeTimeline({
      start: "2026-01-01",
      end: "2026-12-31",
      availableWidth: 300,
      selection: { focusDate: "2026-08-01", deepestUnit: "week" },
      nowValue: new Date("2026-05-13T00:00:00Z"),
    });

    expect(timeline.blocks.filter((block) => block.unit === "day")).toHaveLength(0);
    expect(timeline.blocks.filter((block) => block.unit === "week").length).toBeGreaterThan(3);
    expect(timeline.expandedBlocks).toEqual([
      expect.objectContaining({ unit: "month", start: "2026-08-01", end: "2026-08-31" }),
    ]);
    expect(timeline.blocks.find((block) => block.selected)).toEqual(
      expect.objectContaining({ unit: "week", start: "2026-08-01" })
    );
    expect(timeline.blocks.some((block) => block.unit === "month" && block.start === "2026-05-01")).toBe(true);
  });

  it("uses the nearest goal boundary when today is outside the range", () => {
    const timeline = createPracticeTimeline({
      start: "2026-05-01",
      end: "2026-05-31",
      availableWidth: 150,
      nowValue: new Date("2027-01-01T00:00:00Z"),
    });

    expect(timeline.focusDate).toBe("2026-05-31");
    expect(timeline.blocks.find((block) => block.selected)).toEqual(
      expect.objectContaining({ unit: "day", start: "2026-05-31" })
    );
  });

  it("opens the current year, month, and week through today's day by default", () => {
    const timeline = createPracticeTimeline({
      start: "2020-01-01",
      end: "2030-12-31",
      availableWidth: 500,
      nowValue: new Date("2026-07-30T00:00:00Z"),
    });

    expect(timeline.baseUnit).toBe("year");
    expect(timeline.deepestUnit).toBe("day");
    expect(timeline.expandedBlocks.map((block) => block.unit)).toEqual(["year", "month", "week"]);
    expect(timeline.blocks.find((block) => block.current)).toEqual(
      expect.objectContaining({ unit: "day", start: "2026-07-30" })
    );
    expect(getTimelineExpansionGroups(timeline).map((group) => group.block.unit)).toEqual([
      "year",
      "month",
      "week",
    ]);
  });
});

describe("practice timeline block heights", () => {
  it("steps finer units down from the largest visible unit", () => {
    expect(getTimelineBlockHeight("year", "year")).toBe(24);
    expect(getTimelineBlockHeight("month", "year")).toBe(20);
    expect(getTimelineBlockHeight("week", "year")).toBe(16);
    expect(getTimelineBlockHeight("day", "year")).toBe(12);
  });

  it("gives the largest unit full height even in an all-day view", () => {
    expect(getTimelineBlockHeight("day", "day")).toBe(24);
    expect(getTimelineBlockHeight("day", "month")).toBe(16);
  });
});

describe("aggregate practice appearance", () => {
  it("synthesizes daily states into proportional color bands and a summary", () => {
    const practice = normalizePractice({
      mode: "number",
      targetPerDay: 10,
      entries: {
        "2026-05-10": 10,
        "2026-05-11": 5,
      },
    });
    const block = {
      unit: "week",
      start: "2026-05-10",
      end: "2026-05-13",
    };
    const appearance = getPracticeBlockAppearance(
      practice,
      block,
      new Date("2026-05-12T00:00:00Z")
    );

    expect(appearance.counts).toEqual({
      complete: 1,
      partial: 1,
      missed: 1,
      future: 1,
    });
    expect(appearance.background).toContain("linear-gradient");
    expect(appearance.background).toContain("#2ecc71 25.00%");
    expect(appearance.background).toContain("#eee 100.00%");
    expect(formatPracticeBlockSummary(block, appearance.counts)).toContain(
      "1 complete · 1 partial · 1 missed · 1 future"
    );
  });
});
