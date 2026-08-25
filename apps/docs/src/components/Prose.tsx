"use client";

import type { ReactNode } from "react";
import { useDict } from "./LangProvider";

/**
 * Таблица пропсов и врезка — единственные части страницы, у которых есть
 * собственные подписи.
 *
 * Вынесены из `docs.tsx` в клиентский модуль, потому что язык они берут
 * из контекста, а `Example` рядом — серверный: он подсвечивает код Shiki
 * и в браузер уезжать не должен. Содержимое (`children`) остаётся серверным
 * и приходит сюда готовым деревом.
 */

export interface PropRow {
  name: string;
  type: string;
  /** Значение по умолчанию. Пропуск означает «нет». */
  default?: string;
  description: ReactNode;
  required?: boolean;
}

/**
 * Таблица пропсов.
 *
 * На узком экране превращается в карточки: таблица из четырёх колонок
 * с типами вроде `(item: I, ctx: Ctx) => ReactNode` на телефоне
 * нечитаема при любой вёрстке.
 */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  const t = useDict();

  return (
    <div className="not-prose my-5">
      {/* Широкий экран: обычная таблица */}
      <div className="hidden overflow-hidden rounded-xl border border-edge md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-edge bg-surface-2/40 text-left">
              <th className="px-4 py-2.5 font-medium text-muted">{t.propColumn}</th>
              <th className="px-4 py-2.5 font-medium text-muted">{t.typeColumn}</th>
              <th className="px-4 py-2.5 font-medium text-muted">{t.defaultColumn}</th>
              <th className="px-4 py-2.5 font-medium text-muted">{t.descriptionColumn}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-edge/60 align-top last:border-0">
                <td className="whitespace-nowrap px-4 py-3">
                  <code className="font-mono text-[13px] font-semibold text-accent-hover">
                    {row.name}
                  </code>
                  {row.required && (
                    <span className="ml-1 text-danger" title={t.required}>
                      *
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <code className="font-mono text-[12px] text-muted">{row.type}</code>
                </td>
                <td className="px-4 py-3">
                  {row.default ? (
                    <code className="font-mono text-[12px] text-muted">{row.default}</code>
                  ) : (
                    <span className="text-muted/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3 leading-relaxed text-foreground/85">
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Узкий экран: карточки */}
      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <div key={row.name} className="rounded-xl border border-edge p-3.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <code className="font-mono text-[13px] font-semibold text-accent-hover">
                {row.name}
                {row.required && <span className="text-danger">*</span>}
              </code>
              <code className="font-mono text-[11px] text-muted">{row.type}</code>
            </div>
            {row.default && (
              <p className="mt-1 font-mono text-[11px] text-muted">
                {t.defaultsTo}: {row.default}
              </p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{row.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export type CalloutTone = "note" | "warn" | "why";

const CALLOUT: Record<CalloutTone, { className: string; icon: string }> = {
  note: {
    className: "border-accent/40 bg-accent/[0.07]",
    icon: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  },
  warn: {
    className: "border-warning/40 bg-warning/[0.07]",
    icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  },
  why: {
    className: "border-edge bg-surface-2/50",
    icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  },
};

/**
 * Врезка. Тон `why` — для объяснений «почему сделано именно так»:
 * их в этой документации больше всего, и они не предупреждения.
 */
export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}) {
  const t = useDict();
  const meta = CALLOUT[tone];
  const fallback = tone === "warn" ? t.calloutWarn : tone === "why" ? t.calloutWhy : t.calloutNote;

  return (
    <aside className={`not-prose my-5 flex gap-3 rounded-xl border p-4 ${meta.className}`}>
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
      </svg>
      <div className="min-w-0 text-sm leading-relaxed text-foreground/85">
        <p className="mb-1 font-semibold text-foreground">{title ?? fallback}</p>
        {children}
      </div>
    </aside>
  );
}
