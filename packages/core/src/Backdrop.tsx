import { backdropCss, type SurfaceBackdrop } from "@pathlogs/tokens";
import { cn } from "./cn.js";

export interface BackdropProps {
  backdrop: SurfaceBackdrop | null | undefined;
  className?: string;
}

/**
 * Цветная подложка страницы: мягкое пятно вверху или градиент во всю ширину.
 *
 * Рисуется fixed за контентом и не перехватывает указатель — по ней можно
 * выделять текст и кликать сквозь неё. Цвета полупрозрачные, поэтому одна
 * и та же подложка работает в обеих темах.
 */
export function Backdrop({ backdrop, className }: BackdropProps) {
  if (!backdrop) return null;

  return (
    <div
      aria-hidden
      className={cn("pl-backdrop", className)}
      style={{ background: backdropCss(backdrop) }}
    />
  );
}
