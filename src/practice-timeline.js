import {
  PRACTICE_DAY_COLORS,
  addDaysIso,
  countDaysBetween,
  getPracticeDayStatus,
  parseDate,
  toIsoDate,
} from "./goal-utils.js";

export const PRACTICE_BLOCK_MIN_WIDTH = 10;
export const PRACTICE_BLOCK_GAP = 3;
export const PRACTICE_BLOCK_MAX_HEIGHT = 24;
export const PRACTICE_BLOCK_MIN_HEIGHT = 12;
export const PRACTICE_BLOCK_HEIGHT_STEP = 4;
export const PRACTICE_EXPANSION_GROUP_PADDING = 3;
export const PRACTICE_TIMELINE_UNITS = ["day", "week", "month", "year"];

const UNIT_RANK = Object.fromEntries(PRACTICE_TIMELINE_UNITS.map((unit, index) => [unit, index]));
const STATUS_ORDER = ["complete", "partial", "missed", "future"];
const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function clampDateToRange(dateKey, start, end) {
  if (!dateKey || dateKey < start) return start;
  if (dateKey > end) return end;
  return dateKey;
}

function periodBounds(dateKey, unit) {
  const date = parseDate(dateKey);
  if (!date) return null;

  if (unit === "day") return { start: dateKey, end: dateKey };

  if (unit === "week") {
    const dayFromMonday = (date.getUTCDay() + 6) % 7;
    const start = new Date(date);
    start.setUTCDate(start.getUTCDate() - dayFromMonday);
    return {
      start: toIsoDate(start),
      end: addDaysIso(toIsoDate(start), 6),
    };
  }

  if (unit === "month") {
    return {
      start: toIsoDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))),
      end: toIsoDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))),
    };
  }

  return {
    start: `${date.getUTCFullYear()}-01-01`,
    end: `${date.getUTCFullYear()}-12-31`,
  };
}

function createBlock(unit, start, end) {
  return {
    unit,
    start,
    end,
    key: `${unit}:${start}:${end}`,
    days: countDaysBetween(start, end),
  };
}

export function splitTimelineRange(start, end, unit) {
  if (
    !parseDate(start) ||
    !parseDate(end) ||
    end < start ||
    !Object.prototype.hasOwnProperty.call(UNIT_RANK, unit)
  ) {
    return [];
  }

  const blocks = [];
  let cursor = start;
  while (cursor && cursor <= end) {
    const bounds = periodBounds(cursor, unit);
    if (!bounds) break;
    const blockEnd = bounds.end < end ? bounds.end : end;
    blocks.push(createBlock(unit, cursor, blockEnd));
    cursor = addDaysIso(blockEnd, 1);
  }
  return blocks;
}

export function getNextFinerTimelineUnit(unit) {
  const rank = UNIT_RANK[unit];
  return rank > 0 ? PRACTICE_TIMELINE_UNITS[rank - 1] : null;
}

export function getTimelineBlockHeight(unit, largestUnit) {
  const unitRank = UNIT_RANK[unit] ?? 0;
  const largestRank = UNIT_RANK[largestUnit] ?? unitRank;
  const rankDifference = Math.max(0, largestRank - unitRank);
  return Math.max(
    PRACTICE_BLOCK_MIN_HEIGHT,
    PRACTICE_BLOCK_MAX_HEIGHT - rankDifference * PRACTICE_BLOCK_HEIGHT_STEP
  );
}

function buildVisibleBlocks(start, end, baseUnit, focusDate, deepestUnit) {
  const deepestRank = UNIT_RANK[deepestUnit] ?? 0;
  const expandedBlocks = [];

  const expand = (block) => {
    const containsFocus = block.start <= focusDate && focusDate <= block.end;
    const finerUnit = getNextFinerTimelineUnit(block.unit);
    if (!containsFocus || !finerUnit || UNIT_RANK[block.unit] <= deepestRank) {
      return [{ ...block, selected: containsFocus }];
    }

    expandedBlocks.push(block);
    return splitTimelineRange(block.start, block.end, finerUnit).flatMap(expand);
  };

  return {
    blocks: splitTimelineRange(start, end, baseUnit).flatMap(expand),
    expandedBlocks,
  };
}

export function getTimelineExpansionGroups(timeline) {
  const blocks = Array.isArray(timeline?.blocks) ? timeline.blocks : [];
  const expandedBlocks = Array.isArray(timeline?.expandedBlocks) ? timeline.expandedBlocks : [];
  if (!blocks.length || !expandedBlocks.length) return [];

  return expandedBlocks.map((expandedBlock, depth) => {
    const startIndex = blocks.findIndex(
      (block) => block.start >= expandedBlock.start && block.end <= expandedBlock.end
    );
    let endIndex = startIndex;
    while (
      endIndex + 1 < blocks.length &&
      blocks[endIndex + 1].start >= expandedBlock.start &&
      blocks[endIndex + 1].end <= expandedBlock.end
    ) {
      endIndex += 1;
    }

    const descendants = startIndex >= 0 ? blocks.slice(startIndex, endIndex + 1) : [];
    const tallestDescendant = descendants.reduce(
      (height, block) => Math.max(height, getTimelineBlockHeight(block.unit, timeline.largestUnit)),
      0
    );

    return {
      key: `expanded:${expandedBlock.key}`,
      block: expandedBlock,
      depth,
      columnStart: startIndex + 1,
      columnSpan: descendants.length,
      height: tallestDescendant + PRACTICE_EXPANSION_GROUP_PADDING * 3,
    };
  }).filter((group) => group.columnStart > 0 && group.columnSpan > 0);
}

function chooseBaseUnit(start, end, focusDate, capacity) {
  for (const unit of PRACTICE_TIMELINE_UNITS) {
    const fullyExpanded = buildVisibleBlocks(start, end, unit, focusDate, "day").blocks;
    if (fullyExpanded.length <= capacity) return unit;
  }
  return "year";
}

export function createPracticeTimeline({
  start,
  end,
  availableWidth = 600,
  minBlockWidth = PRACTICE_BLOCK_MIN_WIDTH,
  gap = PRACTICE_BLOCK_GAP,
  selection,
  nowValue = new Date(),
} = {}) {
  if (!parseDate(start) || !parseDate(end) || end < start) {
    return {
      baseUnit: "day",
      capacity: 0,
      focusDate: "",
      deepestUnit: "day",
      largestUnit: "day",
      blocks: [],
      expandedBlocks: [],
    };
  }

  const safeWidth = Number.isFinite(availableWidth) && availableWidth > 0 ? availableWidth : 600;
  const safeMinimum = Number.isFinite(minBlockWidth) && minBlockWidth > 0
    ? minBlockWidth
    : PRACTICE_BLOCK_MIN_WIDTH;
  const safeGap = Number.isFinite(gap) && gap >= 0 ? gap : PRACTICE_BLOCK_GAP;
  const capacity = Math.max(1, Math.floor((safeWidth + safeGap) / (safeMinimum + safeGap)));
  const currentDate = toIsoDate(nowValue);
  const focusDate = clampDateToRange(selection?.focusDate || currentDate, start, end);
  const baseUnit = chooseBaseUnit(start, end, focusDate, capacity);
  const requestedDeepestUnit = PRACTICE_TIMELINE_UNITS.includes(selection?.deepestUnit)
    ? selection.deepestUnit
    : "day";
  const deepestUnit = UNIT_RANK[requestedDeepestUnit] < UNIT_RANK[baseUnit]
    ? requestedDeepestUnit
    : baseUnit;
  const visibleTimeline = buildVisibleBlocks(start, end, baseUnit, focusDate, deepestUnit);
  const blocks = visibleTimeline.blocks.map((block) => ({
    ...block,
    current: block.start <= currentDate && currentDate <= block.end,
  }));
  const largestUnit = blocks.reduce(
    (largest, block) => UNIT_RANK[block.unit] > UNIT_RANK[largest] ? block.unit : largest,
    "day"
  );

  return {
    baseUnit,
    capacity,
    focusDate,
    deepestUnit,
    largestUnit,
    blocks,
    expandedBlocks: visibleTimeline.expandedBlocks,
  };
}

export function getPracticeBlockAppearance(practice, block, nowValue = new Date()) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  const total = countDaysBetween(block?.start, block?.end);

  for (let index = 0; index < total; index += 1) {
    const status = getPracticeDayStatus(practice, addDaysIso(block.start, index), nowValue);
    counts[status] += 1;
  }

  const populated = STATUS_ORDER.filter((status) => counts[status] > 0);
  if (populated.length <= 1) {
    return {
      counts,
      background: PRACTICE_DAY_COLORS[populated[0] || "future"],
    };
  }

  let consumed = 0;
  const stops = [];
  for (const status of populated) {
    const startPercent = (consumed / total) * 100;
    consumed += counts[status];
    const endPercent = (consumed / total) * 100;
    stops.push(
      `${PRACTICE_DAY_COLORS[status]} ${startPercent.toFixed(2)}%`,
      `${PRACTICE_DAY_COLORS[status]} ${endPercent.toFixed(2)}%`
    );
  }

  return {
    counts,
    background: `linear-gradient(to right, ${stops.join(", ")})`,
  };
}

export function formatPracticeBlockLabel(block) {
  if (!block) return "";
  if (block.unit === "day") return block.start;
  if (block.unit === "month") return MONTH_FORMATTER.format(parseDate(block.start));
  if (block.unit === "year") return block.start.slice(0, 4);
  return `${DATE_FORMATTER.format(parseDate(block.start))} – ${DATE_FORMATTER.format(parseDate(block.end))}`;
}

export function formatPracticeBlockSummary(block, counts) {
  const details = STATUS_ORDER
    .filter((status) => counts?.[status])
    .map((status) => `${counts[status]} ${status}`)
    .join(" · ");
  const range = block.start === block.end ? block.start : `${block.start} – ${block.end}`;
  const label = formatPracticeBlockLabel(block);
  return block.unit === "week" || label === range
    ? `${label}: ${details}`
    : `${label} (${range}): ${details}`;
}
