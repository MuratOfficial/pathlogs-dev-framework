"use client";

import { useEffect, useReducer, useRef, type ReactNode } from "react";
import {
  applyPresence,
  emptyPresence,
  initials,
  interpolate,
  pruneStale,
  visibleCursors,
  type Participant,
  type PresenceEvent,
} from "./presence";

export interface PresenceLayerProps {
  /**
   * Поток событий присутствия. Обычно приходит по SSE через `useEventStream`;
   * компонент лишь сглаживает и рисует то, что накопилось.
   */
  events: PresenceEvent[];
  /** Свой актор — его курсор не рисуется. */
  selfId?: string;
  /** Через сколько миллисекунд молчания убирать курсор. */
  ttlMs?: number;
  /** Плавность догона (0..1): меньше — плавнее и медленнее. */
  smoothing?: number;
  /** Поверх чего лежит слой. Обычно absolute-обёртка над доской или канвой. */
  children?: ReactNode;
  className?: string;
}

/**
 * Курсоры соучастников поверх поверхности — как в Figma и мультиплеере.
 *
 * События приходят по сети рывками: то три за кадр, то тишина. Показывать
 * их как есть — дёргающиеся курсоры и «призраки», зависшие после ухода
 * человека. Сглаживание, устаревание по TTL и устойчивый цвет по id — в
 * `presence.ts` под тестами; здесь — кадровый цикл и отрисовка.
 */
export function PresenceLayer({
  events,
  selfId,
  ttlMs = 15_000,
  smoothing = 0.2,
  children,
  className,
}: PresenceLayerProps) {
  const stateRef = useRef(emptyPresence());
  const seenRef = useRef(0);
  const lastFrame = useRef(0);
  const [, force] = useReducer((n) => n + 1, 0);

  // Вносим новые события. Индекс просмотренных, чтобы не переигрывать поток
  const unseen = events.slice(seenRef.current);
  if (unseen.length > 0) {
    for (const event of unseen) stateRef.current = applyPresence(stateRef.current, event, selfId);
    seenRef.current = events.length;
  }

  // Один кадровый цикл двигает курсоры к целям и вычищает молчунов
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      const dt = lastFrame.current ? t - lastFrame.current : 16;
      lastFrame.current = t;

      const moved = interpolate(stateRef.current, dt, smoothing);
      const pruned = pruneStale(moved, Date.now(), ttlMs);
      if (pruned !== stateRef.current) {
        stateRef.current = pruned;
        force();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [smoothing, ttlMs]);

  const cursors = visibleCursors(stateRef.current);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {children}
      {cursors.map((p) => (
        <Cursor key={p.actorId} participant={p} />
      ))}
    </div>
  );
}

function Cursor({ participant }: { participant: Participant }) {
  const { rendered, color, name } = participant;
  if (!rendered) return null;
  return (
    <div
      className="absolute left-0 top-0 will-change-transform"
      style={{ transform: `translate(${rendered.x}px, ${rendered.y}px)` }}
    >
      <svg viewBox="0 0 16 16" width="18" height="18" className="drop-shadow" style={{ color }}>
        <path d="M1 1l5.5 13 2-5.5L14 6.5 1 1z" fill="currentColor" stroke="white" strokeWidth="1" />
      </svg>
      <span
        className="absolute left-4 top-3 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white shadow"
        style={{ backgroundColor: color }}
      >
        {name || initials(name)}
      </span>
    </div>
  );
}
