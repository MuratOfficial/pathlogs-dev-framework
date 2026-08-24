"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  buildOffsets,
  isAtBottom,
  scrollOffsetFor,
  virtualItems,
  virtualWindow,
  type ScrollAlign,
  type VirtualItem,
} from "./virtual.js";

export interface UseVirtualOptions {
  /** Сколько всего элементов. */
  count: number;
  /**
   * Ожидаемая высота элемента (px). Достаточно приблизительной: реальные
   * высоты подменяются по мере измерения через `measure`.
   */
  estimateSize: number | ((index: number) => number);
  /** Запас строк за краями окна. */
  overscan?: number;
  /** Прилипать к концу списка при появлении новых элементов — для логов и чатов. */
  stickToBottom?: boolean;
}

export interface UseVirtualResult {
  /** Элементы, которые нужно отрисовать. */
  items: VirtualItem[];
  /** Полная высота списка — на неё растягивается внутренняя обёртка. */
  totalSize: number;
  paddingStart: number;
  paddingEnd: number;
  /** Ref на прокручиваемый контейнер. */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Ref-колбэк на элемент: включает измерение его реальной высоты. */
  measure: (index: number) => (node: HTMLElement | null) => void;
  scrollToIndex: (index: number, align?: ScrollAlign) => void;
  scrollToBottom: () => void;
  /** Список сейчас у самого низа — по этому флагу рисуют кнопку «вниз». */
  atBottom: boolean;
}

/**
 * Оконный рендер длинного списка: в DOM живёт только видимая часть.
 *
 * ```tsx
 * const v = useVirtual({ count: rows.length, estimateSize: 36 });
 *
 * <div ref={v.scrollRef} style={{ overflow: "auto", height: 400 }}>
 *   <div style={{ height: v.totalSize, position: "relative" }}>
 *     {v.items.map((it) => (
 *       <div key={it.index} ref={v.measure(it.index)}
 *            style={{ position: "absolute", top: it.start, width: "100%" }}>
 *         {rows[it.index].title}
 *       </div>
 *     ))}
 *   </div>
 * </div>
 * ```
 *
 * Высоты не обязаны быть одинаковыми: `estimateSize` — только первое
 * приближение, дальше каждый отрисованный элемент сообщает свою настоящую
 * высоту через `measure`. Поэтому список из строк разной длины не «дёргается»
 * после первого прохода.
 */
export function useVirtual({
  count,
  estimateSize,
  overscan = 3,
  stickToBottom = false,
}: UseVirtualOptions): UseVirtualResult {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(0);
  const [atBottom, setAtBottom] = useState(true);

  /**
   * Измеренные высоты. Версия отдельным числом, потому что мутировать Map
   * дешевле, чем пересобирать её на каждое измерение: за один кадр
   * отчитываются десятки элементов сразу.
   */
  const measured = useRef(new Map<number, number>());
  const [version, setVersion] = useState(0);

  const offsets = useMemo(() => {
    const estimate = typeof estimateSize === "function" ? estimateSize : () => estimateSize;
    return buildOffsets(count, (i) => measured.current.get(i) ?? estimate(i));
    // version участвует намеренно: новые измерения обязаны пересобрать смещения
  }, [count, estimateSize, version]);

  const window_ = useMemo(
    () => virtualWindow(offsets, scrollTop, viewport, overscan),
    [offsets, scrollTop, viewport, overscan]
  );
  const items = useMemo(() => virtualItems(offsets, window_), [offsets, window_]);

  // Прокрутка и размер вьюпорта
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    let frame = 0;
    function onScroll() {
      // Событий прокрутки приходит больше, чем кадров: без склейки в rAF
      // React пересчитывал бы окно по несколько раз на кадр впустую
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = scrollRef.current;
        if (!el) return;
        setScrollTop(el.scrollTop);
        setAtBottom(isAtBottom(el.scrollTop, el.scrollHeight, el.clientHeight));
      });
    }

    const observer = new ResizeObserver(() => setViewport(node.clientHeight));
    observer.observe(node);
    setViewport(node.clientHeight);

    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const measure = useCallback((index: number) => {
    return (node: HTMLElement | null) => {
      if (!node) return;
      const size = node.getBoundingClientRect().height;
      if (size <= 0) return;
      // Округляем: дробные высоты от масштабирования страницы иначе
      // отличались бы на 0.0001 каждый кадр и крутили бы перерисовку
      const rounded = Math.round(size * 100) / 100;
      if (measured.current.get(index) === rounded) return;
      measured.current.set(index, rounded);
      setVersion((v) => v + 1);
    };
  }, []);

  // Количество изменилось — измерения хвоста больше не про те же элементы
  useEffect(() => {
    let dirty = false;
    for (const index of measured.current.keys()) {
      if (index >= count) {
        measured.current.delete(index);
        dirty = true;
      }
    }
    if (dirty) setVersion((v) => v + 1);
  }, [count]);

  const scrollToIndex = useCallback(
    (index: number, align: ScrollAlign = "auto") => {
      const node = scrollRef.current;
      if (!node) return;
      node.scrollTop = scrollOffsetFor(offsets, index, node.clientHeight, node.scrollTop, align);
    },
    [offsets]
  );

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, []);

  /**
   * Прилипание к хвосту. Только когда пользователь и так был внизу:
   * иначе новая строка утаскивала бы его от места, которое он читает.
   *
   * useLayoutEffect, а не useEffect: браузер не должен успеть показать кадр
   * со старой прокруткой, иначе хвост дёргается на каждой новой строке.
   */
  useLayoutEffect(() => {
    if (!stickToBottom || !atBottom) return;
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [stickToBottom, atBottom, count]);

  return {
    items,
    totalSize: window_.totalSize,
    paddingStart: window_.paddingStart,
    paddingEnd: window_.paddingEnd,
    scrollRef,
    measure,
    scrollToIndex,
    scrollToBottom,
    atBottom,
  };
}
