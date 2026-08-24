import { describe, expect, it } from "vitest";
import { decimate, extentOf, sparklineGeometry, trend } from "@toimetdev/pathlogs-core";

describe("extentOf", () => {
  it("плоский ряд раздвигает шкалу, а не делит на ноль", () => {
    const e = extentOf([5, 5, 5]);
    expect(e.min).toBeLessThan(5);
    expect(e.max).toBeGreaterThan(5);
  });

  it("zeroBased включает ноль", () => {
    const e = extentOf([10, 20, 30], { zeroBased: true });
    expect(e.min).toBe(0);
  });

  it("пустой ряд даёт нейтральную шкалу", () => {
    expect(extentOf([])).toEqual({ min: 0, max: 1 });
  });
});

describe("sparklineGeometry", () => {
  it("одна точка встаёт по центру, без деления на ноль", () => {
    const g = sparklineGeometry([5], { width: 100, height: 20 });
    expect(g.points).toHaveLength(1);
    expect(g.points[0]!.x).toBeCloseTo(50, 0);
    expect(Number.isFinite(g.points[0]!.y)).toBe(true);
  });

  it("пустой ряд не роняет расчёт", () => {
    const g = sparklineGeometry([]);
    expect(g.points).toHaveLength(0);
    expect(g.line).toBe("");
  });

  it("минимум ряда ниже максимума по оси Y (ось перевёрнута)", () => {
    const g = sparklineGeometry([1, 10], { padding: 0, height: 100 });
    expect(g.lowest!.value).toBe(1);
    expect(g.highest!.value).toBe(10);
    // меньшее значение рисуется ниже (больший y)
    expect(g.lowest!.y).toBeGreaterThan(g.highest!.y);
  });

  it("линия начинается с M и содержит все точки", () => {
    const g = sparklineGeometry([1, 2, 3, 4]);
    expect(g.line.startsWith("M")).toBe(true);
    expect(g.points).toHaveLength(4);
  });

  it("заливка замыкается к полу", () => {
    const g = sparklineGeometry([1, 2, 3]);
    expect(g.area.endsWith("Z")).toBe(true);
  });

  it("значения зажимаются в заданную шкалу", () => {
    const g = sparklineGeometry([100], { min: 0, max: 10, height: 100, padding: 0 });
    // 100 при max 10 не выскакивает за пределы поля
    expect(g.points[0]!.y).toBeGreaterThanOrEqual(0);
  });
});

describe("decimate", () => {
  it("короткий ряд возвращается как есть", () => {
    expect(decimate([1, 2, 3], 10)).toEqual([1, 2, 3]);
  });

  it("длинный ряд сжимается до предела", () => {
    const values = Array.from({ length: 1000 }, (_, i) => i);
    const out = decimate(values, 50);
    expect(out.length).toBeLessThanOrEqual(50);
  });

  it("сохраняет выброс, а не усредняет его", () => {
    const values = Array.from({ length: 100 }, () => 1);
    values[50] = 999;
    const out = decimate(values, 20);
    expect(out).toContain(999);
  });

  it("первое и последнее значение остаются на месте", () => {
    const values = Array.from({ length: 100 }, (_, i) => i);
    const out = decimate(values, 20);
    expect(out[0]).toBe(0);
    expect(out.at(-1)).toBe(99);
  });
});

describe("trend", () => {
  it("рост даёт положительную долю", () => {
    expect(trend([100, 150])).toBeCloseTo(0.5);
  });

  it("падение — отрицательную", () => {
    expect(trend([100, 50])).toBeCloseTo(-0.5);
  });

  it("нулевое начало не даёт бесконечность", () => {
    expect(trend([0, 10])).toBeNull();
  });

  it("меньше двух точек — null", () => {
    expect(trend([5])).toBeNull();
  });
});
