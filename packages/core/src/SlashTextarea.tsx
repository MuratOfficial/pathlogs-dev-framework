"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "./cn.js";
import { filterByQuery, replaceTrigger, triggerAt } from "./caretTrigger.js";

/** Команда меню «/». */
export interface SlashCommand {
  id: string;
  label: string;
  /** Пояснение справа. */
  hint?: string;
  /** Иконка слева. */
  icon?: ReactNode;
  /** Слова для поиска помимо label. */
  keywords?: string;
}

export interface SlashTextareaProps {
  value: string;
  onValueChange: (value: string) => void;
  commands: SlashCommand[];
  /** Выполнить команду. Если вернуть строку — она вставится вместо «/…». */
  onCommand: (command: SlashCommand) => string | void;
  /** Символ-триггер. По умолчанию «/». */
  trigger?: string;
  placeholder?: string;
  rows?: number;
  name?: string;
  className?: string;
}

/**
 * Textarea с меню команд по «/» — как в Notion, Linear, Slack.
 *
 * Родня `MentionTextarea`, но «/» запускает действие, а не вставляет текст.
 * Детект триггера у каретки (с оглядкой на границы слова, чтобы `src/index`
 * не открывал меню) — в `caretTrigger.ts` под тестами.
 */
export function SlashTextarea({
  value,
  onValueChange,
  commands,
  onCommand,
  trigger = "/",
  placeholder,
  rows = 4,
  name,
  className,
}: SlashTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [active, setActive] = useState(0);
  const [caret, setCaret] = useState(0);

  const found = triggerAt(value, caret, [trigger]);
  const matches = found
    ? filterByQuery(commands, found.query, (c) => `${c.label} ${c.keywords ?? ""}`)
    : [];
  const open = found !== null && matches.length > 0;

  function run(command: SlashCommand) {
    if (!found) return;
    const inserted = onCommand(command);
    // Команда-вставка (шаблон, эмодзи) заменяет «/…»; команда-действие
    // (создать задачу) просто убирает набранное «/слово»
    const res = replaceTrigger(value, found, inserted ?? "", inserted ? " " : "");
    onValueChange(res.text);
    setActive(0);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(res.caret, res.caret);
      setCaret(res.caret);
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      run(matches[active]!);
    } else if (e.key === "Escape") {
      // Сбрасываем каретку в состоянии, чтобы меню закрылось до следующего ввода
      setCaret(-1);
    }
  }

  function syncCaret() {
    setCaret(ref.current?.selectionStart ?? value.length);
  }

  return (
    <div className={cn("pl-slash", className)}>
      <textarea
        ref={ref}
        name={name}
        className="pl-input pl-slash__field"
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => {
          onValueChange(e.target.value);
          setCaret(e.target.selectionStart ?? e.target.value.length);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        onKeyUp={syncCaret}
        onClick={syncCaret}
      />

      {open && (
        <ul className="pl-slash__menu pl-animate-pop-in" role="listbox">
          {matches.map((command, i) => (
            <li key={command.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                className={cn("pl-slash__option", i === active && "pl-slash__option--active")}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  run(command);
                }}
              >
                {command.icon && <span className="pl-slash__icon">{command.icon}</span>}
                <span className="pl-slash__label">{command.label}</span>
                {command.hint && <span className="pl-slash__hint">{command.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
