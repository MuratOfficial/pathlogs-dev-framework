"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "./cn.js";
import {
  applySuggestion,
  parseQuery,
  suggestAt,
  tokenizeQuery,
  type QueryField,
  type QueryOption,
} from "./queryParser.js";

export interface QueryInputProps<T> {
  value: string;
  onChange: (value: string) => void;
  /** Поля, по которым можно искать. */
  fields: QueryField<T>[];
  placeholder?: string;
  /** Сообщить о разобранном запросе — обычно для немедленной фильтрации. */
  onParsed?: (parsed: ReturnType<typeof parseQuery<T>>) => void;
  /** Ввод завершён (Enter вне подсказок). */
  onSubmit?: (value: string) => void;
  className?: string;
}

/**
 * Структурный поиск: `is:open author:me due:<now+7d`.
 *
 * То же, что `FilterBar` даёт кликам по полям, здесь даётся набором
 * с клавиатуры — и на той же модели условий. Условия рисуются чипами,
 * ключи и значения дополняются по каретке. Токенайзер, разбор и подсказки —
 * в `queryParser.ts` под тестами; здесь ввод, подсветка и меню.
 */
export function QueryInput<T>({
  value,
  onChange,
  fields,
  placeholder = "is:open author:me…",
  onParsed,
  onSubmit,
  className,
}: QueryInputProps<T>) {
  const input = useRef<HTMLInputElement>(null);
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  const tokens = useMemo(() => tokenizeQuery(value), [value]);
  const context = useMemo(
    () => (focused ? suggestAt(value, caret, fields) : null),
    [focused, value, caret, fields]
  );
  const suggestions = context?.suggestions ?? [];
  const showMenu = focused && suggestions.length > 0;

  function update(next: string, nextCaret: number) {
    onChange(next);
    if (onParsed) onParsed(parseQuery(next, fields));
    // Каретку ставим после кадра: значение ещё не применилось к DOM
    requestAnimationFrame(() => {
      input.current?.setSelectionRange(nextCaret, nextCaret);
      setCaret(nextCaret);
    });
  }

  function choose(option: QueryOption) {
    if (!context) return;
    const res = applySuggestion(value, context, option);
    update(res.text, res.caret);
    setActive(0);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (showMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        choose(suggestions[active]!);
        return;
      }
      if (e.key === "Escape") {
        setFocused(false);
        return;
      }
    }
    if (e.key === "Enter") onSubmit?.(value);
  }

  function syncCaret() {
    setCaret(input.current?.selectionStart ?? value.length);
  }

  return (
    <div className={cn("pl-query", className)}>
      <svg viewBox="0 0 24 24" className="pl-query__icon" fill="none" stroke="currentColor" aria-hidden>
        <circle cx="11" cy="11" r="7" strokeWidth="1.7" />
        <path d="M21 21l-4-4" strokeWidth="1.7" strokeLinecap="round" />
      </svg>

      {/* Подсветка чипов под прозрачным input: слой видно, но события ловит поле */}
      <div className="pl-query__highlight" aria-hidden>
        {renderHighlight(value, tokens, fields)}
      </div>

      <input
        ref={input}
        className="pl-query__input"
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          if (onParsed) onParsed(parseQuery(e.target.value, fields));
          setCaret(e.target.selectionStart ?? e.target.value.length);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        onKeyUp={syncCaret}
        onClick={syncCaret}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
      />

      {value && (
        <button
          type="button"
          className="pl-query__clear"
          aria-label="Очистить"
          onClick={() => update("", 0)}
        >
          ×
        </button>
      )}

      {showMenu && (
        <ul className="pl-query__menu pl-animate-pop-in" role="listbox">
          <li className="pl-query__menu-head">
            {context!.kind === "value" ? `Значение ${context!.key}` : "Поле"}
          </li>
          {suggestions.map((option, i) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                className={cn("pl-query__option", i === active && "pl-query__option--active")}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(option);
                }}
              >
                <span className="pl-query__option-value">{option.label ?? option.value}</span>
                {option.hint && <span className="pl-query__option-hint">{option.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Раскрашивает строку: ключ, значение и отрицание — разными цветами. */
function renderHighlight<T>(
  value: string,
  tokens: ReturnType<typeof tokenizeQuery>,
  fields: QueryField<T>[]
) {
  const known = new Set(fields.map((f) => f.key));
  const out: ReactNode[] = [];
  let at = 0;

  for (const token of tokens) {
    if (token.start > at) out.push(value.slice(at, token.start));
    at = token.end;

    if (token.kind === "text") {
      out.push(
        <span key={token.start} className="pl-query__t-text">
          {token.raw}
        </span>
      );
      continue;
    }

    const bad = !known.has(token.key!);
    out.push(
      <span
        key={token.start}
        className={cn("pl-query__chip", token.negated && "pl-query__chip--neg", bad && "pl-query__chip--bad")}
      >
        {token.raw}
      </span>
    );
  }

  if (at < value.length) out.push(value.slice(at));
  return out;
}
