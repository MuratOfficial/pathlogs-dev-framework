import { describe, expect, it } from "vitest";
import {
  activityStreaks,
  buildHeatmap,
  isoDay,
  levelOf,
  quantileThresholds,
  trailingRange,
  yearRange,
} from "@toimetdev/pathlogs-core";

describe("quantileThresholds", () => {
  it("пороги не убывают", () => {
    const t = quantileThresholds([1, 2, 3, 4, 5, 6, 7, 8], 4);
    for (let i = 1; i < t.length; i += 1) expect(t[i]!).toBeGreaterThanOrEqual(t[i - 1]!);
  });

  it("пустые данные дают недостижимые пороги", () => {
    const t = quantileThresholds([0, 0, 0], 4);
    expect(t.every((v) => v === Infinity)).toBe(true);
  });

  it("один выброс не сплющивает шкалу", () => {
    // много единиц и один гигант — верхний порог не должен стать равным гиганту
    const values = [...Array(20).fill(1), 500];
    const t = quantileThresholds(values, 4);
    expect(t[3]).toBeLessThan(500);
  });
});

describe("levelOf", () => {
  const thresholds = [1, 5, 10, 20];

  it("ноль — нулевой уровень", () => {
    expect(levelOf(0, thresholds)).toBe(0);
  });

  it("ненулевое ниже первого порога всё равно уровень 1", () => {
    expect(levelOf(0.5, thresholds)).toBe(1);
  });

  it("растёт по порогам", () => {
    expect(levelOf(5, thresholds)).toBe(2);
    expect(levelOf(25, thresholds)).toBe(4);
  });
});

describe("buildHeatmap", () => {
  const range = { from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) };

  it("сетка начинается с полной недели", () => {
    const grid = buildHeatmap({}, { ...range, weekStart: 1 });
    expect(grid.weeks[0]).toHaveLength(7);
    // первый день сетки — понедельник
    expect(grid.weeks[0]![0]!.date.getDay()).toBe(1);
  });

  it("клетки вне интервала помечены и не окрашены", () => {
    const grid = buildHeatmap({}, range);
    const lead = grid.weeks[0]!.filter((c) => !c.inRange);
    expect(lead.length).toBeGreaterThan(0);
    expect(lead.every((c) => c.level === 0)).toBe(true);
  });

  it("считает сумму и активные дни", () => {
    const values = { "2026-01-05": 3, "2026-01-06": 7, "2026-02-01": 1 };
    const grid = buildHeatmap(values, range);
    expect(grid.total).toBe(11);
    expect(grid.activeDays).toBe(3);
    expect(grid.max).toBe(7);
  });

  it("подписи месяцев не повторяются подряд", () => {
    const grid = buildHeatmap({}, range);
    const labels = grid.months.map((m) => m.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("activityStreaks", () => {
  it("считает самую длинную серию активных дней", () => {
    const range = trailingRange(new Date(2026, 1, 14), 10);
    const values: Record<string, number> = {};
    // три подряд активных дня
    values[isoDay(new Date(2026, 1, 10))] = 1;
    values[isoDay(new Date(2026, 1, 11))] = 1;
    values[isoDay(new Date(2026, 1, 12))] = 1;
    const grid = buildHeatmap(values, range);
    expect(activityStreaks(grid).longest).toBe(3);
  });
});

describe("trailingRange / yearRange / isoDay", () => {
  it("trailingRange включает сегодня", () => {
    const now = new Date(2026, 1, 14);
    const r = trailingRange(now, 7);
    expect(isoDay(r.to)).toBe("2026-02-14");
    expect(isoDay(r.from)).toBe("2026-02-08");
  });

  it("yearRange охватывает весь год", () => {
    const r = yearRange(2026);
    expect(isoDay(r.from)).toBe("2026-01-01");
    expect(isoDay(r.to)).toBe("2026-12-31");
  });

  it("isoDay собирает дату из локальных частей", () => {
    expect(isoDay(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
