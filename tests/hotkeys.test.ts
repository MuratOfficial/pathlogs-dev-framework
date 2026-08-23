import { describe, expect, it } from "vitest";
import {
  chordFromEvent,
  chordMatches,
  createHotkeyMatcher,
  parseHotkey,
  type KeyChord,
} from "@toimetdev/pathlogs-hooks";

function chord(key: string, mods: Partial<KeyChord> = {}): KeyChord {
  return { key, mod: false, shift: false, alt: false, ...mods };
}

describe("parseHotkey", () => {
  it("разбирает одиночную клавишу", () => {
    expect(parseHotkey("k")).toEqual([chord("k")]);
  });

  it("разбирает последовательность из двух аккордов", () => {
    expect(parseHotkey("g d")).toEqual([chord("g"), chord("d")]);
  });

  it("понимает mod как ctrl и cmd разом", () => {
    expect(parseHotkey("mod+k")).toEqual([chord("k", { mod: true })]);
    expect(parseHotkey("ctrl+k")).toEqual(parseHotkey("cmd+k"));
  });

  it("накапливает несколько модификаторов", () => {
    expect(parseHotkey("mod+shift+p")).toEqual([
      chord("p", { mod: true, shift: true }),
    ]);
  });

  it("раскрывает человекочитаемые имена клавиш", () => {
    expect(parseHotkey("esc")).toEqual([chord("escape")]);
    expect(parseHotkey("up")).toEqual([chord("arrowup")]);
  });

  it("не проглатывает опечатку в модификаторе", () => {
    // Клавиша, которая молча не срабатывает, — худший вид поломки:
    // лучше упасть при разборе, чем оставить мёртвую запись
    expect(() => parseHotkey("crtl+k")).toThrow(/Неизвестный модификатор/);
  });

  it("не принимает пустую запись", () => {
    expect(() => parseHotkey("   ")).toThrow();
  });
});

describe("chordMatches", () => {
  it("требует совпадения клавиши и модификаторов", () => {
    expect(chordMatches(chord("k", { mod: true }), chord("k", { mod: true }))).toBe(true);
    expect(chordMatches(chord("k", { mod: true }), chord("k"))).toBe(false);
    expect(chordMatches(chord("k"), chord("j"))).toBe(false);
  });

  it("не требует отсутствия shift, если запись его не просит", () => {
    // «?» на большинстве раскладок набирается с shift — требование
    // shift: false сломало бы эту запись
    expect(chordMatches(chord("?"), chord("?", { shift: true }))).toBe(true);
  });

  it("требует shift, когда запись его просит", () => {
    expect(chordMatches(chord("p", { shift: true }), chord("p"))).toBe(false);
  });
});

describe("chordFromEvent", () => {
  it("сводит ctrl и meta в один mod", () => {
    expect(
      chordFromEvent({ key: "K", ctrlKey: false, metaKey: true, shiftKey: false, altKey: false })
    ).toEqual(chord("k", { mod: true }));
  });
});

describe("createHotkeyMatcher", () => {
  const entries = [
    { id: "dashboard", sequence: parseHotkey("g d") },
    { id: "my", sequence: parseHotkey("g m") },
    { id: "done", sequence: parseHotkey("d") },
    { id: "search", sequence: parseHotkey("mod+k") },
  ];

  it("узнаёт одиночную клавишу сразу", () => {
    const m = createHotkeyMatcher(entries);
    expect(m.press(chord("d"), 0)).toEqual({ type: "match", id: "done" });
  });

  it("ждёт вторую клавишу последовательности", () => {
    const m = createHotkeyMatcher(entries);
    expect(m.press(chord("g"), 0)).toEqual({ type: "pending" });
    expect(m.press(chord("d"), 100)).toEqual({ type: "match", id: "dashboard" });
  });

  it("после «g» одиночная «d» не срабатывает как своя команда", () => {
    // Иначе «g d» одновременно уводил бы на дашборд и отмечал карточку
    const m = createHotkeyMatcher(entries);
    m.press(chord("g"), 0);
    expect(m.press(chord("d"), 100)).toEqual({ type: "match", id: "dashboard" });
  });

  it("забывает начатую последовательность после паузы", () => {
    const m = createHotkeyMatcher(entries, 1000);
    m.press(chord("g"), 0);
    expect(m.press(chord("d"), 5000)).toEqual({ type: "match", id: "done" });
  });

  it("сбрасывается на неподходящей клавише", () => {
    const m = createHotkeyMatcher(entries);
    m.press(chord("g"), 0);
    expect(m.press(chord("x"), 50)).toEqual({ type: "none" });
    expect(m.press(chord("d"), 60)).toEqual({ type: "match", id: "done" });
  });

  it("различает записи с общим началом", () => {
    const m = createHotkeyMatcher(entries);
    m.press(chord("g"), 0);
    expect(m.press(chord("m"), 50)).toEqual({ type: "match", id: "my" });
  });

  it("учитывает модификаторы", () => {
    const m = createHotkeyMatcher(entries);
    expect(m.press(chord("k", { mod: true }), 0)).toEqual({ type: "match", id: "search" });
    expect(m.press(chord("k"), 10)).toEqual({ type: "none" });
  });
});
