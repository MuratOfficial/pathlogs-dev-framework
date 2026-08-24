import { describe, expect, it } from "vitest";
import {
  boundingBox,
  edgePath,
  fitView,
  hitTest,
  normalizeRect,
  portPoint,
  rectsInBox,
  screenToWorld,
  snapPoint,
  snapToGrid,
  topHit,
  worldToScreen,
  zoomAt,
  type Rect,
  type Viewport,
} from "../registry/widgets/flow-canvas/viewport";

const VIEW: Viewport = { x: 100, y: 50, scale: 2 };

describe("worldToScreen / screenToWorld", () => {
  it("прямое и обратное преобразование взаимно обратны", () => {
    const world = { x: 30, y: 40 };
    const screen = worldToScreen(world, VIEW);
    expect(screen).toEqual({ x: 160, y: 130 });
    expect(screenToWorld(screen, VIEW)).toEqual(world);
  });
});

describe("zoomAt", () => {
  it("точка под курсором остаётся на месте при зуме", () => {
    const cursor = { x: 300, y: 200 };
    const before = screenToWorld(cursor, VIEW);
    const zoomed = zoomAt(VIEW, cursor, 1.5);
    const after = screenToWorld(cursor, zoomed);
    expect(after.x).toBeCloseTo(before.x, 6);
    expect(after.y).toBeCloseTo(before.y, 6);
  });

  it("масштаб зажимается пределами", () => {
    const zoomed = zoomAt({ x: 0, y: 0, scale: 2.4 }, { x: 0, y: 0 }, 4, 0.2, 2.5);
    expect(zoomed.scale).toBe(2.5);
  });
});

describe("hitTest / topHit / rectsInBox", () => {
  const rects: (Rect & { id: string })[] = [
    { id: "a", x: 0, y: 0, width: 100, height: 100 },
    { id: "b", x: 50, y: 50, width: 100, height: 100 },
  ];

  it("точка внутри прямоугольника", () => {
    expect(hitTest(rects[0]!, { x: 10, y: 10 })).toBe(true);
    expect(hitTest(rects[0]!, { x: 200, y: 200 })).toBe(false);
  });

  it("верхний прямоугольник побеждает в перекрытии", () => {
    // точка (60,60) в обоих — b нарисован позже, значит он сверху
    expect(topHit(rects, { x: 60, y: 60 })!.id).toBe("b");
  });

  it("рамка выделения ловит пересекающиеся", () => {
    const box = { x: 40, y: 40, width: 20, height: 20 };
    expect(rectsInBox(rects, box).map((r) => r.id).sort()).toEqual(["a", "b"]);
  });
});

describe("normalizeRect / snap", () => {
  it("нормализует рамку из любых двух углов", () => {
    expect(normalizeRect({ x: 30, y: 40 }, { x: 10, y: 10 })).toEqual({
      x: 10,
      y: 10,
      width: 20,
      height: 30,
    });
  });

  it("привязка к сетке округляет к ближайшему узлу", () => {
    expect(snapToGrid(23, 10)).toBe(20);
    expect(snapToGrid(27, 10)).toBe(30);
  });

  it("нулевой шаг отключает привязку", () => {
    expect(snapToGrid(23, 0)).toBe(23);
    expect(snapPoint({ x: 23, y: 47 }, 0)).toEqual({ x: 23, y: 47 });
  });
});

describe("boundingBox / fitView", () => {
  const rects: Rect[] = [
    { x: 0, y: 0, width: 100, height: 100 },
    { x: 200, y: 100, width: 100, height: 100 },
  ];

  it("габарит охватывает всё", () => {
    expect(boundingBox(rects)).toEqual({ x: 0, y: 0, width: 300, height: 200 });
  });

  it("пустой набор — нет габарита", () => {
    expect(boundingBox([])).toBeNull();
  });

  it("fitView центрует содержимое в экране", () => {
    const view = fitView(boundingBox(rects), 600, 400, 0);
    // центр содержимого (150,100) попадает в центр экрана (300,200)
    const center = worldToScreen({ x: 150, y: 100 }, view);
    expect(center.x).toBeCloseTo(300, 3);
    expect(center.y).toBeCloseTo(200, 3);
  });

  it("пустое содержимое не двигает камеру", () => {
    expect(fitView(null, 600, 400)).toEqual({ x: 0, y: 0, scale: 1 });
  });
});

describe("portPoint / edgePath", () => {
  const rect: Rect = { x: 0, y: 0, width: 100, height: 40 };

  it("порты сидят на серединах краёв", () => {
    expect(portPoint(rect, "right")).toEqual({ x: 100, y: 20 });
    expect(portPoint(rect, "left")).toEqual({ x: 0, y: 20 });
    expect(portPoint(rect, "top")).toEqual({ x: 50, y: 0 });
  });

  it("путь связи — кривая между точками", () => {
    const d = edgePath({ x: 0, y: 0 }, { x: 100, y: 50 });
    expect(d.startsWith("M0 0")).toBe(true);
    expect(d).toContain("C");
  });
});
