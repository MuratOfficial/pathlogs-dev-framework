"use client";

import { useCallback, useEffect, useRef } from "react";
import { attachDragScroll, type DragScrollOptions } from "./dragScrollBinding.js";

export type { DragScrollOptions };

/**
 * Прокрутка контейнера протяжкой мыши: зажали ленту, потянули — она едет за
 * курсором и по инерции доезжает после отпускания.
 *
 * Возвращает ref-колбэк:
 * ```tsx
 * <div ref={useDragScroll<HTMLDivElement>()} className="overflow-x-auto">…</div>
 * ```
 *
 * Вся механика — в attachDragScroll (там же её описание и тесты); здесь
 * только мост к React.
 */
export function useDragScroll<T extends HTMLElement>(options: DragScrollOptions = {}) {
  // Настройки читаем в момент события, а не привязки: смена оси или enabled
  // не должна пересоздавать ref-колбэк и переподписывать слушателей.
  const optsRef = useRef(options);
  useEffect(() => {
    optsRef.current = options;
  });

  // React 19 сам вызовет функцию очистки, когда элемент уйдёт из DOM
  return useCallback((node: T | null) => {
    if (!node) return;
    return attachDragScroll(node, () => optsRef.current);
  }, []);
}
