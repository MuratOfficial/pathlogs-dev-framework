"use client";

import { useRef, useState } from "react";
import { cn } from "./cn.js";
import { useDismiss } from "@toimetdev/pathlogs-hooks";
import {
  describeExpr,
  describeDuration,
  isValidExpr,
  matchPreset,
  rangeDuration,
  resolveRange,
  shiftRange,
  TIME_PRESETS,
  type TimePreset,
  type TimeRange,
} from "./timeRange.js";

export interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  /** Свой набор готовых интервалов вместо стандартного. */
  presets?: TimePreset[];
  /** Момент отсчёта относительных выражений. По умолчанию — сейчас. */
  now?: Date;
  locale?: string;
  /** Показать стрелки «раньше/позже» — листание на длину интервала. */
  nudge?: boolean;
  /** Разрешить ввод своих выражений (`now-3h`, дата). По умолчанию да. */
  custom?: boolean;
  className?: string;
}

/**
 * Выбор интервала времени в синтаксисе `now-15m` — как в Grafana и Kibana.
 *
 * Разбор, готовые интервалы и листание живут в `timeRange.ts` под тестами.
 * Здесь — выпадающий список и поля ввода. Запись остаётся относительной:
 * «последний час», сохранённый в URL, через сутки покажет последний час,
 * а не тот же час вчера.
 */
export function TimeRangePicker({
  value,
  onChange,
  presets = TIME_PRESETS,
  now = new Date(),
  locale = "ru-RU",
  nudge = true,
  custom = true,
  className,
}: TimeRangePickerProps) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, { enabled: open, onDismiss: () => setOpen(false) });

  const resolved = resolveRange(value, now);
  const preset = matchPreset(value);
  const duration = rangeDuration(value, now);

  const label = preset
    ? preset.label
    : resolved
      ? `${describeExpr(value.from, locale)} — ${describeExpr(value.to, locale, "end")}`
      : "Неверный интервал";

  function pick(range: TimeRange) {
    onChange(range);
    setOpen(false);
  }

  return (
    <div ref={box} className={cn("pl-trange", className)}>
      {nudge && (
        <button
          type="button"
          className="pl-trange__nudge"
          aria-label="Раньше"
          data-tip="Раньше"
          disabled={!resolved}
          onClick={() => {
            const shifted = shiftRange(value, -1, now);
            if (shifted) onChange(shifted);
          }}
        >
          ‹
        </button>
      )}

      <button
        type="button"
        className={cn("pl-trange__trigger", !resolved && "pl-trange__trigger--invalid")}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" className="pl-trange__icon" fill="none" stroke="currentColor" aria-hidden>
          <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
          <path d="M12 7v5l3 2" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span className="pl-trange__label">{label}</span>
        {duration !== null && duration > 0 && (
          <span className="pl-trange__duration">{describeDuration(duration, locale)}</span>
        )}
      </button>

      {nudge && (
        <button
          type="button"
          className="pl-trange__nudge"
          aria-label="Позже"
          data-tip="Позже"
          disabled={!resolved}
          onClick={() => {
            const shifted = shiftRange(value, 1, now);
            if (shifted) onChange(shifted);
          }}
        >
          ›
        </button>
      )}

      {open && (
        <div className="pl-trange__panel pl-animate-pop-in" role="dialog" aria-label="Выбор интервала">
          <ul className="pl-trange__presets">
            {presets.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={cn("pl-trange__preset", preset?.id === p.id && "pl-trange__preset--active")}
                  onClick={() => pick(p.range)}
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>

          {custom && <CustomRange value={value} now={now} onApply={pick} />}
        </div>
      )}
    </div>
  );
}

/** Поля «с» и «по» для своего интервала. */
function CustomRange({
  value,
  now,
  onApply,
}: {
  value: TimeRange;
  now: Date;
  onApply: (range: TimeRange) => void;
}) {
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);

  const fromOk = isValidExpr(from);
  const toOk = isValidExpr(to);
  const ordered = resolveRange({ from, to }, now) !== null;
  const canApply = fromOk && toOk && ordered;

  return (
    <form
      className="pl-trange__custom"
      onSubmit={(e) => {
        e.preventDefault();
        if (canApply) onApply({ from, to });
      }}
    >
      <label className="pl-trange__field">
        <span>С</span>
        <input
          className={cn("pl-input", "pl-trange__expr", !fromOk && "pl-trange__expr--bad")}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="now-1h"
          aria-invalid={!fromOk}
        />
      </label>
      <label className="pl-trange__field">
        <span>По</span>
        <input
          className={cn("pl-input", "pl-trange__expr", !toOk && "pl-trange__expr--bad")}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="now"
          aria-invalid={!toOk}
        />
      </label>
      <button type="submit" className="pl-btn pl-btn--primary pl-btn--sm" disabled={!canApply}>
        Применить
      </button>
      {!ordered && fromOk && toOk && <p className="pl-trange__hint">Начало позже конца.</p>}
    </form>
  );
}
