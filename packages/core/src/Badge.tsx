import type { ReactNode } from "react";
import { alpha, readableTextOn } from "@pathlogs/tokens";
import { cn } from "./cn.js";

export interface BadgeProps {
  children: ReactNode;
  /**
   * Цвет метки в #rrggbb. Фон и текст выводятся из него: заливка
   * полупрозрачная, а сам цвет идёт в текст — так метка читается
   * и в тёмной теме, и в светлой, не заводя двух палитр.
   */
  color?: string;
  /** Плотный вариант: цвет заливкой, текст контрастный. */
  solid?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** Подсказка при наведении. */
  tip?: string;
}

/** Метка-«пилюля»: тип, статус, тег. */
export function Badge({ children, color, solid = false, size = "sm", className, tip }: BadgeProps) {
  const style = color
    ? solid
      ? { backgroundColor: color, color: readableTextOn(color) }
      : { backgroundColor: alpha(color, 0.15), color }
    : undefined;

  return (
    <span
      data-tip={tip}
      style={style}
      className={cn("pl-badge", size === "md" && "pl-badge--md", !color && "pl-badge--plain", className)}
    >
      {children}
    </span>
  );
}

export interface LevelMeterProps {
  /** Текущий уровень, начиная с 1. */
  level: number;
  /** Сколько столбиков всего. */
  levels?: number;
  color: string;
  /** Подпись для подсказки и скринридера: «Приоритет: высокий». */
  label: string;
  className?: string;
}

/**
 * Шкала уровня: возрастающие столбики, заполненные до текущего значения.
 *
 * Для приоритетов и подобных порядковых величин это честнее цветной точки:
 * точка передаёт только «какой», а шкала — ещё и «насколько», причём
 * не одним лишь цветом.
 */
export function LevelMeter({ level, levels = 4, color, label, className }: LevelMeterProps) {
  return (
    <span
      role="img"
      data-tip={label}
      aria-label={label}
      className={cn("pl-level", className)}
    >
      {Array.from({ length: levels }, (_, i) => i + 1).map((i) => (
        <span
          key={i}
          className="pl-level__bar"
          style={{
            height: 4 + i * 2.5,
            backgroundColor: i <= level ? color : "var(--border)",
          }}
        />
      ))}
    </span>
  );
}
