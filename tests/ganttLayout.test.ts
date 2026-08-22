import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  applyDrag,
  buildScale,
  criticalPath,
  datedRows,
  deltaDays,
  layoutBars,
  startOfDay,
  toISODate,
  type GanttDrag,
  type GanttItemLike,
} from "../registry/widgets/gantt/ganttLayout";

function item(id: string, startDate?: string | null, dueDate?: string | null): GanttItemLike {
  return { id, startDate, dueDate };
}

describe("startOfDay / toISODate", () => {
  it("сбрасывает время суток", () => {
    const d = startOfDay(new Date(2026, 0, 15, 23, 59, 59));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });

  it("собирает дату из локальных частей", () => {
    // toISOString переводит в UTC и в отрицательных зонах сдвинул бы дату
    // на сутки назад
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toISODate(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("datedRows", () => {
  it("отбрасывает элементы вовсе без дат", () => {
    expect(datedRows([item("a"), item("b", "2026-01-01")])).toHaveLength(1);
  });

  it("одна проставленная дата даёт однодневную полосу", () => {
    // Иначе половина плана просто не была бы видна
    const [row] = datedRows([item("a", null, "2026-01-10")]);
    expect(row!.from.getTime()).toBe(row!.to.getTime());
  });

  it("срок раньше начала схлопывается в день, а не выворачивает полосу", () => {
    const [row] = datedRows([item("a", "2026-01-10", "2026-01-01")]);
    expect(row!.to.getTime()).toBe(row!.from.getTime());
  });

  it("сортирует по дате начала", () => {
    const rows = datedRows([
      item("late", "2026-02-01", "2026-02-05"),
      item("early", "2026-01-01", "2026-01-05"),
    ]);
    expect(rows.map((r) => r.item.id)).toEqual(["early", "late"]);
  });
});

describe("buildScale", () => {
  it("на пустом наборе шкалы нет", () => {
    expect(buildScale([])).toBeNull();
  });

  it("оставляет запас слева от первой полосы", () => {
    const rows = datedRows([item("a", "2026-01-10", "2026-01-12")]);
    const scale = buildScale(rows)!;
    expect(scale.scaleStart.getTime()).toBe(startOfDay("2026-01-10").getTime() - 2 * DAY_MS);
  });

  it("ужимает день на длинном горизонте и расширяет на коротком", () => {
    // 32 px на день дали бы на годовом плане полотно, по которому
    // невозможно листать
    const short = buildScale(datedRows([item("a", "2026-01-01", "2026-01-10")]))!;
    const long = buildScale(datedRows([item("a", "2026-01-01", "2026-12-31")]))!;
    expect(short.dayWidth).toBeGreaterThan(long.dayWidth);
  });

  it("подписывает первое число месяца и самый левый день", () => {
    const scale = buildScale(datedRows([item("a", "2026-01-10", "2026-03-05")]))!;
    expect(scale.months.length).toBeGreaterThanOrEqual(3);
    expect(scale.months[0]!.dayOffset).toBe(0);
  });

  it("считает смещение сегодняшнего дня", () => {
    const scale = buildScale(datedRows([item("a", "2026-01-10", "2026-01-20")]), {
      today: new Date(2026, 0, 12),
    })!;
    // Шкала начинается за 2 дня до 10 января, значит 12-е — это день №4
    expect(scale.todayOffset).toBe(4);
  });
});

describe("layoutBars", () => {
  it("полоса из одного дня занимает один день, а не нулевую ширину", () => {
    const rows = datedRows([item("a", "2026-01-10", "2026-01-10")]);
    const scale = buildScale(rows)!;
    expect(layoutBars(rows, scale.scaleStart).get("a")!.span).toBe(1);
  });

  it("считает длительность и смещение", () => {
    const rows = datedRows([item("a", "2026-01-10", "2026-01-14")]);
    const scale = buildScale(rows)!;
    const bar = layoutBars(rows, scale.scaleStart).get("a")!;
    expect(bar.span).toBe(5);
    expect(bar.offset).toBe(2);
    expect(bar.row).toBe(0);
  });
});

describe("criticalPath", () => {
  const ids = new Set(["a", "b", "c", "d"]);
  const duration = () => 1;

  it("без связей пути нет", () => {
    expect(criticalPath(ids, [], duration).ids.size).toBe(0);
  });

  it("находит самую длинную цепочку", () => {
    const edges = [
      { fromId: "a", toId: "b" },
      { fromId: "b", toId: "c" },
      { fromId: "d", toId: "c" },
    ];
    const path = criticalPath(ids, edges, duration);
    expect([...path.ids].sort()).toEqual(["a", "b", "c"]);
  });

  it("учитывает длительность, а не только число звеньев", () => {
    const edges = [
      { fromId: "a", toId: "c" },
      { fromId: "b", toId: "c" },
    ];
    const path = criticalPath(ids, edges, (id) => (id === "b" ? 100 : 1));
    expect(path.ids.has("b")).toBe(true);
    expect(path.ids.has("a")).toBe(false);
  });

  it("на цикле пути нет вместо произвольной цепочки", () => {
    // Показывать какую-то цепочку в циклическом графе было бы враньём
    const edges = [
      { fromId: "a", toId: "b" },
      { fromId: "b", toId: "a" },
    ];
    expect(criticalPath(new Set(["a", "b"]), edges, duration).ids.size).toBe(0);
  });

  it("игнорирует связи с элементами вне диаграммы", () => {
    const edges = [{ fromId: "a", toId: "нет-такого" }];
    expect(criticalPath(ids, edges, duration).ids.size).toBe(0);
  });

  it("игнорирует петли", () => {
    expect(criticalPath(ids, [{ fromId: "a", toId: "a" }], duration).ids.size).toBe(0);
  });

  it("запоминает предшественника для подсветки рёбер", () => {
    const path = criticalPath(ids, [{ fromId: "a", toId: "b" }], duration);
    expect(path.previous.get("b")).toBe("a");
  });
});

describe("applyDrag", () => {
  const from = new Date(2026, 0, 10).getTime();
  const to = new Date(2026, 0, 15).getTime();
  const base: GanttDrag = { itemId: "a", mode: "move", startX: 0, origFrom: from, origTo: to, delta: 0 };

  it("перенос двигает оба конца", () => {
    const next = applyDrag({ ...base, delta: 3 });
    expect(next.from).toBe(from + 3 * DAY_MS);
    expect(next.to).toBe(to + 3 * DAY_MS);
  });

  it("левая ручка двигает только начало", () => {
    const next = applyDrag({ ...base, mode: "start", delta: 2 });
    expect(next.from).toBe(from + 2 * DAY_MS);
    expect(next.to).toBe(to);
  });

  it("левая ручка упирается в конец полосы", () => {
    // Иначе полосу можно было бы вывернуть и получить срок раньше начала
    const next = applyDrag({ ...base, mode: "start", delta: 100 });
    expect(next.from).toBe(to);
  });

  it("правая ручка упирается в начало полосы", () => {
    const next = applyDrag({ ...base, mode: "end", delta: -100 });
    expect(next.to).toBe(from);
  });
});

describe("deltaDays", () => {
  it("переводит сдвиг указателя в дни", () => {
    expect(deltaDays(64, 0, 32)).toBe(2);
    expect(deltaDays(-64, 0, 32)).toBe(-2);
  });

  it("округляет до ближайшего дня", () => {
    // Полоса встаёт на целый день, а не между днями
    expect(deltaDays(40, 0, 32)).toBe(1);
    expect(deltaDays(-40, 0, 32)).toBe(-1);
  });

  it("ровно полдня округляет вверх — как Math.round", () => {
    // Ничья разрешается в сторону плюса на обоих концах: сдвиг ровно
    // на полдня влево даёт -1, а не -2
    expect(deltaDays(16, 0, 32)).toBe(1);
    expect(deltaDays(-16, 0, 32)).toBe(-0);
  });
});
