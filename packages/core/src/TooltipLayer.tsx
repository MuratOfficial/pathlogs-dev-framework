"use client";

import { useEffect, useState } from "react";
import { Portal } from "./Portal.js";

interface TipState {
  text: string;
  /** Центр якоря по горизонтали. */
  x: number;
  /** Точка привязки по вертикали: верх или низ якоря. */
  y: number;
  placement: "top" | "bottom";
}

export interface TooltipLayerProps {
  /**
   * Атрибут-якорь. Любой элемент с непустым значением получает подсказку —
   * ни оборачивать его, ни импортировать компонент не нужно.
   */
  attribute?: string;
  /** Предельная ширина бабла (px). */
  maxWidth?: number;
  /** Зазор между якорем и баблом (px). */
  gap?: number;
}

/**
 * Один глобальный тултип на всё приложение: ставится один раз в корне,
 * дальше подсказку получает любой элемент с атрибутом `data-tip`.
 *
 * ```tsx
 * <TooltipLayer />
 * <button data-tip="Архивировать проект">…</button>
 * ```
 *
 * Почему так, а не компонент-обёртка на каждую подсказку: бабл рендерится
 * порталом с position: fixed и поэтому НЕ обрезается контейнерами с
 * overflow — колонками, лентами, прокручиваемыми списками. Обёртка же
 * рисовала бы его внутри такого контейнера.
 */
export function TooltipLayer({
  attribute = "data-tip",
  maxWidth = 220,
  gap = 8,
}: TooltipLayerProps = {}) {
  const [tip, setTip] = useState<TipState | null>(null);

  useEffect(() => {
    const selector = `[${attribute}]`;
    let current: HTMLElement | null = null;

    function show(el: HTMLElement) {
      const text = el.getAttribute(attribute);
      if (!text) return;
      const r = el.getBoundingClientRect();
      // По умолчанию над элементом; если сверху мало места — снизу
      const placement: "top" | "bottom" = r.top < 56 ? "bottom" : "top";
      current = el;
      setTip({
        text,
        x: r.left + r.width / 2,
        y: placement === "top" ? r.top - gap : r.bottom + gap,
        placement,
      });
    }

    function hide(el?: EventTarget | null) {
      if (el && el !== current) return;
      current = null;
      setTip(null);
    }

    function onOver(e: Event) {
      const el = (e.target as HTMLElement)?.closest?.(selector) as HTMLElement | null;
      if (el?.getAttribute(attribute)) show(el);
    }

    function onOut(e: Event) {
      const el = (e.target as HTMLElement)?.closest?.(selector) as HTMLElement | null;
      if (!el || el !== current) return;
      // Переход на дочерний элемент того же якоря не должен скрывать подсказку
      const related = (e as MouseEvent).relatedTarget as Node | null;
      if (related && el.contains(related)) return;
      hide(el);
    }

    // Координаты fixed устаревают при прокрутке и ресайзе — просто прячем
    function onScrollOrResize() {
      hide(current);
    }

    /**
     * Доступность: нативный title читают скринридеры, а свой атрибут — нет.
     * Иконочным элементам (без видимого текста и без своего aria-label)
     * дублируем подсказку в aria-label. Элементы с текстом не трогаем —
     * их доступным именем уже служит видимый текст.
     */
    function labelOne(el: Element) {
      const text = el.getAttribute(attribute);
      if (!text || el.hasAttribute("aria-label")) return;
      if ((el.textContent ?? "").trim() !== "") return;
      el.setAttribute("aria-label", text);
    }
    function labelTree(root: Element) {
      if (root.matches?.(selector)) labelOne(root);
      root.querySelectorAll?.(selector).forEach(labelOne);
    }
    labelTree(document.body);

    // Элементы появляются динамически — навешиваем и на новые узлы
    const observer = new MutationObserver((records) => {
      for (const rec of records) {
        rec.addedNodes.forEach((n) => {
          if (n.nodeType === 1) labelTree(n as Element);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("focusin", onOver);
    document.addEventListener("focusout", onOut);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("focusin", onOver);
      document.removeEventListener("focusout", onOut);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      observer.disconnect();
    };
  }, [attribute, gap]);

  if (!tip) return null;

  // Удерживаем бабл в пределах вьюпорта по горизонтали. Если ширина окна
  // почему-то недоступна, клампить не пытаемся — иначе подсказка уехала бы
  // за экран вместо того, чтобы остаться на месте.
  const half = maxWidth / 2;
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const x = vw > maxWidth ? Math.min(Math.max(tip.x, half + 6), vw - half - 6) : tip.x;

  return (
    <Portal>
      <div
        role="tooltip"
        className="pl-tooltip pl-animate-fade-in"
        style={{
          left: x,
          top: tip.y,
          maxWidth,
          transform: `translate(-50%, ${tip.placement === "top" ? "-100%" : "0"})`,
        }}
      >
        {tip.text}
      </div>
    </Portal>
  );
}
