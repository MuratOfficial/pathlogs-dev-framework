import type { ReactNode } from "react";
import { cn } from "./cn.js";

export interface PageHintProps {
  children: ReactNode;
  className?: string;
}

/**
 * Подсказка-субтитул под заголовком: акцентная полоса слева и иконка.
 *
 * Отдельный блок, а не обычный абзац: набранное тем же кеглем пояснение
 * читается как продолжение текста страницы и теряется, а полоса
 * и приглушённый цвет сразу говорят «это пояснение».
 */
export function PageHint({ children, className }: PageHintProps) {
  return <p className={cn("pl-hint", className)}>{children}</p>;
}
