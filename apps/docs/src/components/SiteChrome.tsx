"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CommandPalette, ThemeToggle, TooltipLayer, type CommandItem } from "@toimetdev/pathlogs-core";
import { ALL_ITEMS, NAV } from "@/content/nav";
import { Sidebar } from "./Sidebar";

/**
 * Шапка сайта: логотип, поиск, тема, ссылка на исходники и меню
 * для узких экранов.
 *
 * Поиск — это `CommandPalette` из самого фреймворка, а не сторонний виджет:
 * документация должна быть первым потребителем того, что документирует.
 */
export function SiteChrome() {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Пункты палитры — те же страницы, что в боковой навигации.
  // Раздел приходит из группы, ключевые слова — из описания страницы.
  const items: CommandItem[] = ALL_ITEMS.map((item) => {
    const group = NAV.find((g) => g.items.includes(item))?.title;
    return {
      id: item.slug,
      title: item.title,
      keywords: `${item.description} ${item.keywords ?? ""}`,
      onSelect: () => router.push(`/docs/${item.slug}`),
      ...(group ? { group } : {}),
      ...(item.badge ? { badge: item.badge } : {}),
    };
  });

  return (
    <>
      {/* Один слой подсказок на весь сайт — им пользуются и примеры,
          и элементы самой документации */}
      <TooltipLayer />

      <CommandPalette
        items={items}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        labels={{
          placeholder: "Поиск по документации…",
          empty: "Ничего не найдено",
          navigate: "навигация",
          select: "открыть",
        }}
      />

      <header className="sticky top-0 z-30 border-b border-edge bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Меню разделов"
            aria-expanded={menuOpen}
            className="rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-foreground lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <Link href="/" className="docs-plain flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent via-accent-2 to-accent-pink text-sm font-bold text-white">
              P
            </span>
            <span className="text-sm font-bold tracking-tight">PathLogs UI</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
            {[
              { href: "/docs/introduction", label: "Документация" },
              { href: "/docs/components/dialog", label: "Компоненты" },
              { href: "/docs/widgets/kanban", label: "Виджеты" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="docs-plain rounded-lg px-2.5 py-1.5 text-muted transition hover:bg-surface-2 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-edge bg-surface-2/60 py-1.5 pl-2.5 pr-2 text-xs text-muted transition hover:border-accent/40 hover:text-foreground"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="hidden sm:inline">Поиск</span>
              <kbd className="pl-kbd hidden sm:inline">⌘K</kbd>
            </button>

            <ThemeToggle labels={{ toDark: "Тёмная тема", toLight: "Светлая тема", action: "Переключить тему" }} />

            <a
              href="https://github.com/MuratOfficial/pathlogs-dev-framework"
              target="_blank"
              rel="noopener noreferrer"
              data-tip="Исходники на GitHub"
              aria-label="GitHub"
              className="docs-plain flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Разделы на узком экране: выезжают под шапкой, а не поверх контента —
          так видно, откуда уходишь */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="pl-animate-fade-in fixed inset-x-0 top-14 z-30 max-h-[70vh] overflow-y-auto border-b border-edge bg-surface p-4 shadow-2xl lg:hidden">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
