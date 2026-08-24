"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./cn.js";
import { fitSegments } from "./statusBarFit.js";

export interface StatusBarSegment {
  id: string;
  content: ReactNode;
  /** Важность: чем больше, тем позже сегмент убирают при нехватке ширины. */
  priority?: number;
  /** Никогда не прятать — обычно это статус соединения. */
  pinned?: boolean;
  /** Прижать к правому краю. */
  align?: "left" | "right";
  /** Действие по клику: подсветит сегмент как кнопку. */
  onClick?: () => void;
  tip?: string;
}

export interface StatusBarProps {
  segments: StatusBarSegment[];
  /** Зазор между сегментами (px) — должен совпадать с CSS. */
  gap?: number;
  className?: string;
}

/**
 * Нижняя полоса как в редакторах кода: сегменты, живые счётчики, состояние.
 *
 * На узком экране полоса не влезает целиком. Обрезать по краю нельзя —
 * первым исчезло бы то, что оказалось справа, а не наименее важное. Поэтому
 * приоритеты: `fitSegments` из `statusBarFit.ts` (под тестами) решает, что
 * показать, а что убрать в меню «ещё». Сегменты сначала измеряются скрытым
 * слоем, затем раскладываются по настоящей ширине.
 */
export function StatusBar({ segments, gap = 12, className }: StatusBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<Map<string, number>>(new Map());
  const [available, setAvailable] = useState(0);
  const [overflowOpen, setOverflowOpen] = useState(false);

  // Измеряем каждый сегмент скрытым слоем и следим за шириной полосы
  useLayoutEffect(() => {
    const measure = () => {
      const next = new Map<string, number>();
      measureRef.current?.querySelectorAll<HTMLElement>("[data-seg]").forEach((el) => {
        next.set(el.dataset.seg!, el.getBoundingClientRect().width);
      });
      setWidths(next);
      if (barRef.current) setAvailable(barRef.current.clientWidth);
    };
    measure();

    const observer = new ResizeObserver(measure);
    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, [segments]);

  const measured = segments.map((s) => ({
    id: s.id,
    width: widths.get(s.id) ?? 80,
    priority: s.priority ?? 0,
    pinned: s.pinned ?? false,
  }));

  const overflowWidth = 32;
  const fit = fitSegments(measured, available, { gap, overflowWidth });
  const shownIds = new Set(fit.shown.map((s) => s.id));

  const byId = new Map(segments.map((s) => [s.id, s]));
  const left = fit.shown.map((s) => byId.get(s.id)!).filter((s) => (s.align ?? "left") === "left");
  const right = fit.shown.map((s) => byId.get(s.id)!).filter((s) => s.align === "right");
  const hidden = segments.filter((s) => !shownIds.has(s.id));

  return (
    <div ref={barRef} className={cn("pl-statusbar", className)} role="status">
      {/* Скрытый слой измерения: те же сегменты, но не видны и не кликаются */}
      <div ref={measureRef} className="pl-statusbar__measure" aria-hidden>
        {segments.map((s) => (
          <span key={s.id} data-seg={s.id} className="pl-statusbar__seg">
            {s.content}
          </span>
        ))}
      </div>

      <div className="pl-statusbar__group">
        {left.map((s) => (
          <Segment key={s.id} segment={s} />
        ))}
      </div>

      <div className="pl-statusbar__group pl-statusbar__group--right">
        {right.map((s) => (
          <Segment key={s.id} segment={s} />
        ))}

        {hidden.length > 0 && (
          <div className="pl-statusbar__overflow">
            <button
              type="button"
              className="pl-statusbar__seg pl-statusbar__more"
              aria-label={`Ещё ${hidden.length}`}
              aria-expanded={overflowOpen}
              onClick={() => setOverflowOpen((v) => !v)}
              onBlur={() => setOverflowOpen(false)}
            >
              +{hidden.length}
            </button>
            {overflowOpen && (
              <div className="pl-statusbar__menu pl-animate-pop-in">
                {hidden.map((s) => (
                  <div key={s.id} className="pl-statusbar__menu-item">
                    {s.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Segment({ segment }: { segment: StatusBarSegment }) {
  const className = cn("pl-statusbar__seg", segment.onClick && "pl-statusbar__seg--button");
  if (segment.onClick) {
    return (
      <button type="button" className={className} data-tip={segment.tip} onClick={segment.onClick}>
        {segment.content}
      </button>
    );
  }
  return (
    <span className={className} data-tip={segment.tip}>
      {segment.content}
    </span>
  );
}
