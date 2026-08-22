"use client";

import type { ReactNode } from "react";
import { useDragScroll, type DragScrollOptions } from "@pathlogs/hooks";
import { cn } from "./cn.js";

export interface DragScrollProps extends DragScrollOptions {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  role?: string;
}

/**
 * Контейнер с прокруткой протяжкой мыши — для мест, где своего клиентского
 * компонента нет: серверные страницы, ряды вкладок, широкие таблицы.
 *
 * Классы самой прокрутки (`overflow-x: auto` и прочее) задаёт вызывающий
 * код: компонент отвечает за поведение, а не за раскладку.
 */
export function DragScroll({
  children,
  className,
  axis,
  momentum,
  enabled,
  keyboard,
  ...rest
}: DragScrollProps) {
  const ref = useDragScroll<HTMLDivElement>({ axis, momentum, enabled, keyboard });

  return (
    <div ref={ref} className={cn(className)} {...rest}>
      {children}
    </div>
  );
}
