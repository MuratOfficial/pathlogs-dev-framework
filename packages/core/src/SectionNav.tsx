"use client";

import { useRef } from "react";
import { useActiveSection, useDragScroll } from "@toimetdev/pathlogs-hooks";
import { cn } from "./cn.js";

export interface NavSection {
  /** id элемента-раздела на странице. */
  id: string;
  label: string;
  /** Число элементов внутри — бейджем справа от названия. */
  count?: number;
}

export interface SectionNavProps {
  sections: NavSection[];
  "aria-label"?: string;
  className?: string;
}

/**
 * Липкая навигация по разделам длинной страницы: клик прокручивает к блоку,
 * активный пункт подсвечивается по мере чтения.
 *
 * Отступ прокрутки берём у самой панели (её `top` из CSS плюс высота),
 * а не константой: панель липнет под шапкой на узких экранах и к верху
 * окна на широких, и жёсткое число промахнулось бы в одном из случаев.
 */
export function SectionNav({ sections, className, ...rest }: SectionNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  // Узкий экран: ряд разделов листается протяжкой. Клик при этом работает —
  // протяжка включается только после порога сдвига.
  const stripRef = useDragScroll<HTMLElement>();

  function offset() {
    const el = navRef.current;
    if (!el) return 0;
    const stickyTop = parseFloat(getComputedStyle(el).top) || 0;
    return stickyTop + el.offsetHeight + 12;
  }

  const { active, scrollTo } = useActiveSection(
    sections.map((s) => s.id),
    { offset }
  );

  return (
    <div ref={navRef} className={cn("pl-sectionnav", className)}>
      <nav ref={stripRef} aria-label={rest["aria-label"]} className="pl-sectionnav__strip pl-no-scrollbar">
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              aria-current={on ? "true" : undefined}
              className={cn("pl-sectionnav__item", on && "pl-sectionnav__item--active")}
            >
              {s.label}
              {s.count !== undefined && <span className="pl-sectionnav__count">{s.count}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
