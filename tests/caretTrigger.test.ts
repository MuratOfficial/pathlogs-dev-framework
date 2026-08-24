import { describe, expect, it } from "vitest";
import { filterByQuery, replaceTrigger, triggerAt } from "@toimetdev/pathlogs-core";

describe("triggerAt", () => {
  it("находит @ в начале", () => {
    const t = triggerAt("@mur", 4, ["@"]);
    expect(t).toMatchObject({ char: "@", query: "mur", start: 0 });
  });

  it("находит @ после пробела", () => {
    const t = triggerAt("привет @му", 10, ["@"]);
    expect(t?.query).toBe("му");
  });

  it("адрес почты не открывает меню упоминаний", () => {
    expect(triggerAt("write a@b", 9, ["@"])).toBeNull();
  });

  it("путь не открывает меню команд", () => {
    expect(triggerAt("src/index", 9, ["/"])).toBeNull();
  });

  it("/ в начале строки — команда", () => {
    expect(triggerAt("/dep", 4, ["/"])?.query).toBe("dep");
  });

  it("пробел в запросе закрывает триггер", () => {
    expect(triggerAt("@mur ", 5, ["@"])).toBeNull();
  });

  it("слишком длинный запрос закрывает меню", () => {
    const long = "@" + "x".repeat(50);
    expect(triggerAt(long, long.length, ["@"], { maxQuery: 32 })).toBeNull();
  });

  it("midWord разрешает триггер в середине слова", () => {
    expect(triggerAt("a@b", 3, ["@"], { midWord: true })?.query).toBe("b");
  });

  it("несколько символов триггера сразу", () => {
    expect(triggerAt("#bug", 4, ["@", "#", "/"])?.char).toBe("#");
  });
});

describe("replaceTrigger", () => {
  it("заменяет триггер с запросом на готовый текст и двигает каретку", () => {
    const t = triggerAt("привет @му", 10, ["@"])!;
    const res = replaceTrigger("привет @му", t, "@Мурат Тоймет");
    expect(res.text).toBe("привет @Мурат Тоймет ");
    expect(res.caret).toBe(res.text.length);
  });

  it("не дублирует уже существующий пробел", () => {
    const text = "@му конец";
    const t = triggerAt(text, 3, ["@"])!;
    const res = replaceTrigger(text, t, "@Мурат");
    expect(res.text).toBe("@Мурат конец");
  });

  it("вставка в середину сохраняет хвост", () => {
    const text = "до /dep после";
    const t = triggerAt(text, 7, ["/"])!;
    const res = replaceTrigger(text, t, "/deploy", "");
    expect(res.text).toContain("после");
  });
});

describe("filterByQuery", () => {
  const items = [{ name: "Мурат" }, { name: "Айгерим" }, { name: "Данияр" }];

  it("пустой запрос отдаёт всё до лимита", () => {
    expect(filterByQuery(items, "", (i) => i.name, 2)).toHaveLength(2);
  });

  it("ищет вхождением без учёта регистра", () => {
    expect(filterByQuery(items, "мур", (i) => i.name)).toEqual([{ name: "Мурат" }]);
  });
});
