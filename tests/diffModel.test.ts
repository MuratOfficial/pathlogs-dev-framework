import { describe, expect, it } from "vitest";
import {
  buildHunks,
  diffLines,
  diffStats,
  diffWords,
  pairRows,
  splitLines,
} from "../registry/widgets/diff-view/diffModel";

describe("splitLines", () => {
  it("не оставляет пустой хвост после последнего перевода", () => {
    expect(splitLines("a\nb\n")).toEqual(["a", "b"]);
  });

  it("нормализует CRLF", () => {
    expect(splitLines("a\r\nb")).toEqual(["a", "b"]);
  });
});

describe("diffLines", () => {
  it("одинаковые тексты — всё equal", () => {
    const d = diffLines(["a", "b"], ["a", "b"]);
    expect(d.every((l) => l.type === "equal")).toBe(true);
  });

  it("добавленная строка помечена add и без leftNo", () => {
    const d = diffLines(["a", "c"], ["a", "b", "c"]);
    const add = d.find((l) => l.type === "add")!;
    expect(add.text).toBe("b");
    expect(add.leftNo).toBeUndefined();
    expect(add.rightNo).toBe(2);
  });

  it("удалённая строка помечена del и без rightNo", () => {
    const d = diffLines(["a", "b", "c"], ["a", "c"]);
    const del = d.find((l) => l.type === "del")!;
    expect(del.text).toBe("b");
    expect(del.rightNo).toBeUndefined();
  });

  it("нумерация сквозная и корректная", () => {
    const d = diffLines(["a", "b"], ["a", "x"]);
    const equal = d.filter((l) => l.type === "equal");
    expect(equal[0]).toMatchObject({ leftNo: 1, rightNo: 1 });
  });

  it("удаление встаёт выше добавления при замене", () => {
    const d = diffLines(["old"], ["new"]);
    expect(d[0]!.type).toBe("del");
    expect(d[1]!.type).toBe("add");
  });

  it("пустой исходник — всё добавлено", () => {
    const d = diffLines([], ["a", "b"]);
    expect(d.every((l) => l.type === "add")).toBe(true);
  });
});

describe("diffWords", () => {
  it("отмечает изменённое слово, не трогая остальные", () => {
    const spans = diffWords("привет мир", "привет космос");
    const del = spans.find((s) => s.type === "del");
    const add = spans.find((s) => s.type === "add");
    expect(del!.text).toContain("мир");
    expect(add!.text).toContain("космос");
    expect(spans.some((s) => s.type === "equal" && s.text.includes("привет"))).toBe(true);
  });

  it("склеивает соседние куски одного типа", () => {
    const spans = diffWords("a b c", "x y z");
    // не должно быть двух подряд del
    for (let i = 1; i < spans.length; i += 1) {
      if (spans[i]!.type === spans[i - 1]!.type) throw new Error("соседние куски не склеены");
    }
    expect(true).toBe(true);
  });
});

describe("buildHunks", () => {
  it("нет изменений — нет кусков", () => {
    const d = diffLines(["a", "b"], ["a", "b"]);
    expect(buildHunks(d)).toHaveLength(0);
  });

  it("собирает изменение с контекстом", () => {
    const before = ["1", "2", "3", "4", "5", "6", "7"];
    const after = ["1", "2", "3", "X", "5", "6", "7"];
    const hunks = buildHunks(diffLines(before, after), 1);
    expect(hunks).toHaveLength(1);
    // контекст ±1 вокруг изменения
    expect(hunks[0]!.lines.length).toBeLessThan(before.length + 1);
    expect(hunks[0]!.header).toMatch(/^@@ -\d+,\d+ \+\d+,\d+ @@$/);
  });

  it("далёкие изменения дают отдельные куски", () => {
    const before = Array.from({ length: 20 }, (_, i) => `${i}`);
    const after = [...before];
    after[2] = "A";
    after[17] = "B";
    const hunks = buildHunks(diffLines(before, after), 1);
    expect(hunks.length).toBe(2);
  });
});

describe("diffStats", () => {
  it("считает добавления и удаления", () => {
    const d = diffLines(["a", "b", "c"], ["a", "x", "c", "d"]);
    const stats = diffStats(d);
    expect(stats.added).toBeGreaterThan(0);
    expect(stats.removed).toBeGreaterThan(0);
  });
});

describe("pairRows", () => {
  it("равные строки идут одной парой", () => {
    const rows = pairRows(diffLines(["a"], ["a"]));
    expect(rows[0]).toMatchObject({ modified: false });
    expect(rows[0]!.left).toBe(rows[0]!.right);
  });

  it("замена сопоставляет удаление и добавление напротив", () => {
    const rows = pairRows(diffLines(["old"], ["new"]));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.modified).toBe(true);
    expect(rows[0]!.left!.text).toBe("old");
    expect(rows[0]!.right!.text).toBe("new");
  });

  it("непарное удаление оставляет правую сторону пустой", () => {
    const rows = pairRows(diffLines(["a", "b"], ["a"]));
    const modified = rows.find((r) => r.left && !r.right);
    expect(modified).toBeTruthy();
  });
});
