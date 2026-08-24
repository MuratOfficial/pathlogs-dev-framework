import { describe, expect, it } from "vitest";
import {
  chordFromEvent,
  chordToSpec,
  formatChord,
  isModifierOnly,
  parseHotkey,
} from "@toimetdev/pathlogs-hooks";

describe("isModifierOnly", () => {
  it("голый модификатор — да", () => {
    expect(isModifierOnly({ key: "Control" })).toBe(true);
    expect(isModifierOnly({ key: "Shift" })).toBe(true);
  });

  it("обычная клавиша — нет", () => {
    expect(isModifierOnly({ key: "k" })).toBe(false);
  });
});

describe("chordToSpec", () => {
  it("собирает запись, читаемую parseHotkey обратно", () => {
    const chord = chordFromEvent({ key: "K", ctrlKey: true, metaKey: false, shiftKey: true, altKey: false });
    const spec = chordToSpec(chord);
    expect(spec).toBe("mod+shift+k");
    // круговая проверка: разбор возвращает тот же аккорд
    const parsed = parseHotkey(spec)[0]!;
    expect(parsed).toMatchObject({ key: "k", mod: true, shift: true });
  });

  it("порядок модификаторов фиксирован", () => {
    const a = chordToSpec({ key: "k", mod: true, shift: true, alt: true });
    expect(a).toBe("mod+alt+shift+k");
  });
});

describe("formatChord", () => {
  it("на macOS модификаторы слитно и символами", () => {
    expect(formatChord({ key: "k", mod: true, shift: false, alt: false }, "mac")).toBe("⌘K");
  });

  it("на прочих платформах через плюс", () => {
    expect(formatChord({ key: "k", mod: true, shift: false, alt: false }, "other")).toBe("Ctrl+K");
  });

  it("специальные клавиши показываются символом", () => {
    expect(formatChord({ key: "enter", mod: false, shift: false, alt: false })).toBe("↵");
    expect(formatChord({ key: "escape", mod: false, shift: false, alt: false })).toBe("Esc");
  });
});
