"use client";

import { useActiveSection } from "@toimetdev/pathlogs-hooks";

export interface TocEntry {
  id: string;
  title: string;
}

/**
 * Оглавление страницы справа.
 *
 * Активный пункт считает `useActiveSection` из самого фреймворка — тот же
 * хук, что описан в разделе про хуки. Отступ берём равным высоте липкой
 * шапки: без него раздел подсвечивался бы, ещё не показавшись из-под неё.
 */
export function Toc({ entries }: { entries: TocEntry[] }) {
  const { active, scrollTo } = useActiveSection(
    entries.map((e) => e.id),
    { offset: 80 }
  );

  if (entries.length === 0) return null;

  return (
    <aside className="docs-toc">
      <div className="sticky top-20">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          На этой странице
        </p>
        <ul className="flex flex-col gap-1 border-l border-edge text-sm">
          {entries.map((entry) => {
            const on = active === entry.id;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(entry.id)}
                  className={`-ml-px block w-full border-l-2 py-1 pl-3 text-left leading-snug transition ${
                    on
                      ? "border-accent font-medium text-accent-hover"
                      : "border-transparent text-muted hover:border-edge hover:text-foreground"
                  }`}
                >
                  {entry.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
