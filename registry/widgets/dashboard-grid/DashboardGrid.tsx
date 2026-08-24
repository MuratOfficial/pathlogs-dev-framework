"use client";

import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  cellToPixel,
  compact,
  gridHeight,
  moveItem,
  pixelToCell,
  resizeItem,
  type GridItem,
} from "./gridLayout";

export interface DashboardGridProps {
  items: GridItem[];
  onItemsChange: (items: GridItem[]) => void;
  /** Отрисовка плитки по её id. */
  children: (item: GridItem) => ReactNode;
  /** Число колонок. */
  columns?: number;
  /** Высота строки (px). */
  rowHeight?: number;
  /** Зазор между плитками (px). */
  gap?: number;
  /** Разрешить менять размер плиток за угол. */
  resizable?: boolean;
  className?: string;
}

type Gesture =
  | { kind: "move"; id: string; startX: number; startY: number; origin: GridItem }
  | { kind: "resize"; id: string; startX: number; startY: number; origin: GridItem };

/**
 * Плиточная сетка с перетаскиванием и ресайзом — мини-grid-layout.
 *
 * Плитки живут в целочисленной сетке; двигаешь одну — она расталкивает
 * соседей, освободилось место — всё оседает вверх. Упаковка, разрешение
 * коллизий и сжатие — в `gridLayout.ts` под тестами (логика того же класса,
 * что `kanbanOrder`). Здесь — измерение ширины колонки и жесты мыши.
 */
export function DashboardGrid({
  items,
  onItemsChange,
  children: renderItem,
  columns = 12,
  rowHeight = 80,
  gap = 12,
  resizable = true,
  className,
}: DashboardGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(0);
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [preview, setPreview] = useState<GridItem[] | null>(null);

  // Ширина колонки зависит от ширины контейнера — меряем и следим за ресайзом
  useLayoutEffect(() => {
    const measure = () => {
      const width = ref.current?.clientWidth ?? 0;
      setCellWidth((width - gap * (columns - 1)) / columns);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [columns, gap]);

  const shown = preview ?? items;
  const height = gridHeight(shown, rowHeight, gap);

  function onPointerDown(e: ReactPointerEvent, item: GridItem, kind: "move" | "resize") {
    if (item.static) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setGesture({ kind, id: item.id, startX: e.clientX, startY: e.clientY, origin: item });
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (!gesture) return;
    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    if (gesture.kind === "move") {
      // Пиксельный сдвиг переводим в клетки и раскладываем предпросмотр
      const cell = pixelToCell(
        gesture.origin.x * (cellWidth + gap) + dx,
        gesture.origin.y * (rowHeight + gap) + dy,
        cellWidth,
        rowHeight,
        gap
      );
      setPreview(moveItem(items, gesture.id, cell, columns));
    } else {
      const w = Math.max(1, Math.round((gesture.origin.w * cellWidth + dx) / (cellWidth + gap)));
      const h = Math.max(1, Math.round((gesture.origin.h * rowHeight + dy) / (rowHeight + gap)));
      setPreview(resizeItem(items, gesture.id, { w, h }, columns));
    }
  }

  function endGesture() {
    if (preview) onItemsChange(compact(preview));
    setGesture(null);
    setPreview(null);
  }

  return (
    <div
      ref={ref}
      className={`relative ${className ?? ""}`}
      style={{ height, minHeight: rowHeight }}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerLeave={endGesture}
    >
      {cellWidth > 0 &&
        shown.map((item) => {
          const box = cellToPixel(item, cellWidth, rowHeight, gap);
          const dragging = gesture?.id === item.id;
          return (
            <div
              key={item.id}
              className={`absolute overflow-hidden rounded-xl border bg-surface transition-[left,top,width,height] ${
                dragging ? "z-10 border-accent shadow-lg duration-0" : "border-edge shadow-sm duration-150"
              } ${item.static ? "opacity-90" : ""}`}
              style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
            >
              <div
                className={`h-full ${item.static ? "" : "cursor-grab active:cursor-grabbing"}`}
                onPointerDown={(e) => onPointerDown(e, item, "move")}
              >
                {renderItem(item)}
              </div>

              {resizable && !item.static && (
                <span
                  onPointerDown={(e) => onPointerDown(e, item, "resize")}
                  className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
                  aria-hidden
                >
                  <svg viewBox="0 0 10 10" className="h-full w-full text-muted/60">
                    <path d="M9 1v8H1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
    </div>
  );
}
