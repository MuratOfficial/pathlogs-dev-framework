import { describe, expect, it } from "vitest";
import {
  buildOffsets,
  indexAtOffset,
  isAtBottom,
  scrollOffsetFor,
  totalSize,
  virtualItems,
  virtualWindow,
} from "@toimetdev/pathlogs-hooks";

describe("buildOffsets", () => {
  it("строит префиксные суммы фиксированной высоты", () => {
    expect(buildOffsets(3, 10)).toEqual([0, 10, 20, 30]);
  });

  it("массив на один длиннее числа элементов — хвост равен полной высоте", () => {
    const offsets = buildOffsets(4, 25);
    expect(offsets).toHaveLength(5);
    expect(totalSize(offsets)).toBe(100);
  });

  it("поддерживает переменную высоту", () => {
    expect(buildOffsets(3, (i) => (i + 1) * 10)).toEqual([0, 10, 30, 60]);
  });

  it("отрицательная высота не двигает смещения назад", () => {
    expect(buildOffsets(2, () => -5)).toEqual([0, 0, 0]);
  });

  it("пустой список даёт единственный нулевой рубеж", () => {
    expect(buildOffsets(0, 10)).toEqual([0]);
  });
});

describe("indexAtOffset", () => {
  const offsets = buildOffsets(5, 20); // [0,20,40,60,80,100]

  it("находит элемент, накрывающий позицию", () => {
    expect(indexAtOffset(offsets, 0)).toBe(0);
    expect(indexAtOffset(offsets, 25)).toBe(1);
    expect(indexAtOffset(offsets, 59)).toBe(2);
  });

  it("на границе элемента возвращает следующий", () => {
    expect(indexAtOffset(offsets, 20)).toBe(1);
    expect(indexAtOffset(offsets, 40)).toBe(2);
  });

  it("за пределами держится последнего элемента", () => {
    expect(indexAtOffset(offsets, 100000)).toBe(4);
  });

  it("отрицательную позицию считает нулевой", () => {
    expect(indexAtOffset(offsets, -50)).toBe(0);
  });
});

describe("virtualWindow", () => {
  const offsets = buildOffsets(100, 20); // всего 2000

  it("рисует только видимое плюс запас", () => {
    const w = virtualWindow(offsets, 400, 200, 2);
    // видно 400..600 => элементы 20..30, минус/плюс overscan 2
    expect(w.start).toBe(18);
    expect(w.end).toBe(33);
    expect(w.totalSize).toBe(2000);
  });

  it("распорки совпадают со смещениями окна", () => {
    const w = virtualWindow(offsets, 400, 200, 2);
    expect(w.paddingStart).toBe(offsets[w.start]);
    expect(w.paddingEnd).toBe(2000 - offsets[w.end]!);
  });

  it("нулевой вьюпорт всё равно рисует запас, а не пустоту", () => {
    const w = virtualWindow(offsets, 0, 0, 3);
    expect(w.end).toBeGreaterThan(w.start);
  });

  it("отрицательная прокрутка не уводит окно за начало", () => {
    const w = virtualWindow(offsets, -500, 200, 2);
    expect(w.start).toBe(0);
  });

  it("пустой список — пустое окно", () => {
    const w = virtualWindow(buildOffsets(0, 20), 0, 200);
    expect(w).toMatchObject({ start: 0, end: 0, totalSize: 0 });
  });
});

describe("virtualItems", () => {
  it("отдаёт индексы, смещения и высоты окна", () => {
    const offsets = buildOffsets(10, 20);
    const items = virtualItems(offsets, virtualWindow(offsets, 0, 40, 0));
    expect(items[0]).toEqual({ index: 0, start: 0, size: 20 });
    expect(items.at(-1)!.index).toBeGreaterThan(0);
  });
});

describe("scrollOffsetFor", () => {
  const offsets = buildOffsets(20, 20); // всего 400

  it("align=start прижимает элемент к верху", () => {
    expect(scrollOffsetFor(offsets, 5, 100, 0, "start")).toBe(100);
  });

  it("align=end прижимает к низу вьюпорта", () => {
    expect(scrollOffsetFor(offsets, 5, 100, 0, "end")).toBe(20);
  });

  it("align=auto не двигает уже видимый элемент", () => {
    // элемент 3 (60..80) виден при прокрутке 40 и вьюпорте 100
    expect(scrollOffsetFor(offsets, 3, 100, 40, "auto")).toBe(40);
  });

  it("align=auto доводит элемент ниже вьюпорта до нижнего края", () => {
    expect(scrollOffsetFor(offsets, 8, 100, 0, "auto")).toBe(80);
  });

  it("не прокручивает дальше конца списка", () => {
    expect(scrollOffsetFor(offsets, 19, 100, 0, "start")).toBe(300);
  });
});

describe("isAtBottom", () => {
  it("у самого низа — true", () => {
    expect(isAtBottom(900, 1000, 100)).toBe(true);
  });

  it("в пределах порога — тоже true", () => {
    expect(isAtBottom(880, 1000, 100, 24)).toBe(true);
  });

  it("далеко от низа — false", () => {
    expect(isAtBottom(500, 1000, 100)).toBe(false);
  });
});
