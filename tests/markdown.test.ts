import { describe, expect, it } from "vitest";
import { parseBlocks, parseInline, parseInlineWithMentions } from "@pathlogs/core";

describe("parseBlocks", () => {
  it("собирает соседние строки в один абзац", () => {
    expect(parseBlocks("первая\nвторая")).toEqual([
      { kind: "p", lines: ["первая", "вторая"] },
    ]);
  });

  it("разделяет абзацы пустой строкой", () => {
    const blocks = parseBlocks("один\n\nдва");
    expect(blocks).toHaveLength(2);
    expect(blocks.every((b) => b.kind === "p")).toBe(true);
  });

  it("разбирает заголовки и ограничивает уровень тремя", () => {
    // Пользовательский текст не должен перебивать заголовки самой страницы
    expect(parseBlocks("###### глубоко")).toEqual([
      { kind: "h", level: 3, text: "глубоко" },
    ]);
  });

  it("разбирает маркированный и нумерованный списки", () => {
    expect(parseBlocks("- раз\n- два")).toEqual([
      { kind: "ul", items: ["раз", "два"] },
    ]);
    expect(parseBlocks("1. раз\n2) два")).toEqual([
      { kind: "ol", items: ["раз", "два"] },
    ]);
  });

  it("разбирает цитату", () => {
    expect(parseBlocks("> цитата\n> вторая")).toEqual([
      { kind: "quote", lines: ["цитата", "вторая"] },
    ]);
  });

  it("разбирает горизонтальную черту", () => {
    expect(parseBlocks("---")).toEqual([{ kind: "hr" }]);
  });

  it("сохраняет содержимое блока кода как есть", () => {
    // Внутри блока кода разметки нет: «- не список» должен остаться строкой
    expect(parseBlocks("```\n- не список\n**не жирный**\n```")).toEqual([
      { kind: "code", lines: ["- не список", "**не жирный**"] },
    ]);
  });

  it("запоминает язык блока кода", () => {
    expect(parseBlocks("```ts\nconst a = 1;\n```")).toEqual([
      { kind: "code", lines: ["const a = 1;"], lang: "ts" },
    ]);
  });

  it("не падает на незакрытом блоке кода", () => {
    expect(parseBlocks("```\nхвост")).toEqual([{ kind: "code", lines: ["хвост"] }]);
  });

  it("нормализует переводы строк Windows", () => {
    expect(parseBlocks("раз\r\n\r\nдва")).toHaveLength(2);
  });
});

describe("parseInline", () => {
  it("разбирает жирный, курсив и зачёркнутый", () => {
    expect(parseInline("**ж**")).toEqual([
      { kind: "strong", children: [{ kind: "text", text: "ж" }] },
    ]);
    expect(parseInline("*к*")).toEqual([
      { kind: "em", children: [{ kind: "text", text: "к" }] },
    ]);
    expect(parseInline("~~з~~")).toEqual([
      { kind: "del", children: [{ kind: "text", text: "з" }] },
    ]);
  });

  it("предпочитает жирный двойному курсиву", () => {
    // ** раньше * в разборе — иначе жирный распался бы на два курсива
    const nodes = parseInline("**жирный**");
    expect(nodes[0]!.kind).toBe("strong");
  });

  it("не разбирает разметку внутри кода", () => {
    expect(parseInline("`**не жирный**`")).toEqual([
      { kind: "code", text: "**не жирный**" },
    ]);
  });

  it("делает ссылкой только безопасные протоколы", () => {
    const ok = parseInline("[текст](https://example.com)");
    expect(ok[0]).toMatchObject({ kind: "link", href: "https://example.com" });

    const mailto = parseInline("[почта](mailto:a@b.c)");
    expect(mailto[0]!.kind).toBe("link");
  });

  it("оставляет javascript-ссылку обычным текстом", () => {
    // Ключевая защита: пользовательский текст не должен становиться
    // исполняемой ссылкой
    const nodes = parseInline("[клик](javascript:alert(1))");
    expect(nodes.some((n) => n.kind === "link")).toBe(false);
    // Текст доходит до читателя целиком — разбор ничего не проглатывает
    expect(nodes.map((n) => (n.kind === "text" ? n.text : "")).join("")).toBe(
      "[клик](javascript:alert(1))"
    );
  });

  it("оставляет data-ссылку обычным текстом", () => {
    const nodes = parseInline("[x](data:text/html,<script>)");
    expect(nodes[0]!.kind).toBe("text");
  });

  it("разбирает вложенную разметку внутри ссылки", () => {
    const nodes = parseInline("[**жирная** ссылка](https://example.com)");
    expect(nodes[0]).toMatchObject({ kind: "link" });
    const link = nodes[0] as { children: unknown[] };
    expect(link.children[0]).toMatchObject({ kind: "strong" });
  });

  it("сохраняет текст вокруг разметки", () => {
    expect(parseInline("до **ж** после")).toEqual([
      { kind: "text", text: "до " },
      { kind: "strong", children: [{ kind: "text", text: "ж" }] },
      { kind: "text", text: " после" },
    ]);
  });

  it("оставляет текст без разметки одним куском", () => {
    expect(parseInline("просто текст")).toEqual([{ kind: "text", text: "просто текст" }]);
  });
});

describe("parseInlineWithMentions", () => {
  it("подсвечивает известное имя", () => {
    expect(parseInlineWithMentions("привет, @Иван", ["Иван"])).toEqual([
      { kind: "text", text: "привет, " },
      { kind: "mention", text: "@Иван" },
    ]);
  });

  it("не трогает незнакомое имя", () => {
    expect(parseInlineWithMentions("@Никто", ["Иван"])).toEqual([
      { kind: "text", text: "@Никто" },
    ]);
  });

  it("предпочитает длинное имя короткому с тем же началом", () => {
    // Иначе «@Иван» съел бы начало «@Иван Петров»
    const nodes = parseInlineWithMentions("@Иван Петров тут", ["Иван", "Иван Петров"]);
    expect(nodes[0]).toEqual({ kind: "mention", text: "@Иван Петров" });
  });

  it("экранирует спецсимволы в именах", () => {
    // Имя с точкой не должно превратиться в «любой символ»
    const nodes = parseInlineWithMentions("@a.b", ["a.b"]);
    expect(nodes).toEqual([{ kind: "mention", text: "@a.b" }]);
    expect(parseInlineWithMentions("@axb", ["a.b"])[0]!.kind).toBe("text");
  });

  it("разбирает разметку вокруг упоминания", () => {
    const nodes = parseInlineWithMentions("**важно** @Иван", ["Иван"]);
    expect(nodes[0]!.kind).toBe("strong");
    expect(nodes[nodes.length - 1]).toEqual({ kind: "mention", text: "@Иван" });
  });

  it("без списка имён работает как обычный разбор", () => {
    expect(parseInlineWithMentions("@кто-то", [])).toEqual(parseInline("@кто-то"));
  });
});
