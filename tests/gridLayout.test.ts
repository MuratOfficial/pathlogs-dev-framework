import { describe, expect, it } from "vitest";
import {
  bottomRow,
  cellToPixel,
  clampToColumns,
  collides,
  compact,
  findFreeSpot,
  gridHeight,
  moveItem,
  pixelToCell,
  resizeItem,
  type GridItem,
} from "../registry/widgets/dashboard-grid/gridLayout";

function item(id: string, x: number, y: number, w = 1, h = 1, over: Partial<GridItem> = {}): GridItem {
  return { id, x, y, w, h, ...over };
}

describe("collides", () => {
  it("пересекающиеся плитки", () => {
    expect(collides(item("a", 0, 0, 2, 2), item("b", 1, 1, 2, 2))).toBe(true);
  });

  it("соседние без перекрытия", () => {
    expect(collides(item("a", 0, 0, 2, 2), item("b", 2, 0, 2, 2))).toBe(false);
  });

  it("плитка не сталкивается сама с собой", () => {
    const a = item("a", 0, 0, 2, 2);
    expect(collides(a, a)).toBe(false);
  });
});

describe("clampToColumns", () => {
  it("удерживает плитку в пределах колонок", () => {
    expect(clampToColumns(item("a", 10, 0, 2), 6)).toMatchObject({ x: 4, w: 2 });
  });

  it("слишком широкая плитка ужимается", () => {
    expect(clampToColumns(item("a", 0, 0, 10), 6).w).toBe(6);
  });
});

describe("compact", () => {
  it("осаживает плитки вверх, убирая пустоты", () => {
    const items = [item("a", 0, 0), item("b", 0, 5)];
    const packed = compact(items);
    expect(packed.find((i) => i.id === "b")!.y).toBe(1);
  });

  it("статическую плитку не двигает", () => {
    const items = [item("a", 0, 3, 1, 1, { static: true })];
    expect(compact(items)[0]!.y).toBe(3);
  });

  it("не накладывает плитки друг на друга", () => {
    const items = [item("a", 0, 0), item("b", 0, 1), item("c", 0, 2)];
    const packed = compact(items);
    for (let i = 0; i < packed.length; i += 1) {
      for (let j = i + 1; j < packed.length; j += 1) {
        expect(collides(packed[i]!, packed[j]!)).toBe(false);
      }
    }
  });
});

describe("moveItem", () => {
  it("двигает плитку и расталкивает занявших место", () => {
    const items = [item("a", 0, 0, 2, 1), item("b", 0, 1, 2, 1)];
    const next = moveItem(items, "b", { x: 0, y: 0 }, 6);
    // b встаёт наверх, a уступает
    expect(next.find((i) => i.id === "b")!.y).toBe(0);
    const a = next.find((i) => i.id === "a")!;
    const b = next.find((i) => i.id === "b")!;
    expect(collides(a, b)).toBe(false);
  });

  it("статическую плитку не двигает", () => {
    const items = [item("a", 0, 0, 1, 1, { static: true })];
    expect(moveItem(items, "a", { x: 3, y: 3 }, 6)).toBe(items);
  });

  it("после перемещения плитки не накладываются", () => {
    const items = [item("a", 0, 0, 3, 2), item("b", 3, 0, 3, 2), item("c", 0, 2, 3, 2)];
    const next = moveItem(items, "c", { x: 1, y: 0 }, 6);
    for (let i = 0; i < next.length; i += 1)
      for (let j = i + 1; j < next.length; j += 1) expect(collides(next[i]!, next[j]!)).toBe(false);
  });
});

describe("findFreeSpot / bottomRow", () => {
  it("находит первое свободное место", () => {
    const items = [item("a", 0, 0, 6, 1)];
    expect(findFreeSpot(items, 2, 1, 6)).toEqual({ x: 0, y: 1 });
  });

  it("bottomRow — первая строка под всеми", () => {
    expect(bottomRow([item("a", 0, 0, 1, 2), item("b", 1, 1, 1, 2)])).toBe(3);
  });
});

describe("resizeItem", () => {
  it("увеличение расталкивает соседей", () => {
    const items = [item("a", 0, 0, 2, 1), item("b", 0, 1, 2, 1)];
    const next = resizeItem(items, "a", { w: 2, h: 3 }, 6);
    const a = next.find((i) => i.id === "a")!;
    const b = next.find((i) => i.id === "b")!;
    expect(a.h).toBe(3);
    expect(collides(a, b)).toBe(false);
  });

  it("минимальный размер — одна клетка", () => {
    const next = resizeItem([item("a", 0, 0, 2, 2)], "a", { w: 0, h: 0 }, 6);
    expect(next[0]).toMatchObject({ w: 1, h: 1 });
  });
});

describe("pixelToCell / cellToPixel / gridHeight", () => {
  it("округляет пиксели к ближайшей клетке", () => {
    // cell 100 + gap 10 = 110; 130px ближе к клетке 1
    expect(pixelToCell(130, 0, 100, 100, 10)).toEqual({ x: 1, y: 0 });
  });

  it("cellToPixel учитывает зазоры внутри многоклеточной плитки", () => {
    const box = cellToPixel(item("a", 1, 0, 2, 1), 100, 100, 10);
    expect(box.left).toBe(110);
    expect(box.width).toBe(210); // 2*100 + 1*10
  });

  it("gridHeight считает полную высоту", () => {
    expect(gridHeight([item("a", 0, 0, 1, 2)], 100, 10)).toBe(210);
  });
});
