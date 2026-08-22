"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface UseDismissOptions {
  /** Пока false, слушатели не вешаются вовсе. */
  enabled: boolean;
  onDismiss: () => void;
  /** Escape закрывает. По умолчанию да. */
  escape?: boolean;
  /** Клик мимо закрывает. По умолчанию да. */
  outsideClick?: boolean;
  /**
   * Селектор «поверх меня открыто что-то ещё». Пока такой элемент есть
   * в документе, закрытие пропускается: клик и Escape адресованы ему.
   *
   * Зачем: триггеры диалогов часто живут внутри выпадающего меню, а сам
   * диалог рендерится порталом. Закрой меню — размонтируется и триггер,
   * и диалог уйдёт вместе с ним, не успев появиться.
   */
  blockedBy?: string;
}

/**
 * Закрытие всплывающего слоя по клику мимо и по Escape.
 *
 * ```tsx
 * const box = useRef<HTMLDivElement>(null);
 * useDismiss(box, { enabled: open, onDismiss: () => setOpen(false) });
 * ```
 */
export function useDismiss<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    enabled,
    onDismiss,
    escape = true,
    outsideClick = true,
    blockedBy = "[data-pl-overlay]",
  }: UseDismissOptions
): void {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!enabled) return;

    const blocked = () => Boolean(blockedBy && document.querySelector(blockedBy));

    function onPointerDown(e: MouseEvent) {
      if (!outsideClick || blocked()) return;
      const node = ref.current;
      if (node && !node.contains(e.target as Node)) onDismissRef.current();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!escape || e.key !== "Escape" || blocked()) return;
      onDismissRef.current();
    }

    // mousedown, а не click: иначе клик по кнопке снаружи успевал бы
    // отработать до закрытия и открывал бы слой заново.
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, escape, outsideClick, blockedBy, ref]);
}
