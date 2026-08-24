import { useMemo, type ReactNode } from "react";
import { cn } from "./cn.js";
import {
  dayLabel,
  groupActivity,
  relativeTime,
  type ActivityEntry,
  type ActivityEventLike,
} from "./activityGroups.js";

export interface ActivityTimelineProps<E extends ActivityEventLike> {
  events: E[];
  /** Как нарисовать одиночное событие. */
  renderEvent: (event: E) => ReactNode;
  /** Как нарисовать свёрнутую серию. По умолчанию — «N однотипных событий». */
  renderBurst?: (events: E[]) => ReactNode;
  /** Иконка или маркер слева от события. */
  renderIcon?: (event: E) => ReactNode;
  /** Момент отсчёта относительного времени. По умолчанию — сейчас. */
  now?: Date;
  locale?: string;
  /** Порядок: новые сверху (по умолчанию) или снизу. */
  order?: "desc" | "asc";
  /** С какого числа однотипных подряд событий их сворачивать. */
  burstThreshold?: number;
  /** Разворачивать серию по клику. По умолчанию да. */
  expandable?: boolean;
  className?: string;
}

/**
 * Хронология событий: сгруппирована по дням, серии однотипных свёрнуты.
 *
 * Вся группировка — в `activityGroups.ts` под тестами. Здесь — линия времени,
 * заголовки дней и раскрытие серий. Свёртка серий не косметика: без неё
 * «сменил статус ×7» превращается в семь одинаковых строк, за которыми
 * теряется всё остальное.
 */
export function ActivityTimeline<E extends ActivityEventLike>({
  events,
  renderEvent,
  renderBurst,
  renderIcon,
  now = new Date(),
  locale = "ru-RU",
  order = "desc",
  burstThreshold = 3,
  expandable = true,
  className,
}: ActivityTimelineProps<E>) {
  const days = useMemo(
    () => groupActivity(events, { order, burstThreshold }),
    [events, order, burstThreshold]
  );

  if (events.length === 0) {
    return <div className={cn("pl-timeline pl-timeline--empty", className)}>Пока ничего не происходило.</div>;
  }

  return (
    <div className={cn("pl-timeline", className)}>
      {days.map((day) => (
        <section key={day.key} className="pl-timeline__day">
          <h3 className="pl-timeline__date">{dayLabel(day.date, now, locale)}</h3>
          <ol className="pl-timeline__list">
            {day.entries.map((entry) => (
              <Entry
                key={entry.key}
                entry={entry}
                now={now}
                locale={locale}
                expandable={expandable}
                renderEvent={renderEvent}
                renderBurst={renderBurst}
                renderIcon={renderIcon}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function Entry<E extends ActivityEventLike>({
  entry,
  now,
  locale,
  expandable,
  renderEvent,
  renderBurst,
  renderIcon,
}: {
  entry: ActivityEntry<E>;
  now: Date;
  locale: string;
  expandable: boolean;
  renderEvent: (event: E) => ReactNode;
  renderBurst?: (events: E[]) => ReactNode;
  renderIcon?: (event: E) => ReactNode;
}) {
  if (entry.type === "single") {
    return (
      <li className="pl-timeline__item">
        <span className="pl-timeline__marker">{renderIcon?.(entry.event)}</span>
        <div className="pl-timeline__body">
          <div className="pl-timeline__content">{renderEvent(entry.event)}</div>
          <time className="pl-timeline__time">{relativeTime(entry.at, now, locale)}</time>
        </div>
      </li>
    );
  }

  // Свёрнутая серия: <details> даёт раскрытие без единой строки состояния —
  // и работает даже при выключенном JavaScript
  const head = renderBurst ? renderBurst(entry.events) : `${entry.events.length} однотипных событий`;
  const lead = entry.events[0]!;

  if (!expandable) {
    return (
      <li className="pl-timeline__item">
        <span className="pl-timeline__marker pl-timeline__marker--burst">{renderIcon?.(lead)}</span>
        <div className="pl-timeline__body">
          <div className="pl-timeline__content">{head}</div>
          <time className="pl-timeline__time">{relativeTime(entry.at, now, locale)}</time>
        </div>
      </li>
    );
  }

  return (
    <li className="pl-timeline__item">
      <span className="pl-timeline__marker pl-timeline__marker--burst">{renderIcon?.(lead)}</span>
      <details className="pl-timeline__burst">
        <summary className="pl-timeline__body">
          <span className="pl-timeline__content">{head}</span>
          <span className="pl-timeline__count">{entry.events.length}</span>
        </summary>
        <ol className="pl-timeline__sublist">
          {entry.events.map((event) => (
            <li key={event.id} className="pl-timeline__subitem">
              <span className="pl-timeline__content">{renderEvent(event)}</span>
              <time className="pl-timeline__time">{relativeTime(event.at, now, locale)}</time>
            </li>
          ))}
        </ol>
      </details>
    </li>
  );
}
