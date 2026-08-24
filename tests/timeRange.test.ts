import { describe, expect, it } from "vitest";
import {
  describeDuration,
  matchPreset,
  parseTimeExpr,
  rangeDuration,
  resolveRange,
  shiftDate,
  shiftRange,
  snapDate,
  toAbsolute,
  zoomRange,
  isValidExpr,
} from "@toimetdev/pathlogs-core";

const NOW = new Date(2026, 1, 14, 15, 30, 45, 500); // 14 фев 2026, 15:30:45.500

describe("parseTimeExpr", () => {
  it("now без сдвига — это now", () => {
    expect(parseTimeExpr("now", NOW)?.getTime()).toBe(NOW.getTime());
  });

  it("вычитает относительный интервал", () => {
    const d = parseTimeExpr("now-15m", NOW)!;
    expect(d.getTime()).toBe(NOW.getTime() - 15 * 60_000);
  });

  it("прибавляет вперёд", () => {
    const d = parseTimeExpr("now+2h", NOW)!;
    expect(d.getHours()).toBe(17);
  });

  it("округляет к началу дня", () => {
    const d = parseTimeExpr("now/d", NOW, "start")!;
    expect(d.getHours()).toBe(0);
    expect(d.getDate()).toBe(14);
  });

  it("правый край дня — конец суток", () => {
    const d = parseTimeExpr("now/d", NOW, "end")!;
    expect(d.getDate()).toBe(14);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
  });

  it("совмещает сдвиг и округление: вчерашний день", () => {
    const d = parseTimeExpr("now-1d/d", NOW, "start")!;
    expect(d.getDate()).toBe(13);
    expect(d.getHours()).toBe(0);
  });

  it("непонятную запись возвращает null, а не подставляет умолчание", () => {
    expect(parseTimeExpr("вчера", NOW)).toBeNull();
    expect(parseTimeExpr("", NOW)).toBeNull();
  });

  it("дата без времени справа — весь день", () => {
    const d = parseTimeExpr("2026-02-14", NOW, "end")!;
    expect(d.getHours()).toBe(23);
    expect(d.getDate()).toBe(14);
  });
});

describe("snapDate неделя с понедельника", () => {
  it("суббота округляется к понедельнику той же недели", () => {
    const sat = new Date(2026, 1, 14); // суббота
    const start = snapDate(sat, "w", "start");
    expect(start.getDay()).toBe(1); // понедельник
    expect(start.getDate()).toBe(9);
  });
});

describe("shiftDate календарём", () => {
  it("минус месяц не равен минус 30 дней", () => {
    const mar31 = new Date(2026, 2, 31);
    const shifted = shiftDate(mar31, -1, "M");
    expect(shifted.getMonth()).toBe(1); // февраль
  });

  it("год сдвигается годом", () => {
    expect(shiftDate(NOW, 1, "y").getFullYear()).toBe(2027);
  });
});

describe("resolveRange", () => {
  it("разбирает оба края", () => {
    const r = resolveRange({ from: "now-1h", to: "now" }, NOW)!;
    expect(r.to.getTime() - r.from.getTime()).toBe(3_600_000);
  });

  it("вывернутый интервал отвергается", () => {
    expect(resolveRange({ from: "now", to: "now-1h" }, NOW)).toBeNull();
  });

  it("непонятный край роняет весь интервал", () => {
    expect(resolveRange({ from: "мусор", to: "now" }, NOW)).toBeNull();
  });
});

describe("shiftRange листает на длину интервала", () => {
  it("сдвиг назад отдаёт абсолютный интервал той же длины", () => {
    const shifted = shiftRange({ from: "now-1h", to: "now" }, -1, NOW)!;
    const dur = rangeDuration(shifted, NOW);
    expect(dur).toBe(3_600_000);
    // и он больше не относительный
    expect(shifted.from.startsWith("now")).toBe(false);
  });
});

describe("zoomRange", () => {
  it("растягивает вокруг центра", () => {
    const z = zoomRange({ from: "now-1h", to: "now" }, 2, NOW)!;
    expect(rangeDuration(z, NOW)).toBe(2 * 3_600_000);
  });
});

describe("toAbsolute / matchPreset / describeDuration", () => {
  it("переводит относительный интервал в абсолютный", () => {
    const abs = toAbsolute({ from: "now-1h", to: "now" }, NOW)!;
    expect(abs.from).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("узнаёт готовый интервал", () => {
    expect(matchPreset({ from: "now-15m", to: "now" })?.id).toBe("15m");
    expect(matchPreset({ from: "now-99m", to: "now" })).toBeUndefined();
  });

  it("длительность словами использует крупнейшую единицу", () => {
    expect(describeDuration(3_600_000, "en-US")).toMatch(/hr|hour/i);
  });

  it("isValidExpr отражает разбор", () => {
    expect(isValidExpr("now-7d")).toBe(true);
    expect(isValidExpr("позавчера")).toBe(false);
  });
});
