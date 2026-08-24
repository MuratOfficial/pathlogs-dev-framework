/**
 * Разбор и сопоставление горячих клавиш — без DOM, чтобы механику
 * последовательностей («g», затем «d») можно было проверить тестами.
 * Хук useHotkeys только кормит сюда события клавиатуры.
 */

/** Одно нажатие: клавиша плюс модификаторы. */
export interface KeyChord {
  /** Клавиша в нижнем регистре: "k", "escape", "?", "arrowdown". */
  key: string;
  /** Ctrl на Windows/Linux, ⌘ на macOS — одна запись «mod» на обе платформы. */
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

/** Последовательность нажатий: ["g", "d"] для «g d». */
export type HotkeySequence = KeyChord[];

/** Сколько ждать вторую клавишу последовательности (мс). */
export const SEQUENCE_TIMEOUT = 1200;

const MODIFIER_ALIASES: Record<string, keyof Omit<KeyChord, "key">> = {
  mod: "mod",
  cmd: "mod",
  meta: "mod",
  ctrl: "mod",
  control: "mod",
  shift: "shift",
  alt: "alt",
  option: "alt",
};

/** Человекочитаемые имена, которые не совпадают с event.key. */
const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  space: " ",
  spacebar: " ",
  enter: "enter",
  return: "enter",
  del: "delete",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
};

/**
 * Разбирает запись вида "g d", "mod+k", "shift+?" в последовательность.
 * Аккорды разделяются пробелом, модификаторы внутри аккорда — плюсом.
 *
 * Неизвестные модификаторы не игнорируются молча: такая запись почти всегда
 * опечатка, а горячая клавиша, которая просто не срабатывает, — самый
 * неприятный вид поломки.
 */
export function parseHotkey(spec: string): HotkeySequence {
  const chords = spec.trim().split(/\s+/).filter(Boolean);
  if (chords.length === 0) {
    throw new Error(`Пустая запись горячей клавиши: ${JSON.stringify(spec)}`);
  }

  return chords.map((chord) => {
    const parts = chord.split("+").filter(Boolean);
    const result: KeyChord = { key: "", mod: false, shift: false, alt: false };

    // Последняя часть — сама клавиша; всё до неё — модификаторы.
    // "+" как клавиша записывается одиночным аккордом и сюда не попадает.
    const keyPart = parts.pop() ?? chord;
    for (const raw of parts) {
      const flag = MODIFIER_ALIASES[raw.toLowerCase()];
      if (!flag) {
        throw new Error(
          `Неизвестный модификатор ${JSON.stringify(raw)} в горячей клавише ${JSON.stringify(spec)}`
        );
      }
      result[flag] = true;
    }

    const key = keyPart.toLowerCase();
    result.key = KEY_ALIASES[key] ?? key;
    return result;
  });
}

/** Приводит событие клавиатуры к аккорду. */
export function chordFromEvent(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): KeyChord {
  return {
    key: event.key.toLowerCase(),
    mod: event.ctrlKey || event.metaKey,
    shift: event.shiftKey,
    alt: event.altKey,
  };
}

/** Клавиши-модификаторы: сами по себе аккордом не являются. */
const MODIFIER_KEYS = new Set(["control", "shift", "alt", "meta", "os", "altgraph"]);

/** Нажат ли сейчас только модификатор, без основной клавиши. */
export function isModifierOnly(event: { key: string }): boolean {
  return MODIFIER_KEYS.has(event.key.toLowerCase());
}

/** Человекочитаемые имена клавиш для показа: enter → ↵, escape → Esc. */
const KEY_SYMBOLS: Record<string, string> = {
  enter: "↵",
  " ": "Space",
  escape: "Esc",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  backspace: "⌫",
  delete: "Del",
  tab: "⇥",
};

/**
 * Записывает аккорд в текст той же грамматики, что читает parseHotkey.
 *
 * `mod` разворачивается обратно в `mod`, а не в `ctrl`: запись остаётся
 * межплатформенной, и на macOS та же комбинация покажется как ⌘. Порядок
 * модификаторов фиксирован, чтобы `mod+shift+k` и `shift+mod+k` не считались
 * разными записями одного и того же.
 */
export function chordToSpec(chord: KeyChord): string {
  const parts: string[] = [];
  if (chord.mod) parts.push("mod");
  if (chord.alt) parts.push("alt");
  if (chord.shift) parts.push("shift");
  parts.push(chord.key);
  return parts.join("+");
}

/** Формирует аккорд к показу: ⌘K, mod по платформе, символ клавиши. */
export function formatChord(chord: KeyChord, platform: "mac" | "other" = "other"): string {
  const parts: string[] = [];
  if (chord.mod) parts.push(platform === "mac" ? "⌘" : "Ctrl");
  if (chord.alt) parts.push(platform === "mac" ? "⌥" : "Alt");
  if (chord.shift) parts.push(platform === "mac" ? "⇧" : "Shift");

  const key = KEY_SYMBOLS[chord.key] ?? (chord.key.length === 1 ? chord.key.toUpperCase() : chord.key);
  parts.push(key);
  // На macOS модификаторы принято писать слитно, на прочих — через плюс
  return parts.join(platform === "mac" ? "" : "+");
}

/**
 * Совпадают ли аккорды.
 *
 * shift сравниваем только когда его требует сама запись: «?» на большинстве
 * раскладок набирается с shift, и требование shift: false ломало бы её.
 */
export function chordMatches(expected: KeyChord, actual: KeyChord): boolean {
  if (expected.key !== actual.key) return false;
  if (expected.mod !== actual.mod) return false;
  if (expected.alt !== actual.alt) return false;
  if (expected.shift && !actual.shift) return false;
  return true;
}

/** Что делать с нажатием. */
export type HotkeyMatch<T> =
  /** Последовательность сложилась целиком. */
  | { type: "match"; id: T }
  /** Первое нажатие многоклавишной записи: ждём продолжения. */
  | { type: "pending" }
  /** Ни одна запись не подошла. */
  | { type: "none" };

export interface MatcherEntry<T> {
  id: T;
  sequence: HotkeySequence;
}

/**
 * Машина состояний для последовательностей.
 *
 * Хранит только индекс внутри незавершённой последовательности, а не буфер
 * нажатий: буфер пришлось бы чистить по таймеру, а индекс достаточно
 * сравнить со временем последнего нажатия — поэтому «g», нажатая минуту
 * назад, не превращает случайную «d» в переход.
 */
export function createHotkeyMatcher<T>(
  entries: MatcherEntry<T>[],
  timeout: number = SEQUENCE_TIMEOUT
) {
  let candidates: MatcherEntry<T>[] = [];
  let depth = 0;
  let lastAt = 0;

  function reset() {
    candidates = [];
    depth = 0;
  }

  return {
    /** Скармливает очередное нажатие. `now` — метка времени события (мс). */
    press(chord: KeyChord, now: number): HotkeyMatch<T> {
      // Затянувшаяся пауза обрывает начатую последовательность
      if (depth > 0 && now - lastAt > timeout) reset();
      lastAt = now;

      const pool = depth > 0 ? candidates : entries;
      const matched = pool.filter((e) => {
        const expected = e.sequence[depth];
        return expected !== undefined && chordMatches(expected, chord);
      });

      if (matched.length === 0) {
        reset();
        return { type: "none" };
      }

      // Полное совпадение выигрывает у более длинной записи с тем же началом:
      // иначе одиночная клавиша никогда бы не сработала рядом с "g d".
      const complete = matched.find((e) => e.sequence.length === depth + 1);
      if (complete) {
        reset();
        return { type: "match", id: complete.id };
      }

      candidates = matched;
      depth += 1;
      return { type: "pending" };
    },
    reset,
  };
}
