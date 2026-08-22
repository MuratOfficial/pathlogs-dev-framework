"use client";

import { useEffect, useRef, useState } from "react";

export type StreamStatus = "connecting" | "live" | "offline";

export interface UseEventStreamOptions {
  /** Имена SSE-событий, на которые нужно реагировать. По умолчанию — "message". */
  events?: string[];
  /**
   * Откладывать обработку, пока вкладка скрыта, и выполнить один раз при
   * возврате. Для «живых» экранов это почти всегда то, что нужно: обновлять
   * невидимую страницу незачем, а вернувшись, пользователь всё равно должен
   * увидеть свежее состояние.
   */
  deferWhenHidden?: boolean;
  enabled?: boolean;
  /** Передавать ли куки — нужно для авторизованных потоков на другом домене. */
  withCredentials?: boolean;
}

export interface EventStreamState {
  status: StreamStatus;
  /** Когда в последний раз применили изменение. null — ещё ни разу. */
  updatedAt: Date | null;
}

/**
 * Подписка на серверный поток событий (SSE).
 *
 * Типичное применение — «живой» экран: сервер шлёт «что-то изменилось»,
 * а страница сама подтягивает свежие данные (в Next.js — router.refresh())
 * без перезагрузки и без потери прокрутки.
 *
 * ```tsx
 * const { status, updatedAt } = useEventStream(`/api/projects/${id}/stream`, {
 *   events: ["change"],
 *   onEvent: () => router.refresh(),
 * });
 * ```
 *
 * Переподключение не наше дело: EventSource делает это сам. Наше — честно
 * показать, что связи сейчас нет.
 */
export function useEventStream(
  url: string | null,
  {
    onEvent,
    events = ["message"],
    deferWhenHidden = true,
    enabled = true,
    withCredentials = false,
  }: UseEventStreamOptions & { onEvent?: (event: MessageEvent) => void } = {}
): EventStreamState {
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  const eventNames = events.join(",");

  useEffect(() => {
    if (!enabled || !url || typeof window === "undefined") return;

    const source = new EventSource(url, { withCredentials });
    // Событие, пришедшее в скрытую вкладку. Храним последнее: экран всё равно
    // перечитывает состояние целиком, накапливать очередь незачем.
    let deferred: MessageEvent | null = null;

    function apply(event: MessageEvent) {
      if (deferWhenHidden && document.visibilityState === "hidden") {
        deferred = event;
        return;
      }
      deferred = null;
      setUpdatedAt(new Date());
      onEventRef.current?.(event);
    }

    const names = eventNames.split(",").filter(Boolean);
    for (const name of names) {
      source.addEventListener(name, apply as EventListener);
    }

    source.onopen = () => setStatus("live");
    source.onerror = () => setStatus("offline");

    function onVisible() {
      if (document.visibilityState === "visible" && deferred) apply(deferred);
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      for (const name of names) {
        source.removeEventListener(name, apply as EventListener);
      }
      source.close();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [url, eventNames, deferWhenHidden, enabled, withCredentials]);

  return { status, updatedAt };
}
