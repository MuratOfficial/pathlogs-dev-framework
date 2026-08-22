import { describe, expect, it } from "vitest";
import {
  ANY,
  activeFieldCount,
  emptyFilter,
  equalsMatcher,
  includesMatcher,
  isFilterActive,
  matchesFilter,
  parseFilter,
  serializeFilter,
  textMatcher,
  type FilterField,
} from "../registry/widgets/filter-bar/filterModel";

interface Task {
  number: number;
  title: string;
  status: string;
  assignees: { id: string }[];
}

const fields: FilterField<Task>[] = [
  {
    key: "q",
    label: "Поиск",
    kind: "text",
    matches: textMatcher<Task>((t) => [t.title, t.number]),
  },
  {
    key: "status",
    label: "Статус",
    kind: "select",
    options: [{ value: "TODO", label: "К выполнению" }],
    matches: equalsMatcher<Task>((t) => t.status),
  },
  {
    key: "assignee",
    label: "Исполнитель",
    kind: "select",
    options: [{ value: "u1", label: "Иван" }],
    matches: includesMatcher<Task>((t) => t.assignees),
  },
];

const task: Task = {
  number: 12,
  title: "Страница оплаты",
  status: "TODO",
  assignees: [{ id: "u1" }],
};

describe("emptyFilter", () => {
  it("текстовые поля пустые, селекты — «любое»", () => {
    // Не пустая строка у селекта: у него всегда должен быть выбран пункт
    expect(emptyFilter(fields)).toEqual({ q: "", status: ANY, assignee: ANY });
  });
});

describe("isFilterActive / activeFieldCount", () => {
  it("пустой фильтр неактивен", () => {
    expect(isFilterActive(fields, emptyFilter(fields))).toBe(false);
  });

  it("пробелы в тексте не считаются условием", () => {
    expect(isFilterActive(fields, { ...emptyFilter(fields), q: "   " })).toBe(false);
  });

  it("считает заданные условия", () => {
    const state = { ...emptyFilter(fields), q: "оплат", status: "TODO" };
    expect(isFilterActive(fields, state)).toBe(true);
    expect(activeFieldCount(fields, state)).toBe(2);
  });
});

describe("serializeFilter / parseFilter", () => {
  it("в строку попадают только заданные условия", () => {
    const state = { ...emptyFilter(fields), status: "TODO" };
    expect(serializeFilter(fields, state)).toBe("status=TODO");
  });

  it("пустой фильтр даёт пустую строку", () => {
    expect(serializeFilter(fields, emptyFilter(fields))).toBe("");
  });

  it("текст обрезается по краям", () => {
    expect(serializeFilter(fields, { ...emptyFilter(fields), q: "  оплата  " })).toBe(
      "q=%D0%BE%D0%BF%D0%BB%D0%B0%D1%82%D0%B0"
    );
  });

  it("разбор — обратная операция сборки", () => {
    const state = { ...emptyFilter(fields), q: "оплата", assignee: "u1" };
    expect(parseFilter(fields, serializeFilter(fields, state))).toEqual(state);
  });

  it("неизвестные ключи игнорируются", () => {
    // Сохранённый пресет должен пережить исчезновение поля, а не сломать экран
    expect(parseFilter(fields, "status=TODO&были=убраны")).toEqual({
      q: "",
      status: "TODO",
      assignee: ANY,
    });
  });

  it("на пустой строке даёт пустой фильтр", () => {
    expect(parseFilter(fields, "")).toEqual(emptyFilter(fields));
  });
});

describe("matchesFilter", () => {
  it("пустой фильтр пропускает всё", () => {
    // Пустой фильтр должен показывать всё, а не ничего
    expect(matchesFilter(fields, emptyFilter(fields), task)).toBe(true);
  });

  it("отсеивает по несовпадению любого условия", () => {
    expect(matchesFilter(fields, { ...emptyFilter(fields), status: "DONE" }, task)).toBe(false);
  });

  it("условия складываются по И", () => {
    const ok = { ...emptyFilter(fields), status: "TODO", assignee: "u1" };
    const no = { ...emptyFilter(fields), status: "TODO", assignee: "u2" };
    expect(matchesFilter(fields, ok, task)).toBe(true);
    expect(matchesFilter(fields, no, task)).toBe(false);
  });
});

describe("textMatcher", () => {
  it("ищет и по названию, и по номеру", () => {
    // «12» находит задачу №12, а «оплат» — «Страница оплаты»
    expect(matchesFilter(fields, { ...emptyFilter(fields), q: "12" }, task)).toBe(true);
    expect(matchesFilter(fields, { ...emptyFilter(fields), q: "оплат" }, task)).toBe(true);
  });

  it("не различает регистр", () => {
    expect(matchesFilter(fields, { ...emptyFilter(fields), q: "СТРАНИЦА" }, task)).toBe(true);
  });

  it("пропускает пустые свойства", () => {
    const match = textMatcher<{ a: string | null }>((x) => [x.a]);
    expect(match({ a: null }, "что-то")).toBe(false);
  });
});

describe("includesMatcher", () => {
  it("проверяет наличие среди связанных сущностей", () => {
    const match = includesMatcher<Task>((t) => t.assignees);
    expect(match(task, "u1")).toBe(true);
    expect(match(task, "u9")).toBe(false);
  });

  it("на пустом списке не совпадает", () => {
    const match = includesMatcher<Task>((t) => t.assignees);
    expect(match({ ...task, assignees: [] }, "u1")).toBe(false);
  });
});
