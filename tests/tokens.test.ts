import { describe, expect, it } from "vitest";
import {
  activeSectionId,
  type SectionPosition,
} from "@toimetdev/pathlogs-hooks";
import {
  alpha,
  backdropCss,
  hexToRgb,
  isHexColor,
  luminance,
  readableTextOn,
  themeScript,
} from "@toimetdev/pathlogs-tokens";
import { cn, initials } from "@toimetdev/pathlogs-core";

describe("isHexColor / hexToRgb", () => {
  it("принимает #rrggbb в любом регистре", () => {
    expect(isHexColor("#6366f1")).toBe(true);
    expect(isHexColor("#6366F1")).toBe(true);
  });

  it("отвергает короткую и именованную запись", () => {
    // Сокращённая форма не принимается намеренно: одна форма в базе —
    // одна форма в превью, разъехаться нечему
    expect(isHexColor("#fff")).toBe(false);
    expect(isHexColor("red")).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });

  it("раскладывает цвет на каналы", () => {
    expect(hexToRgb("#ff8000")).toEqual({ r: 255, g: 128, b: 0 });
  });

  it("на невалидном цвете возвращает null", () => {
    expect(hexToRgb("не цвет")).toBeNull();
  });
});

describe("luminance / readableTextOn", () => {
  it("белый ярче чёрного", () => {
    expect(luminance("#ffffff")).toBeGreaterThan(luminance("#000000"));
  });

  it("на светлом фоне выбирает чёрный текст, на тёмном — белый", () => {
    // Цвета меток задаёт пользователь: белый текст на жёлтом не читается
    expect(readableTextOn("#ffff00")).toBe("#000000");
    expect(readableTextOn("#1b2233")).toBe("#ffffff");
  });
});

describe("alpha", () => {
  it("добавляет прозрачность восьмизначным hex", () => {
    expect(alpha("#6366f1", 1)).toBe("#6366f1ff");
    expect(alpha("#6366f1", 0)).toBe("#6366f100");
  });

  it("зажимает значение в диапазон", () => {
    expect(alpha("#6366f1", 5)).toBe("#6366f1ff");
    expect(alpha("#6366f1", -1)).toBe("#6366f100");
  });

  it("невалидный цвет возвращает как есть", () => {
    expect(alpha("var(--accent)", 0.5)).toBe("var(--accent)");
  });
});

describe("backdropCss", () => {
  it("однотонная подложка даёт радиальное пятно", () => {
    const css = backdropCss({ color: "#6366f1" });
    expect(css).toContain("radial-gradient");
    expect(css).toContain("#6366f1");
  });

  it("два цвета дают линейный градиент с указанным углом", () => {
    const css = backdropCss({ color: "#6366f1", colorTo: "#ec4899", angle: 45 });
    expect(css).toContain("linear-gradient(45deg");
    expect(css).toContain("#ec4899");
  });

  it("цвета всегда полупрозрачные", () => {
    // Фон подкрашивает страницу, но не спорит с текстом ни в одной из тем
    const css = backdropCss({ color: "#6366f1" });
    expect(css).not.toMatch(/#6366f1[,)\s]/);
  });
});

describe("themeScript", () => {
  it("подставляет ключ хранилища и запасную тему", () => {
    const script = themeScript("my-theme", "light");
    expect(script).toContain('"my-theme"');
    expect(script).toContain('"light"');
  });

  it("остаётся одним выражением без переводов строк", () => {
    // Скрипт встраивается в <head> синхронно — он должен быть коротким
    expect(themeScript()).not.toContain("\n");
  });

  it("ставит атрибут даже при недоступном localStorage", () => {
    expect(themeScript()).toContain("catch");
  });
});

describe("activeSectionId", () => {
  const positions: SectionPosition[] = [
    { id: "a", top: -100 },
    { id: "b", top: 40 },
    { id: "c", top: 800 },
  ];

  it("активен последний блок выше линии", () => {
    expect(activeSectionId(positions, 60, false)).toBe("b");
  });

  it("до первого блока активен первый", () => {
    expect(activeSectionId([{ id: "a", top: 500 }], 60, false)).toBe("a");
  });

  it("у низа страницы активен последний блок", () => {
    // Короткий блок в конце физически не поднимается к линии —
    // иначе он никогда бы не подсветился
    expect(activeSectionId(positions, 60, true)).toBe("c");
  });

  it("на пустом списке возвращает null", () => {
    expect(activeSectionId([], 60, false)).toBeNull();
  });
});

describe("cn", () => {
  it("склеивает строки и пропускает пустые значения", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b");
  });

  it("разворачивает массивы", () => {
    expect(cn(["a", ["b"]])).toBe("a b");
  });

  it("берёт из объекта только включённые ключи", () => {
    expect(cn({ a: true, b: false })).toBe("a");
  });
});

describe("initials", () => {
  it("берёт до двух первых букв", () => {
    expect(initials("Иван Петров")).toBe("ИП");
    expect(initials("Иван Петрович Сидоров")).toBe("ИП");
  });

  it("работает с одним словом", () => {
    expect(initials("Иван")).toBe("И");
  });

  it("не спотыкается о лишние пробелы", () => {
    expect(initials("  Иван   Петров  ")).toBe("ИП");
  });

  it("на пустом имени даёт пустую строку", () => {
    expect(initials("")).toBe("");
  });
});
