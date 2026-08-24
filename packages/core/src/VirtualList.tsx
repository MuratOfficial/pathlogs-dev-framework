"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "./cn.js";
import { useVirtual } from "@toimetdev/pathlogs-hooks";

export interface VirtualListProps<T> {
  items: T[];
  /** Отрисовка одного элемента по значению и индексу. */
  children: (item: T, index: number) => ReactNode;
  /** Ключ элемента. По умолчанию — индекс (годится только для стабильных списков). */
  itemKey?: (item: T, index: number) => string | number;
  /** Ожидаемая высота элемента (px) — первое приближение до измерения. */
  estimateSize?: number | ((index: number) => number);
  /** Запас строк за краями окна. */
  overscan?: number;
  /** Прилипать к концу при новых элементах — для логов и чатов. */
  stickToBottom?: boolean;
  /** Высота области прокрутки. */
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Оконный рендер длинного списка: в DOM живёт только видимая часть.
 *
 * На десяти тысячах строк обычный `map` кладёт вкладку — столько узлов
 * браузер не тянет. Вся механика окна, измерения переменных высот и прыжка
 * к элементу — в хуке `useVirtual` (логика — в `virtual.ts` под тестами).
 * Высоты не обязаны совпадать: `estimateSize` только первое приближение,
 * дальше каждый элемент сообщает свою настоящую высоту.
 */
export function VirtualList<T>({
  items,
  children,
  itemKey,
  estimateSize = 40,
  overscan = 4,
  stickToBottom = false,
  height = 360,
  className,
  style,
}: VirtualListProps<T>) {
  const v = useVirtual({ count: items.length, estimateSize, overscan, stickToBottom });

  return (
    <div
      ref={v.scrollRef}
      className={cn("pl-vlist", className)}
      style={{ height, overflow: "auto", position: "relative", ...style }}
    >
      <div style={{ height: v.totalSize, position: "relative", width: "100%" }}>
        {v.items.map((row) => {
          const item = items[row.index]!;
          return (
            <div
              key={itemKey ? itemKey(item, row.index) : row.index}
              ref={v.measure(row.index)}
              className="pl-vlist__row"
              style={{ position: "absolute", top: row.start, left: 0, width: "100%" }}
            >
              {children(item, row.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
