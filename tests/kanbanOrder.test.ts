import { describe, expect, it } from "vitest";
import {
  applyOrder,
  columnItems,
  dropSlotIndex,
  hiddenColumns,
  hoverIndex,
  insertAt,
  isOverWipLimit,
  reorderColumns,
  visibleColumns,
  type KanbanColumnLike,
  type KanbanItemLike,
} from "../registry/widgets/kanban/kanbanOrder";

const columns: KanbanColumnLike[] = [
  { id: "todo", order: 20 },
  { id: "doing", order: 10 },
  { id: "done", order: 30, hidden: true },
];

function item(id: string, columnId: string | null, order: number, createdAt: string): KanbanItemLike {
  return { id, columnId, order, createdAt };
}

describe("visibleColumns / hiddenColumns", () => {
  it("сортирует по порядку и разделяет скрытые", () => {
    expect(visibleColumns(columns).map((c) => c.id)).toEqual(["doing", "todo"]);
    expect(hiddenColumns(columns).map((c) => c.id)).toEqual(["done"]);
  });

  it("не мутирует исходный массив", () => {
    // Массив приходит из состояния React — сортировка на месте испортила бы
    // его для всех остальных читателей
    const input = [...columns];
    visibleColumns(input);
    expect(input.map((c) => c.id)).toEqual(["todo", "doing", "done"]);
  });
});

describe("columnItems", () => {
  const items = [
    item("c", "todo", 2, "2026-01-03"),
    item("a", "todo", 0, "2026-01-01"),
    item("b", "todo", 1, "2026-01-02"),
    item("x", "doing", 0, "2026-01-01"),
  ];

  it("берёт только карточки своей колонки", () => {
    expect(columnItems(items, { id: "doing", order: 0 }).map((t) => t.id)).toEqual(["x"]);
  });

  it("при ручном порядке сортирует по order", () => {
    expect(columnItems(items, { id: "todo", order: 0 }).map((t) => t.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("сортирует по дате в обе стороны", () => {
    const col = { id: "todo", order: 0 };
    expect(
      columnItems(items, { ...col, sort: "CREATED_DESC" }).map((t) => t.id)
    ).toEqual(["c", "b", "a"]);
    expect(
      columnItems(items, { ...col, sort: "CREATED_ASC" }).map((t) => t.id)
    ).toEqual(["a", "b", "c"]);
  });
});

describe("dropSlotIndex", () => {
  const list = [
    item("a", "todo", 0, "2026-01-01"),
    item("b", "todo", 1, "2026-01-03"),
    item("c", "todo", 2, "2026-01-05"),
  ];
  const dragged = item("new", "todo", 9, "2026-01-04");

  it("при ручном порядке кладёт туда, где курсор", () => {
    expect(
      dropSlotIndex({ column: { id: "todo", order: 0, sort: "MANUAL" }, list, hovered: 1, dragged })
    ).toBe(1);
  });

  it("не выходит за границы списка", () => {
    const column = { id: "todo", order: 0, sort: "MANUAL" as const };
    expect(dropSlotIndex({ column, list, hovered: 99, dragged })).toBe(3);
    expect(dropSlotIndex({ column, list, hovered: -5, dragged })).toBe(0);
  });

  it("при сортировке по дате ставит слот по настоящему месту, а не под курсором", () => {
    // Иначе карточка «прыгнула» бы после отпускания в другое место
    expect(
      dropSlotIndex({
        column: { id: "todo", order: 0, sort: "CREATED_ASC" },
        list,
        hovered: 0,
        dragged,
      })
    ).toBe(2);
  });

  it("при обратной сортировке по дате считает с другого конца", () => {
    const desc = [...list].reverse();
    expect(
      dropSlotIndex({
        column: { id: "todo", order: 0, sort: "CREATED_DESC" },
        list: desc,
        hovered: 0,
        dragged,
      })
    ).toBe(1);
  });

  it("при активном фильтре кладёт в конец", () => {
    // Видно не все карточки, и «место под курсором» ничего не говорит
    // о настоящем порядке
    expect(
      dropSlotIndex({
        column: { id: "todo", order: 0, sort: "MANUAL" },
        list,
        hovered: 0,
        dragged,
        filtering: true,
      })
    ).toBe(3);
  });

  it("без перетаскиваемой карточки кладёт в конец", () => {
    expect(
      dropSlotIndex({
        column: { id: "todo", order: 0, sort: "CREATED_ASC" },
        list,
        hovered: 0,
        dragged: null,
      })
    ).toBe(3);
  });
});

describe("insertAt", () => {
  it("вставляет на нужную позицию", () => {
    expect(insertAt(["a", "b", "c"], "x", 1)).toEqual(["a", "x", "b", "c"]);
  });

  it("переставляет уже присутствующий id, а не дублирует его", () => {
    expect(insertAt(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
  });

  it("зажимает позицию в границы", () => {
    expect(insertAt(["a", "b"], "x", 99)).toEqual(["a", "b", "x"]);
    expect(insertAt(["a", "b"], "x", -3)).toEqual(["x", "a", "b"]);
  });
});

describe("reorderColumns", () => {
  it("ставит колонку на место целевой", () => {
    expect(reorderColumns(["a", "b", "c"], "c", "a")).toEqual(["c", "a", "b"]);
  });

  it("бросок на саму себя ничего не меняет", () => {
    // Иначе каждый промах мышью порождал бы запись на сервер
    const ids = ["a", "b", "c"];
    expect(reorderColumns(ids, "b", "b")).toBe(ids);
  });

  it("неизвестная цель ничего не меняет", () => {
    const ids = ["a", "b"];
    expect(reorderColumns(ids, "a", "zzz")).toBe(ids);
  });
});

describe("isOverWipLimit", () => {
  it("без лимита не срабатывает никогда", () => {
    expect(isOverWipLimit(999, null)).toBe(false);
    expect(isOverWipLimit(999, undefined)).toBe(false);
  });

  it("срабатывает только при превышении, а не при достижении", () => {
    expect(isOverWipLimit(3, 3)).toBe(false);
    expect(isOverWipLimit(4, 3)).toBe(true);
  });
});

describe("hoverIndex", () => {
  it("верхняя половина карточки — вставка перед ней", () => {
    expect(hoverIndex(2, 105, 100, 40)).toBe(2);
  });

  it("нижняя половина — вставка после неё", () => {
    expect(hoverIndex(2, 135, 100, 40)).toBe(3);
  });
});

describe("applyOrder", () => {
  it("проставляет новый order по позиции в списке", () => {
    const items = [
      item("a", "todo", 5, "2026-01-01"),
      item("b", "todo", 7, "2026-01-02"),
    ];
    const next = applyOrder(items, "todo", ["b", "a"]);
    expect(next.find((t) => t.id === "b")!.order).toBe(0);
    expect(next.find((t) => t.id === "a")!.order).toBe(1);
  });

  it("переносит карточку в новую колонку", () => {
    const items = [item("a", "doing", 0, "2026-01-01")];
    const next = applyOrder(items, "todo", ["a"]);
    expect(next[0]!.columnId).toBe("todo");
  });

  it("не трогает карточки других колонок", () => {
    const items = [
      item("a", "todo", 0, "2026-01-01"),
      item("z", "doing", 3, "2026-01-01"),
    ];
    const next = applyOrder(items, "todo", ["a"]);
    expect(next.find((t) => t.id === "z")).toEqual(items[1]);
  });
});
