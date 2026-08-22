"use client";

import { useRef, useState, type ReactNode } from "react";
import { useDismiss } from "@pathlogs/hooks";
import { cn } from "./cn.js";

export interface MenuProps {
  /** Содержимое панели: готовые кнопки и ссылки, как есть. */
  children: ReactNode;
  /** Подпись кнопки. На узких экранах скрывается, остаётся иконка. */
  label?: string;
  /** Своя кнопка вместо стандартной «Ещё». Получает состояние открытости. */
  trigger?: (props: { open: boolean; toggle: () => void }) => ReactNode;
  /** Сколько действий спрятано — числом на кнопке. */
  count?: number;
  /** С какой стороны выпадает панель. */
  align?: "start" | "end";
  /** Подсказка на кнопке (data-tip). */
  tip?: string;
  className?: string;
}

/**
 * Складка для второстепенных действий: кнопка и выпадающая панель.
 *
 * Внутрь кладут готовые триггеры диалогов как есть — им не нужно ничего
 * знать про меню.
 *
 * Пока открыт диалог, меню не закрывается, и это не косметика: триггеры
 * живут внутри панели, а размонтирование панели уносило бы открытый диалог
 * с собой — окно не успевало бы появиться. За это отвечает `blockedBy`
 * в useDismiss: диалоги помечают своё затемнение атрибутом data-pl-overlay.
 */
export function Menu({
  children,
  label = "More",
  trigger,
  count,
  align = "end",
  tip,
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useDismiss(box, { enabled: open, onDismiss: () => setOpen(false) });

  const toggle = () => setOpen((v) => !v);

  return (
    <div ref={box} className={cn("pl-menu", className)}>
      {trigger ? (
        trigger({ open, toggle })
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="true"
          data-tip={open ? undefined : tip}
          className={cn("pl-menu__trigger", open && "pl-menu__trigger--open")}
        >
          <svg className="pl-menu__dots" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path d="M5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM11.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM18 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          <span className="pl-menu__label">{label}</span>
          {count ? <span className="pl-menu__count">{count}</span> : null}
        </button>
      )}

      {open && (
        <div
          role="menu"
          className={cn(
            "pl-menu__panel pl-animate-pop-in",
            align === "start" ? "pl-menu__panel--start" : "pl-menu__panel--end"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  /** Пункт разрушающего действия — красный. */
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Пункт-ссылка вместо кнопки. */
  href?: string;
}

/** Пункт меню. Ссылкой становится, когда задан href — чтобы работал Ctrl+клик. */
export function MenuItem({
  children,
  onClick,
  icon,
  tone = "default",
  disabled,
  href,
}: MenuItemProps) {
  const className = cn("pl-menu__item", tone === "danger" && "pl-menu__item--danger");

  if (href) {
    return (
      <a href={href} role="menuitem" className={className}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled} className={className}>
      {icon}
      {children}
    </button>
  );
}
