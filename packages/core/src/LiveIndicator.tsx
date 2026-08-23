import type { StreamStatus } from "@toimetdev/pathlogs-hooks";
import { cn } from "./cn.js";

export interface LiveIndicatorProps {
  status: StreamStatus;
  /** Когда в последний раз применили изменение. */
  updatedAt?: Date | null;
  /** Локаль для времени. По умолчанию — локаль браузера. */
  locale?: string;
  labels?: {
    live?: string;
    connecting?: string;
    offline?: string;
    /** Шаблон с {time}: «обновлено в {time}». */
    updated?: string;
    tipLive?: string;
    tipOffline?: string;
  };
  className?: string;
}

/**
 * Состояние живого соединения точкой и подписью.
 *
 * Цвет здесь не единственный носитель смысла: рядом всегда стоит текст —
 * дальтонику и в чёрно-белой печати индикатор остаётся читаемым.
 */
export function LiveIndicator({
  status,
  updatedAt,
  locale,
  labels,
  className,
}: LiveIndicatorProps) {
  const time = updatedAt?.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const label =
    status === "live"
      ? time
        ? (labels?.updated ?? "updated at {time}").replace("{time}", time)
        : (labels?.live ?? "live updates")
      : status === "connecting"
        ? (labels?.connecting ?? "connecting…")
        : (labels?.offline ?? "offline — updates paused");

  return (
    <span
      data-tip={status === "live" ? labels?.tipLive : labels?.tipOffline}
      className={cn("pl-live", className)}
    >
      <span aria-hidden className={cn("pl-live__dot", `pl-live__dot--${status}`)} />
      {label}
    </span>
  );
}
