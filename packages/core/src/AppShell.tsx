"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "./cn.js";

export interface AppShellProps {
  /** Содержимое бокового меню. */
  sidebar: ReactNode;
  children: ReactNode;
  /** Что показать в мобильной шапке рядом с гамбургером: логотип, название. */
  brand?: ReactNode;
  /** Доступное имя кнопки-гамбургера. */
  menuLabel?: string;
  className?: string;
}

/**
 * Оболочка приложения с адаптивным сайдбаром: на широких экранах —
 * статичный, на узких — выезжающий drawer с шапкой и гамбургером.
 *
 * Точка перелома (1024px) живёт в CSS, а не в JS: медиазапрос отрабатывает
 * до первой отрисовки, а проверка ширины в эффекте дала бы кадр
 * со свёрнутым сайдбаром на десктопе.
 */
export function AppShell({ sidebar, children, brand, menuLabel = "Open menu", className }: AppShellProps) {
  const [open, setOpen] = useState(false);

  // Открытый drawer перекрывает страницу — прокручивать её под ним незачем
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className={cn("pl-shell", className)}>
      <header className="pl-shell__topbar">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={menuLabel}
          aria-expanded={open}
          className="pl-shell__burger"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        {brand}
      </header>

      {open && (
        <div
          className="pl-shell__scrim pl-animate-fade-in"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        // Клик по любой ссылке внутри закрывает drawer: переход по ссылке
        // на мобильном всегда означает, что меню больше не нужно
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className={cn("pl-shell__sidebar", open && "pl-shell__sidebar--open")}
      >
        {sidebar}
      </aside>

      <main className="pl-shell__main">{children}</main>
    </div>
  );
}
