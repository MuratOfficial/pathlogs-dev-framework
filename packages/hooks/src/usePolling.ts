"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePollingOptions {
  /** Период опроса в мс. */
  interval?: number;
  enabled?: boolean;
  /**
   * Не опрашивать, пока вкладка в фоне, и опросить сразу при возврате.
   * Экономит запросы: счётчик в невидимой вкладке никто не читает.
   */
  pauseWhenHidden?: boolean;
  /** Опросить сразу при монтировании, не дожидаясь первого интервала. */
  immediate?: boolean;
}

/**
 * Периодический опрос — для значений, ради которых не стоит держать
 * постоянное соединение: счётчик непрочитанных, статус фоновой задачи.
 *
 * ```tsx
 * const { data: count } = usePolling(
 *   async () => (await fetch("/api/unread").then((r) => r.json())).count,
 *   { initial: unreadFromServer, interval: 30_000 }
 * );
 * ```
 *
 * Опрос идёт и по возврату фокуса на вкладку, а не только по таймеру:
 * вернувшись через час, пользователь ждёт свежее число сразу, а не
 * через интервал.
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  {
    initial,
    interval = 30_000,
    enabled = true,
    pauseWhenHidden = true,
    immediate = false,
  }: UsePollingOptions & { initial: T }
): { data: T; refresh: () => void } {
  const [data, setData] = useState<T>(initial);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // Ручной опрос дёргает тот же эффект, что и таймер: одна точка входа —
  // одна политика «не опрашивать скрытую вкладку».
  const [manual, setManual] = useState(0);
  const refresh = useCallback(() => setManual((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function run() {
      if (pauseWhenHidden && typeof document !== "undefined" && document.hidden) return;
      try {
        const next = await fetcherRef.current();
        if (!cancelled) setData(next);
      } catch {
        // сеть недоступна — просто пробуем в следующий раз
      }
    }

    if (immediate) void run();
    const id = setInterval(run, interval);
    document.addEventListener("visibilitychange", run);
    window.addEventListener("focus", run);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("focus", run);
    };
  }, [enabled, interval, pauseWhenHidden, immediate, manual]);

  return { data, refresh };
}
