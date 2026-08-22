"use client";

import { useState, useTransition } from "react";
import { Markdown } from "./Markdown.js";
import { cn } from "./cn.js";

export interface EditableTextProps {
  value: string;
  /** Сохранение. Пока промис не разрешится, текст показан приглушённо. */
  onSave: (next: string) => void | Promise<void>;
  /** Многострочное поле вместо однострочного. */
  multiline?: boolean;
  /** Показывать значение как ограниченный Markdown в режиме просмотра. */
  markdown?: boolean;
  /** Крупный кегль — для заголовков. */
  big?: boolean;
  /** Что показать вместо пустого значения. */
  placeholder?: string;
  /** Подсказка при наведении на текст. */
  tip?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Текст, который правится по клику прямо на месте.
 *
 * Сохранение — по потере фокуса и по Enter (в однострочном поле);
 * Escape отменяет правку. Значение, не отличающееся от исходного,
 * не сохраняется вовсе — иначе каждый случайный клик порождал бы
 * запись в истории изменений.
 */
export function EditableText({
  value,
  onSave,
  multiline = false,
  markdown = false,
  big = false,
  placeholder = "—",
  tip,
  rows = 5,
  className,
  disabled = false,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, startTransition] = useTransition();

  function save() {
    setEditing(false);
    if (draft.trim() === value.trim()) return;
    startTransition(async () => {
      await onSave(draft.trim());
    });
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    const shared = {
      autoFocus: true,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: save,
      className: cn("pl-editable__field", big && "pl-editable__field--big", className),
    };

    return multiline ? (
      <textarea
        {...shared}
        rows={rows}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
        }}
      />
    ) : (
      <input
        {...shared}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
      />
    );
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (disabled) return;
        setDraft(value);
        setEditing(true);
      }}
      // Клавиатура должна открывать правку так же, как мышь: иначе поле
      // доступно только указателем
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setDraft(value);
          setEditing(true);
        }
      }}
      data-tip={disabled ? undefined : tip}
      className={cn(
        "pl-editable",
        big && "pl-editable--big",
        pending && "pl-editable--pending",
        !value && "pl-editable--empty",
        disabled && "pl-editable--disabled",
        className
      )}
    >
      {value ? (
        markdown && multiline ? (
          <Markdown text={value} />
        ) : (
          value
        )
      ) : (
        placeholder
      )}
    </div>
  );
}
