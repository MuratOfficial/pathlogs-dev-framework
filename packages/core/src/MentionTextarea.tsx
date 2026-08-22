"use client";

import { useRef, useState } from "react";
import { Avatar, type AvatarPerson } from "./Avatar.js";
import { cn } from "./cn.js";

export interface MentionTextareaProps {
  /** Имя поля в форме. */
  name: string;
  people: AvatarPerson[];
  /**
   * Имя скрытого поля со списком id упомянутых (через запятую).
   * Именно id, а не текст: уведомления не должны зависеть от того,
   * не переименовали ли человека после отправки комментария.
   */
  mentionsName?: string;
  /** Сколько вариантов показывать. */
  limit?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Поле ввода с автодополнением @упоминаний.
 *
 * Меню открывается на «@» и закрывается на пробеле; Enter и Tab вставляют
 * первый вариант. Вставка идёт мимо onChange, поэтому курсор возвращается
 * за вставленное имя, а не прыгает в конец текста.
 */
export function MentionTextarea({
  name,
  people,
  mentionsName = "mentions",
  limit = 6,
  value: controlledValue,
  onValueChange,
  placeholder,
  rows = 2,
  autoFocus,
  className,
}: MentionTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [uncontrolled, setUncontrolled] = useState("");
  const value = controlledValue ?? uncontrolled;

  const [mentioned, setMentioned] = useState<Set<string>>(new Set());
  /** Текст после «@». null — меню закрыто. */
  const [query, setQuery] = useState<string | null>(null);
  const [atPos, setAtPos] = useState(0);

  function setValue(next: string) {
    if (controlledValue === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }

  const matches =
    query === null
      ? []
      : people
          .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, limit);

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    setValue(next);

    // Ищем «@» перед курсором, у которого в хвосте нет пробела: иначе меню
    // всплывало бы посреди уже дописанного предложения
    const caret = e.target.selectionStart ?? next.length;
    const m = /@([^\s@]*)$/.exec(next.slice(0, caret));
    if (m) {
      setAtPos(caret - m[1]!.length - 1);
      setQuery(m[1]!);
    } else {
      setQuery(null);
    }
  }

  function pick(person: AvatarPerson) {
    const ta = ref.current;
    if (!ta) return;
    const caret = ta.selectionStart ?? value.length;
    const next = `${value.slice(0, atPos)}@${person.name} ${value.slice(caret)}`;
    setValue(next);
    setMentioned((prev) => new Set(prev).add(person.id));
    setQuery(null);

    // Курсор ставим после кадра: React ещё не применил новое значение,
    // и setSelectionRange сейчас указал бы в старый текст
    requestAnimationFrame(() => {
      ta.focus();
      const pos = atPos + person.name.length + 2;
      ta.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="pl-mention">
      <input type="hidden" name={mentionsName} value={[...mentioned].join(",")} />
      <textarea
        ref={ref}
        name={name}
        value={value}
        rows={rows}
        autoFocus={autoFocus}
        onChange={onChange}
        onKeyDown={(e) => {
          if (query !== null && matches.length > 0 && (e.key === "Enter" || e.key === "Tab")) {
            e.preventDefault();
            pick(matches[0]!);
          }
          if (e.key === "Escape") setQuery(null);
        }}
        placeholder={placeholder}
        className={cn("pl-input pl-mention__field", className)}
      />

      {query !== null && matches.length > 0 && (
        <ul className="pl-mention__menu pl-animate-pop-in">
          {matches.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                // mousedown, а не click: click пришёл бы после blur, и поле
                // успело бы закрыть меню до вставки
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(p);
                }}
                className="pl-mention__option"
              >
                <Avatar person={p} size="xs" tip={false} />
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
