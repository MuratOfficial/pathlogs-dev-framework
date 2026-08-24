import { describe, expect, it } from "vitest";
import { ANSI_PALETTE, hasAnsi, parseAnsi, stripAnsi } from "../registry/widgets/log-stream/ansi";
import {
  appendLines,
  compileQuery,
  countByLevel,
  detectLevel,
  filterLines,
  levelAtLeast,
  matchRanges,
  type LogLine,
} from "../registry/widgets/log-stream/logBuffer";

const ESC = String.fromCharCode(27);

describe("parseAnsi", () => {
  it("простой текст без последовательностей — один кусок", () => {
    expect(parseAnsi("hello")).toEqual([{ text: "hello" }]);
  });

  it("красит текст в цвет из палитры", () => {
    const spans = parseAnsi(`${ESC}[31merror${ESC}[0m`);
    expect(spans[0]).toMatchObject({ text: "error", fg: ANSI_PALETTE[1] });
  });

  it("сброс обнуляет стиль", () => {
    const spans = parseAnsi(`${ESC}[1;32mok${ESC}[0m tail`);
    expect(spans[0]).toMatchObject({ bold: true });
    expect(spans.at(-1)).toEqual({ text: " tail" });
  });

  it("выбрасывает не-цветные последовательности", () => {
    const spans = parseAnsi(`${ESC}[2Kline`);
    expect(spans).toEqual([{ text: "line" }]);
  });

  it("понимает 256-цветную запись", () => {
    const spans = parseAnsi(`${ESC}[38;5;196mx`);
    expect(spans[0]!.fg).toBeTruthy();
  });

  it("понимает truecolor", () => {
    const spans = parseAnsi(`${ESC}[38;2;255;0;0mx`);
    expect(spans[0]!.fg).toBe("rgb(255 0 0)");
  });
});

describe("stripAnsi / hasAnsi", () => {
  it("снимает всю разметку", () => {
    expect(stripAnsi(`${ESC}[31mred${ESC}[0m`)).toBe("red");
  });

  it("hasAnsi отличает размеченную строку", () => {
    expect(hasAnsi(`${ESC}[31mx`)).toBe(true);
    expect(hasAnsi("plain")).toBe(false);
  });
});

describe("detectLevel", () => {
  it("узнаёт уровень в префиксе", () => {
    expect(detectLevel("ERROR failed to connect")).toBe("error");
    expect(detectLevel("[warn] deprecated")).toBe("warn");
  });

  it("warning приводится к warn", () => {
    expect(detectLevel("WARNING: low disk")).toBe("warn");
  });

  it("слово-уровень за пределами префикса не превращает строку в ошибку", () => {
    // "all is well and fine" — ровно 20 символов; error лежит дальше
    expect(detectLevel("all is well and fine, but see error.log later", 20)).toBeUndefined();
  });
});

describe("levelAtLeast", () => {
  it("сравнивает по порядку уровней", () => {
    expect(levelAtLeast("error", "warn")).toBe(true);
    expect(levelAtLeast("debug", "warn")).toBe(false);
    expect(levelAtLeast(undefined, "info")).toBe(false);
  });
});

describe("appendLines", () => {
  it("проставляет сквозные номера", () => {
    const r = appendLines([], [{ text: "a" }, { text: "b" }]);
    expect(r.lines.map((l) => l.seq)).toEqual([0, 1]);
    expect(r.nextSeq).toBe(2);
  });

  it("вытесняет старые строки сверх предела", () => {
    const r = appendLines([], [{ text: "1" }, { text: "2" }, { text: "3" }], 2);
    expect(r.lines.map((l) => l.text)).toEqual(["2", "3"]);
    expect(r.dropped).toBe(1);
  });

  it("определяет уровень при добавлении", () => {
    const r = appendLines([], [{ text: "ERROR boom" }]);
    expect(r.lines[0]!.level).toBe("error");
  });

  it("явный уровень имеет приоритет над эвристикой", () => {
    const r = appendLines([], [{ text: "ERROR boom", level: "info" }]);
    expect(r.lines[0]!.level).toBe("info");
  });
});

describe("filterLines", () => {
  const lines: LogLine[] = [
    { seq: 0, text: "info: started", level: "info" },
    { seq: 1, text: "error: boom", level: "error" },
    { seq: 2, text: "plain line" },
  ];

  it("фильтрует по уровню, оставляя строки без уровня по умолчанию", () => {
    // error проходит, info отсеивается, строка без уровня остаётся видимой
    const shown = filterLines(lines, { levels: ["error"] });
    expect(shown.map((l) => l.seq)).toEqual([1, 2]);
  });

  it("строки без уровня можно скрыть", () => {
    expect(filterLines(lines, { levels: ["error"], includeUnleveled: false })).toHaveLength(1);
  });

  it("фильтрует по подстроке", () => {
    expect(filterLines(lines, { query: "boom" })).toHaveLength(1);
  });

  it("битое регулярное выражение ищется буквально, а не опустошает лог", () => {
    const found = filterLines([{ seq: 0, text: "a(b" }], { query: "a(b", regex: true });
    expect(found).toHaveLength(1);
  });
});

describe("matchRanges", () => {
  it("находит отрезки совпадений", () => {
    const ranges = matchRanges("abcabc", compileQuery("bc"));
    expect(ranges).toEqual([
      [1, 3],
      [4, 6],
    ]);
  });

  it("пустой матчер — нет отрезков", () => {
    expect(matchRanges("abc", null)).toEqual([]);
  });

  it("совпадение нулевой длины не зацикливает", () => {
    const ranges = matchRanges("abc", compileQuery("x*", { regex: true }));
    expect(ranges).toEqual([]);
  });
});

describe("countByLevel", () => {
  it("считает строки каждого уровня", () => {
    const counts = countByLevel([
      { seq: 0, text: "", level: "error" },
      { seq: 1, text: "", level: "error" },
      { seq: 2, text: "", level: "info" },
    ]);
    expect(counts.error).toBe(2);
    expect(counts.info).toBe(1);
  });
});
