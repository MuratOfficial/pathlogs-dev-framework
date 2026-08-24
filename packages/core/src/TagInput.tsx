"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "./cn.js";
import { addTags, removeTag, tagToBackspace, type TagRejection } from "./tagModel.js";

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  /** Предел количества. */
  max?: number;
  /** `Bug` и `bug` — одно и то же. По умолчанию да. */
  caseInsensitive?: boolean;
  /** Проверка значения: `false` отклоняет. */
  validate?: (value: string) => boolean;
  /** Дополнительные символы-разделители, кроме запятой и переноса строки. */
  separators?: string[];
  /** Скрытое поле с этим именем — чтобы отправить теги обычной формой. */
  name?: string;
  /** Сообщение об отклонённом значении. */
  onReject?: (value: string, reason: TagRejection) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Многозначный ввод: значения-чипы вместо строки через запятую.
 *
 * Главный случай — вставка из буфера: `a, b;c` из письма или таблицы
 * распадается на отдельные чипы с отсевом повторов и пустот. Разбор — в
 * `tagModel.ts` под тестами; здесь ввод, чипы и клавиатура.
 */
export function TagInput({
  value,
  onChange,
  placeholder,
  max,
  caseInsensitive = true,
  validate,
  separators,
  name,
  onReject,
  disabled,
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [shake, setShake] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const atLimit = max !== undefined && value.length >= max;

  function commit(raw: string) {
    if (raw.trim() === "") return;
    const result = addTags(value, raw, { max, caseInsensitive, ...(validate ? { validate } : {}), ...(separators ? { separators } : {}) });
    if (result.added.length > 0) onChange(result.tags);
    if (result.rejected.length > 0) {
      // Тряска — единственная обратная связь, которая не требует места
      // под сообщение и читается мгновенно
      setShake(true);
      setTimeout(() => setShake(false), 400);
      for (const r of result.rejected) onReject?.(r.value, r.reason);
    }
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "") {
      const last = tagToBackspace(value);
      if (last) onChange(removeTag(value, last, caseInsensitive));
    }
  }

  return (
    <div
      className={cn("pl-taginput", disabled && "pl-taginput--disabled", shake && "pl-animate-shake", className)}
      onClick={() => input.current?.focus()}
    >
      {name && <input type="hidden" name={name} value={value.join(",")} />}

      {value.map((tag) => (
        <span key={tag} className="pl-taginput__chip">
          {tag}
          {!disabled && (
            <button
              type="button"
              className="pl-taginput__remove"
              aria-label={`Убрать ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(removeTag(value, tag, caseInsensitive));
              }}
            >
              ×
            </button>
          )}
        </span>
      ))}

      <input
        ref={input}
        className="pl-taginput__field"
        value={draft}
        disabled={disabled || atLimit}
        placeholder={value.length === 0 ? placeholder : atLimit ? "" : undefined}
        onChange={(e) => {
          const next = e.target.value;
          // Разделитель в потоке ввода — обычно вставка: разбираем сразу
          if (separators ? separators.some((s) => next.includes(s)) : /[,\n\t;]/.test(next)) {
            commit(next);
          } else {
            setDraft(next);
          }
        }}
        onKeyDown={onKeyDown}
        onBlur={() => commit(draft)}
        onPaste={(e) => {
          e.preventDefault();
          commit(e.clipboardData.getData("text"));
        }}
      />
    </div>
  );
}
