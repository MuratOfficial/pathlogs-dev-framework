"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  chordFromEvent,
  createHotkeyMatcher,
  parseHotkey,
  SEQUENCE_TIMEOUT,
  type MatcherEntry,
} from "./hotkeys.js";

export interface Hotkey {
  /**
   * Запись клавиш: "mod+k", "g d", "?", "escape".
   * Аккорды разделяются пробелом, модификаторы — плюсом.
   * `mod` — Ctrl на Windows/Linux и ⌘ на macOS.
   */
  keys: string;
  handler: (event: KeyboardEvent) => void;
  /** Подпись для экрана справки. */
  label?: string;
  /** Раздел в справке: «Навигация», «Доска». */
  group?: string;
  /** Клавиша сработает и когда фокус в поле ввода. Для "mod+k" и "escape". */
  allowInInput?: boolean;
  /** Временно выключить, не убирая из списка. */
  enabled?: boolean;
}

export interface UseHotkeysOptions {
  /** Выключить весь набор разом. */
  enabled?: boolean;
  /** Сколько ждать вторую клавишу последовательности (мс). */
  timeout?: number;
  /** На чём слушать. По умолчанию window. */
  target?: EventTarget | null;
}

/** Курсор в поле ввода — обычные клавиши принадлежат полю, а не приложению. */
function isTyping(target: EventTarget | null): boolean {
  const node = target as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    node.isContentEditable === true
  );
}

/**
 * Глобальные горячие клавиши с поддержкой последовательностей: «g», затем
 * «d» — переход на дашборд.
 *
 * ```tsx
 * useHotkeys([
 *   { keys: "g d", label: "Дашборд", handler: () => router.push("/dashboard") },
 *   { keys: "mod+k", label: "Поиск", allowInInput: true, handler: openPalette },
 * ]);
 * ```
 *
 * Обработчики читаются в момент нажатия, а не привязки, — поэтому свежее
 * замыкание не требует стабильного массива, и `useHotkeys` можно звать
 * с литералом прямо в теле компонента.
 */
export function useHotkeys(hotkeys: Hotkey[], options: UseHotkeysOptions = {}): void {
  const hotkeysRef = useRef(hotkeys);
  useEffect(() => {
    hotkeysRef.current = hotkeys;
  });

  const { enabled = true, timeout = SEQUENCE_TIMEOUT, target } = options;

  // Подпись набора: меняется только когда меняются сами клавиши, а не когда
  // пересоздаётся обработчик. Разбор и подписка от неё и зависят.
  const signature = hotkeys.map((h) => `${h.keys}|${h.allowInInput ? 1 : 0}`).join("\n");

  const { entries, inputEntries } = useMemo(() => {
    const all: MatcherEntry<number>[] = [];
    const inInput: MatcherEntry<number>[] = [];
    signature
      .split("\n")
      .filter(Boolean)
      .forEach((line, index) => {
        const cut = line.lastIndexOf("|");
        const entry = { id: index, sequence: parseHotkey(line.slice(0, cut)) };
        all.push(entry);
        if (line.slice(cut + 1) === "1") inInput.push(entry);
      });
    return { entries: all, inputEntries: inInput };
  }, [signature]);

  useEffect(() => {
    if (!enabled) return;
    const node = target ?? (typeof window === "undefined" ? null : window);
    if (!node) return;

    // Два матчера, а не один с фильтром на выходе: набранная в поле ввода
    // «g» иначе оставила бы общий матчер в ожидании продолжения, и следующая
    // настоящая «d» сработала бы как переход.
    const matcher = createHotkeyMatcher(entries, timeout);
    const inputMatcher = createHotkeyMatcher(inputEntries, timeout);

    function onKeyDown(event: Event) {
      const e = event as KeyboardEvent;
      // Клавиша-модификатор сама по себе — не нажатие, а его половина
      if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") {
        return;
      }

      const typing = isTyping(e.target);
      const result = (typing ? inputMatcher : matcher).press(chordFromEvent(e), e.timeStamp);
      if (result.type !== "match") return;

      const hotkey = hotkeysRef.current[result.id];
      if (!hotkey || hotkey.enabled === false) return;

      e.preventDefault();
      hotkey.handler(e);
    }

    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [enabled, entries, inputEntries, timeout, target]);
}
