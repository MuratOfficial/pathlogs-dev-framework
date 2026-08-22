"use client";

import { useEffect, useState } from "react";
import { activeSectionId, type SectionPosition } from "./sections.js";

export interface UseActiveSectionOptions {
  /**
   * Отступ сверху, ниже которого блок считается «доскроллили» —
   * обычно высота липкой панели. Функция, а не число: высота панели
   * зависит от ширины экрана и меняется на лету.
   */
  offset?: number | (() => number);
  enabled?: boolean;
}

/**
 * Подсветка активного раздела при прокрутке — и его же плавный показ по клику.
 *
 * ```tsx
 * const { active, scrollTo } = useActiveSection(["overview", "comments"], {
 *   offset: () => nav.current?.offsetHeight ?? 0,
 * });
 * ```
 *
 * Пересчёт привязан к requestAnimationFrame: событие прокрутки приходит
 * чаще, чем браузер рисует кадры, и считать позиции на каждое — впустую
 * дёргать layout.
 */
export function useActiveSection(
  ids: string[],
  { offset = 0, enabled = true }: UseActiveSectionOptions = {}
): { active: string; scrollTo: (id: string) => void } {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const key = ids.join(",");

  const resolveOffset = typeof offset === "function" ? offset : () => offset;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const list = key.split(",").filter(Boolean);
    let frame = 0;

    function recompute() {
      const positions: SectionPosition[] = [];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el) positions.push({ id, top: el.getBoundingClientRect().top });
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const next = activeSectionId(positions, resolveOffset() + 8, atBottom);
      if (next) setActive(next);
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(recompute);
    }

    recompute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // resolveOffset читается внутри и меняется вместе с offset — пересоздавать
    // подписку из-за нового замыкания незачем
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - resolveOffset()),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return { active, scrollTo };
}
