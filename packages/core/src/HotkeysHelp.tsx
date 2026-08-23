"use client";

import { useState } from "react";
import { useHotkeys, type Hotkey } from "@toimetdev/pathlogs-hooks";
import { Dialog } from "./Dialog.js";

export interface HotkeysHelpProps {
  /**
   * Тот же список, что отдан в useHotkeys. Справка строится из него,
   * а не из отдельной таблицы: разъехаться им тогда просто негде.
   */
  hotkeys: Hotkey[];
  /** Клавиша вызова справки. */
  hotkey?: string;
  title?: string;
  hint?: string;
}

/** «↑» и «g» вместо ArrowUp и KeyG — читается быстрее, чем имя события. */
const KEY_GLYPHS: Record<string, string> = {
  mod: "⌘/Ctrl",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  enter: "↵",
  escape: "Esc",
  " ": "Space",
};

function glyph(part: string): string {
  return KEY_GLYPHS[part.toLowerCase()] ?? part;
}

/** Разбивает "g d" и "mod+k" на отдельные клавиши для показа. */
function keyParts(spec: string): string[] {
  return spec
    .trim()
    .split(/\s+/)
    .flatMap((chord) => chord.split("+"))
    .map(glyph);
}

/**
 * Экран справки по горячим клавишам, открывается по «?».
 *
 * Показывает только записи с подписью: клавиши без label — служебные
 * (закрыть окно, подтвердить), и в списке они были бы шумом.
 */
export function HotkeysHelp({
  hotkeys,
  hotkey = "?",
  title = "Keyboard shortcuts",
  hint,
}: HotkeysHelpProps) {
  const [open, setOpen] = useState(false);

  useHotkeys([
    { keys: hotkey, handler: () => setOpen((v) => !v) },
    ...hotkeys,
  ]);

  const documented = hotkeys.filter((h) => h.label);

  // Порядок разделов — порядок первого появления: он отражает то, как
  // клавиши задумывал автор, а алфавит перемешал бы связанные группы
  const groups: { name: string; items: Hotkey[] }[] = [];
  for (const h of documented) {
    const name = h.group ?? "";
    const existing = groups.find((g) => g.name === name);
    if (existing) existing.items.push(h);
    else groups.push({ name, items: [h] });
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} title={title} size="sm">
      {groups.map((group) => (
        <section key={group.name} className="pl-hotkeys__group">
          {group.name && <h3 className="pl-hotkeys__group-title">{group.name}</h3>}
          <ul className="pl-hotkeys__list">
            {group.items.map((h) => (
              <li key={h.keys} className="pl-hotkeys__row">
                <span className="pl-hotkeys__label">{h.label}</span>
                <span className="pl-hotkeys__keys">
                  {keyParts(h.keys).map((k, i) => (
                    <kbd key={i} className="pl-kbd">
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {hint && <p className="pl-hint">{hint}</p>}
    </Dialog>
  );
}
