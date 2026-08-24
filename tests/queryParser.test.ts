import { describe, expect, it } from "vitest";
import {
  applySuggestion,
  matchesQuery,
  parseQuery,
  stringifyQuery,
  suggestAt,
  tokenizeQuery,
  type QueryField,
} from "@toimetdev/pathlogs-core";

interface Task {
  status: string;
  author: { id: string; name: string };
  labels: string[];
  priority: number;
  due: string;
  title: string;
}

const FIELDS: QueryField<Task>[] = [
  { key: "status", type: "enum", options: [{ value: "open" }, { value: "done" }] },
  { key: "author", type: "text", get: (t) => t.author },
  { key: "label", type: "enum", get: (t) => t.labels, options: [{ value: "bug" }, { value: "ui" }] },
  { key: "priority", type: "number" },
  { key: "due", type: "date" },
];

function task(over: Partial<Task> = {}): Task {
  return {
    status: "open",
    author: { id: "u1", name: "Мурат" },
    labels: ["bug"],
    priority: 3,
    due: "2026-02-20",
    title: "Импорт падает",
    ...over,
  };
}

describe("tokenizeQuery", () => {
  it("не рвёт значение в кавычках", () => {
    const tokens = tokenizeQuery('title:"падает на импорте" is:open');
    expect(tokens).toHaveLength(2);
    expect(tokens[0]!.values).toEqual(["падает на импорте"]);
  });

  it("двоеточие в URL не делает его условием", () => {
    const tokens = tokenizeQuery("http://example.com");
    expect(tokens[0]!.kind).toBe("text");
  });

  it("отрицание распознаётся", () => {
    const tokens = tokenizeQuery("-label:bug");
    expect(tokens[0]!.negated).toBe(true);
    expect(tokens[0]!.key).toBe("label");
  });

  it("оператор сравнения выделяется", () => {
    const tokens = tokenizeQuery("priority:>=3");
    expect(tokens[0]!.op).toBe("gte");
    expect(tokens[0]!.values).toEqual(["3"]);
  });

  it("незакрытая кавычка помечается, но разбор не падает", () => {
    const tokens = tokenizeQuery('title:"незакрыт');
    expect(tokens[0]!.unterminated).toBe(true);
  });
});

describe("parseQuery", () => {
  it("делит на условия и свободный текст", () => {
    const p = parseQuery("is:open падает label:bug", FIELDS.concat([{ key: "is" } as QueryField<Task>]));
    expect(p.text).toEqual(["падает"]);
    expect(p.filters).toHaveLength(2);
  });

  it("значения через запятую — это ИЛИ внутри условия", () => {
    const p = parseQuery("label:bug,ui", FIELDS);
    expect(p.filters[0]!.values).toEqual(["bug", "ui"]);
  });

  it("условие без значения не превращается в фильтр", () => {
    const p = parseQuery("author:", FIELDS);
    expect(p.filters).toHaveLength(0);
  });

  it("неизвестный ключ собирается отдельно", () => {
    const p = parseQuery("assigne:me", FIELDS);
    expect(p.unknownKeys).toContain("assigne");
  });
});

describe("matchesQuery", () => {
  it("простое равенство перечислимого", () => {
    expect(matchesQuery(task({ status: "open" }), parseQuery("status:open", FIELDS), FIELDS)).toBe(true);
    expect(matchesQuery(task({ status: "done" }), parseQuery("status:open", FIELDS), FIELDS)).toBe(false);
  });

  it("массив меток совпадает по любому значению", () => {
    expect(matchesQuery(task({ labels: ["bug", "ui"] }), parseQuery("label:ui", FIELDS), FIELDS)).toBe(true);
  });

  it("отрицание инвертирует", () => {
    expect(matchesQuery(task({ labels: ["bug"] }), parseQuery("-label:bug", FIELDS), FIELDS)).toBe(false);
    expect(matchesQuery(task({ labels: ["ui"] }), parseQuery("-label:bug", FIELDS), FIELDS)).toBe(true);
  });

  it("объект-автор сравнивается по имени и id", () => {
    const q = parseQuery("author:Мурат", FIELDS);
    expect(matchesQuery(task(), q, FIELDS)).toBe(true);
  });

  it("числовое сравнение", () => {
    expect(matchesQuery(task({ priority: 4 }), parseQuery("priority:>3", FIELDS), FIELDS)).toBe(true);
    expect(matchesQuery(task({ priority: 2 }), parseQuery("priority:>3", FIELDS), FIELDS)).toBe(false);
  });

  it("сравнение дат относительно now", () => {
    const now = new Date(2026, 1, 14);
    const q = parseQuery("due:<now+7d", FIELDS);
    expect(matchesQuery(task({ due: "2026-02-18" }), q, FIELDS, { now })).toBe(true);
    expect(matchesQuery(task({ due: "2026-03-30" }), q, FIELDS, { now })).toBe(false);
  });

  it("неизвестный ключ не совпадает ни с чем", () => {
    expect(matchesQuery(task(), parseQuery("nope:x", FIELDS), FIELDS)).toBe(false);
  });

  it("свободный текст ищет по извлечённой строке", () => {
    const q = parseQuery("импорт", FIELDS);
    expect(matchesQuery(task(), q, FIELDS, { text: (t) => t.title })).toBe(true);
    expect(matchesQuery(task({ title: "другое" }), q, FIELDS, { text: (t) => t.title })).toBe(false);
  });
});

describe("suggestAt", () => {
  it("в пустом месте подсказывает ключи", () => {
    const ctx = suggestAt("", 0, FIELDS);
    expect(ctx.kind).toBe("key");
    expect(ctx.suggestions.length).toBeGreaterThan(0);
  });

  it("после ключа с двоеточием подсказывает значения", () => {
    const input = "status:";
    const ctx = suggestAt(input, input.length, FIELDS);
    expect(ctx.kind).toBe("value");
    expect(ctx.key).toBe("status");
    expect(ctx.suggestions.map((s) => s.value)).toContain("open");
  });

  it("фильтрует значения по набранному префиксу", () => {
    const input = "status:d";
    const ctx = suggestAt(input, input.length, FIELDS);
    expect(ctx.suggestions.map((s) => s.value)).toEqual(["done"]);
  });

  it("подставляет значение и двигает каретку за него", () => {
    const input = "status:d";
    const ctx = suggestAt(input, input.length, FIELDS);
    const res = applySuggestion(input, ctx, { value: "done" });
    expect(res.text).toBe("status:done ");
    expect(res.caret).toBe(res.text.length);
  });
});

describe("stringifyQuery", () => {
  it("собирает строку обратно, кавыча значения с пробелами", () => {
    const parsed = parseQuery('label:bug -status:done "две слова"', FIELDS.concat([{ key: "status" } as QueryField<Task>]));
    const s = stringifyQuery(parsed);
    expect(s).toContain("label:bug");
    expect(s).toContain("-status:done");
    expect(s).toContain('"две слова"');
  });
});
