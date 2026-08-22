"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useHotkeys } from "@pathlogs/hooks";
import { Dialog } from "./Dialog.js";
import { cn } from "./cn.js";

export interface CommandItem {
  id: string;
  title: string;
  /** Заголовок раздела. Пункты группируются в порядке их следования. */
  group?: string;
  /** Короткая метка слева: ключ проекта, номер задачи. */
  badge?: string;
  /** Подсказка справа: горячая клавиша пункта. */
  hint?: string;
  icon?: ReactNode;
  /** Дополнительный текст для поиска, не показывается. */
  keywords?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  /**
   * Пункты, всегда доступные без запроса к серверу: разделы приложения,
   * команды. Фильтруются на месте по заголовку и keywords.
   */
  items?: CommandItem[];
  /**
   * Источник результатов с сервера. Вызывается с задержкой после ввода;
   * ошибку не показываем — палитра остаётся с локальными пунктами.
   */
  search?: (query: string) => Promise<CommandItem[]>;
  /** Задержка перед запросом (мс). */
  debounce?: number;
  /** Горячая клавиша открытия. null — палитра только под внешним управлением. */
  hotkey?: string | null;
  /** Внешнее управление: без него палитра держит состояние сама. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: {
    placeholder?: string;
    empty?: string;
    navigate?: string;
    select?: string;
  };
}

/** Совпадение по заголовку или скрытым ключевым словам. */
function matches(item: CommandItem, query: string): boolean {
  if (!query) return true;
  const haystack = `${item.title} ${item.keywords ?? ""}`.toLowerCase();
  return haystack.includes(query);
}

/**
 * Командная палитра (⌘K / Ctrl+K): переход и команды по одному запросу.
 *
 * Источник данных — не её забота: локальные пункты приходят пропом,
 * серверные отдаёт `search`. Поэтому одна и та же палитра обслуживает
 * и статичное меню, и полнотекстовый поиск по базе.
 */
export function CommandPalette({
  items = [],
  search,
  debounce = 150,
  hotkey = "mod+k",
  open: controlledOpen,
  onOpenChange,
  labels,
}: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<CommandItem[]>([]);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  function setOpen(next: boolean) {
    if (next) {
      // Сброс делаем в момент открытия, а не в эффекте: иначе на кадр
      // видно прошлый запрос и прошлые результаты
      setQuery("");
      setActive(0);
      setRemote([]);
    }
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  useHotkeys(
    hotkey
      ? [{ keys: hotkey, allowInInput: true, handler: () => setOpen(!open) }]
      : []
  );

  // Запрос к серверу с задержкой: пока пользователь печатает, промежуточные
  // подстроки никому не нужны
  useEffect(() => {
    if (!open || !search) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      search(query)
        .then((results) => {
          if (cancelled) return;
          setRemote(results);
          setActive(0);
        })
        .catch(() => {
          // источник недоступен — остаются локальные пункты
        });
    }, debounce);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, search, debounce]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...items.filter((it) => matches(it, q)), ...remote];
  }, [items, remote, query]);

  function select(item?: CommandItem) {
    const it = item ?? visible[active];
    if (!it) return;
    setOpen(false);
    it.onSelect();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select();
    }
  }

  // Выбранный пункт держим в зоне видимости: стрелками список листают,
  // не глядя на полосу прокрутки
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  let lastGroup = "";

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      label={labels?.placeholder ?? "Command palette"}
      size="lg"
      align="top"
      className="pl-cmdk"
    >
      <div className="pl-cmdk__search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={labels?.placeholder ?? "Search…"}
          className="pl-cmdk__input"
        />
        <kbd className="pl-kbd pl-cmdk__esc">Esc</kbd>
      </div>

      <div ref={listRef} className="pl-cmdk__list">
        {visible.length === 0 ? (
          <p className="pl-cmdk__empty">{labels?.empty ?? "Nothing found"}</p>
        ) : (
          visible.map((it, i) => {
            const showGroup = Boolean(it.group) && it.group !== lastGroup;
            lastGroup = it.group ?? lastGroup;
            return (
              <div key={it.id}>
                {showGroup && <p className="pl-cmdk__group">{it.group}</p>}
                <button
                  type="button"
                  data-idx={i}
                  // Наведение мышью выбирает пункт: клавиатура и мышь ведут
                  // один и тот же курсор, а не спорят за него
                  onMouseMove={() => setActive(i)}
                  onClick={() => select(it)}
                  className={cn("pl-cmdk__item", i === active && "pl-cmdk__item--active")}
                >
                  {it.badge && <span className="pl-cmdk__badge">{it.badge}</span>}
                  {it.icon}
                  <span className="pl-cmdk__title">{it.title}</span>
                  {it.hint && <kbd className="pl-kbd">{it.hint}</kbd>}
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="pl-cmdk__footer">
        <span>
          <kbd className="pl-kbd">↑</kbd>
          <kbd className="pl-kbd">↓</kbd>
          {labels?.navigate ?? "navigate"}
        </span>
        <span>
          <kbd className="pl-kbd">↵</kbd>
          {labels?.select ?? "open"}
        </span>
      </div>
    </Dialog>
  );
}
