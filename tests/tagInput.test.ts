import { describe, expect, it } from "vitest";
import { addTags, normalizeTag, removeTag, splitTags, tagToBackspace } from "@toimetdev/pathlogs-core";

describe("normalizeTag", () => {
  it("срезает пробелы и обрамляющие кавычки", () => {
    expect(normalizeTag('  "bug"  ')).toBe("bug");
    expect(normalizeTag("ui")).toBe("ui");
  });
});

describe("splitTags", () => {
  it("режет по запятой, точке с запятой и переводу строки", () => {
    expect(splitTags("a, b;c\nd")).toEqual(["a", "b", "c", "d"]);
  });

  it("не режет по пробелу — значения бывают из двух слов", () => {
    expect(splitTags("Мурат Тоймет, Айгерим")).toEqual(["Мурат Тоймет", "Айгерим"]);
  });

  it("выбрасывает пустые куски", () => {
    expect(splitTags("a,,b,")).toEqual(["a", "b"]);
  });
});

describe("addTags", () => {
  it("добавляет новые, сохраняя порядок", () => {
    const r = addTags(["a"], "b, c");
    expect(r.tags).toEqual(["a", "b", "c"]);
    expect(r.added).toEqual(["b", "c"]);
  });

  it("повтор не добавляется, но и не мешает остальным", () => {
    const r = addTags(["bug"], "bug, ui");
    expect(r.tags).toEqual(["bug", "ui"]);
    expect(r.rejected).toEqual([{ value: "bug", reason: "duplicate" }]);
  });

  it("регистронезависимость по умолчанию", () => {
    const r = addTags(["Bug"], "bug");
    expect(r.added).toHaveLength(0);
    expect(r.rejected[0]!.reason).toBe("duplicate");
  });

  it("предел количества отклоняет лишние", () => {
    const r = addTags(["a", "b"], "c, d", { max: 3 });
    expect(r.tags).toEqual(["a", "b", "c"]);
    expect(r.rejected.some((x) => x.reason === "limit")).toBe(true);
  });

  it("своя проверка отсеивает неподходящее", () => {
    const r = addTags([], "ok, плохо!", { validate: (v) => /^[a-z]+$/.test(v) });
    expect(r.added).toEqual(["ok"]);
    expect(r.rejected[0]!.reason).toBe("invalid");
  });

  it("вставка из письма с мешаниной разделителей", () => {
    const r = addTags([], "a@x.com, b@x.com;c@x.com");
    expect(r.added).toEqual(["a@x.com", "b@x.com", "c@x.com"]);
  });
});

describe("removeTag / tagToBackspace", () => {
  it("удаляет без учёта регистра", () => {
    expect(removeTag(["Bug", "ui"], "bug")).toEqual(["ui"]);
  });

  it("backspace целит в последнее значение", () => {
    expect(tagToBackspace(["a", "b"])).toBe("b");
  });

  it("в пустом списке backspace не находит цель", () => {
    expect(tagToBackspace([])).toBeNull();
  });
});
