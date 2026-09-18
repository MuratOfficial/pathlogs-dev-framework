"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/content/nav";
import { dict, docsHref, type Lang } from "@/content/locale";

/**
 * Боковая навигация. Активный пункт определяется по текущему пути,
 * а не хранится в состоянии: переход по ссылке меняет путь, и подсветка
 * едет за ним сама, без синхронизации.
 */
export function Sidebar({ lang, onNavigate }: { lang: Lang; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label={dict(lang).sidebarLabel} className="flex flex-col gap-6 text-sm">
      {NAV.map((group) => (
        <div key={group.title.en}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {group.title[lang]}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const href = docsHref(lang, item.slug);
              const active = pathname === href;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`docs-plain flex items-center gap-2 rounded-lg px-3 py-1.5 transition ${
                      active
                        ? "bg-accent/12 font-medium text-accent-hover"
                        : "text-muted hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{item.title[lang]}</span>
                    {item.badge && (
                      <span className="shrink-0 rounded border border-edge px-1 text-[9px] font-semibold uppercase tracking-wide text-muted">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
