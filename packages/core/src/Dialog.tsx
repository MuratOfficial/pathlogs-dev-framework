"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Portal } from "./Portal.js";
import { cn } from "./cn.js";

/** Ширина окна. */
export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Видимый заголовок окна. Он же — доступное имя, если не задан `label`. */
  title?: string;
  /** Свой заголовок вместо строки `title`. */
  header?: ReactNode;
  /**
   * Доступное имя, когда видимого заголовка нет: окно рисует его само
   * (подтверждение, командная палитра), но скринридеру имя всё равно нужно.
   */
  label?: string;
  children: ReactNode;
  /** Полоса действий внизу окна. */
  footer?: ReactNode;
  size?: DialogSize;
  /** Клик по затемнению закрывает. По умолчанию да. */
  dismissOnBackdrop?: boolean;
  /** Escape закрывает. По умолчанию да. */
  dismissOnEscape?: boolean;
  /** Пока true, закрытие заблокировано — идёт сохранение. */
  busy?: boolean;
  /** Прижать окно к верху вместо центра (командная палитра, поиск). */
  align?: "center" | "top";
  className?: string;
}

const SIZES: Record<DialogSize, string> = {
  sm: "pl-dialog--sm",
  md: "pl-dialog--md",
  lg: "pl-dialog--lg",
  xl: "pl-dialog--xl",
};

/**
 * Модальное окно: затемнение, портал в body, ловушка фокуса, Escape.
 *
 * `data-pl-overlay` на затемнении — метка «поверх всего открыто окно».
 * По ней useDismiss не закрывает выпадающие меню: клик и Escape адресованы
 * окну, а закрытие меню унесло бы с собой сам диалог, отрисованный внутри.
 */
export function Dialog({
  open,
  onClose,
  title,
  header,
  label,
  children,
  footer,
  size = "md",
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  busy = false,
  align = "center",
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Кто был в фокусе до открытия: туда фокус и вернём при закрытии, иначе
  // после Escape клавиатура окажется в начале страницы.
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    // Фокус на первом интерактивном элементе, а если его нет — на самой
    // панели: без этого клавиатура остаётся на странице под затемнением.
    const focusable = panel?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    (focusable ?? panel)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && dismissOnEscape && !busy) {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      // Ловушка фокуса: Tab с последнего элемента уводит на первый, а не
      // в адресную строку и на страницу под окном.
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);

    // Страница под окном не должна прокручиваться: колесо над затемнением
    // иначе уезжает по контенту, и, закрыв окно, пользователь оказывается
    // не там, где был.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose, dismissOnEscape, busy]);

  if (!open) return null;

  return (
    <Portal>
      <div
        data-pl-overlay=""
        className={cn(
          "pl-overlay pl-animate-fade-in",
          align === "top" && "pl-overlay--top"
        )}
        onClick={(e) => {
          if (!dismissOnBackdrop || busy) return;
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label ?? title}
          tabIndex={-1}
          className={cn("pl-dialog pl-animate-pop-in", SIZES[size], className)}
        >
          {(header ?? title) && (
            <div className="pl-dialog__header">
              {header ?? <h2 className="pl-dialog__title">{title}</h2>}
            </div>
          )}
          <div className="pl-dialog__body">{children}</div>
          {footer && <div className="pl-dialog__footer">{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
