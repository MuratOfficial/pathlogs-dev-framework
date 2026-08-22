import { describe, expect, it } from "vitest";
import {
  DRAG_THRESHOLD,
  MAX_VELOCITY,
  MIN_VELOCITY,
  decayVelocity,
  edgeScrollSpeed,
  flingVelocity,
  hiddenEdges,
  isDragIntent,
  keyboardScroll,
} from "@pathlogs/hooks";

describe("isDragIntent", () => {
  it("не считает мелкий сдвиг протяжкой", () => {
    // Иначе дрожание руки при клике по карточке ломало бы сам клик
    expect(isDragIntent(2, 0, "x")).toBe(false);
  });

  it("считает протяжкой сдвиг от порога", () => {
    expect(isDragIntent(DRAG_THRESHOLD, 0, "x")).toBe(true);
  });

  it("на горизонтальной оси игнорирует вертикальный сдвиг", () => {
    expect(isDragIntent(0, 100, "x")).toBe(false);
  });

  it("на обеих осях смотрит на общую дистанцию", () => {
    expect(isDragIntent(4, 4, "both")).toBe(true);
    expect(isDragIntent(4, 4, "x")).toBe(false);
  });
});

describe("flingVelocity", () => {
  it("считает скорость по последним точкам трека", () => {
    const { vx } = flingVelocity(
      [
        { t: 0, x: 0, y: 0 },
        { t: 50, x: 100, y: 0 },
      ],
      50
    );
    expect(vx).toBeCloseTo(2);
  });

  it("гасит бросок, если перед отпусканием была пауза", () => {
    // «Довёл и подержал» — это не бросок: лента должна остаться на месте
    const { vx, vy } = flingVelocity([{ t: 0, x: 0, y: 0 }], 500);
    expect(vx).toBe(0);
    expect(vy).toBe(0);
  });

  it("ограничивает выброс на рывке", () => {
    const { vx } = flingVelocity(
      [
        { t: 0, x: 0, y: 0 },
        { t: 1, x: 10_000, y: 0 },
      ],
      1
    );
    expect(vx).toBeLessThanOrEqual(MAX_VELOCITY);
  });

  it("на пустом треке даёт ноль", () => {
    expect(flingVelocity([], 0)).toEqual({ vx: 0, vy: 0 });
  });
});

describe("decayVelocity", () => {
  it("уменьшает скорость со временем", () => {
    expect(Math.abs(decayVelocity(1, 16.7))).toBeLessThan(1);
  });

  it("обнуляет скорость у порога", () => {
    // Иначе лента ползла бы бесконечно на неразличимой глазом скорости
    expect(decayVelocity(MIN_VELOCITY / 2, 16.7)).toBe(0);
  });

  it("сохраняет направление", () => {
    expect(decayVelocity(-1, 16.7)).toBeLessThan(0);
  });
});

describe("edgeScrollSpeed", () => {
  it("в середине ленты не крутит", () => {
    expect(edgeScrollSpeed(500, 0, 1000)).toBe(0);
  });

  it("у начала крутит назад, у конца — вперёд", () => {
    expect(edgeScrollSpeed(5, 0, 1000)).toBeLessThan(0);
    expect(edgeScrollSpeed(995, 0, 1000)).toBeGreaterThan(0);
  });

  it("разгоняется по мере приближения к краю", () => {
    const near = Math.abs(edgeScrollSpeed(5, 0, 1000));
    const far = Math.abs(edgeScrollSpeed(60, 0, 1000));
    expect(near).toBeGreaterThan(far);
  });

  it("у узкой ленты оставляет нейтральную середину", () => {
    // Зона ужимается до трети: иначе узкая лента крутилась бы всегда
    expect(edgeScrollSpeed(30, 0, 60)).toBe(0);
  });

  it("на ленте нулевой ширины не крутит", () => {
    expect(edgeScrollSpeed(0, 0, 0)).toBe(0);
  });
});

describe("hiddenEdges", () => {
  it("ничего не прячет, когда прокручивать нечего", () => {
    expect(hiddenEdges(0, 0)).toBe("");
  });

  it("в начале прячет только конец", () => {
    expect(hiddenEdges(0, 500)).toBe("end");
  });

  it("в конце прячет только начало", () => {
    expect(hiddenEdges(500, 500)).toBe("start");
  });

  it("в середине прячет оба края", () => {
    expect(hiddenEdges(250, 500)).toBe("both");
  });

  it("допускает дробную прокрутку у самого края", () => {
    // Без допуска подсказка мигала бы на дробных значениях scrollLeft
    expect(hiddenEdges(0.5, 500)).toBe("end");
    expect(hiddenEdges(499.5, 500)).toBe("start");
  });
});

describe("keyboardScroll", () => {
  it("на горизонтальной ленте двигает стрелками влево-вправо", () => {
    expect(keyboardScroll("ArrowRight", 800, "x")?.dx).toBeGreaterThan(0);
    expect(keyboardScroll("ArrowLeft", 800, "x")?.dx).toBeLessThan(0);
  });

  it("не перехватывает клавиши поперёк оси", () => {
    // Стрелка вниз на горизонтальной ленте принадлежит странице
    expect(keyboardScroll("ArrowDown", 800, "x")).toBeNull();
    expect(keyboardScroll("ArrowRight", 800, "y")).toBeNull();
  });

  it("Page двигает почти на экран", () => {
    const step = keyboardScroll("ArrowRight", 800, "x")!.dx;
    const page = keyboardScroll("PageDown", 800, "x")!.dx;
    expect(page).toBeGreaterThan(step);
  });

  it("Home и End прыгают к краям на любой оси", () => {
    expect(keyboardScroll("Home", 800, "x")?.jump).toBe("start");
    expect(keyboardScroll("End", 800, "y")?.jump).toBe("end");
  });

  it("шаг стрелок не выходит за границы", () => {
    const tiny = keyboardScroll("ArrowRight", 10, "x")!.dx;
    const huge = keyboardScroll("ArrowRight", 100_000, "x")!.dx;
    expect(tiny).toBeGreaterThanOrEqual(64);
    expect(huge).toBeLessThanOrEqual(320);
  });

  it("игнорирует посторонние клавиши", () => {
    expect(keyboardScroll("a", 800, "x")).toBeNull();
  });
});
