import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findItem, groupOf, neighbours } from "@/content/nav";
import { PAGES } from "@/content/pages";
import { dict, docsHref, type Lang } from "@/content/locale";
import { Toc } from "@/components/Toc";
import { Sidebar } from "@/components/Sidebar";
import { SITE } from "./RootShell";

/**
 * Страница документации и раскладка вокруг неё — общие для обоих языков.
 *
 * Маршруты (`/docs/...` и `/ru/docs/...`) остаются тонкими: они только
 * сообщают сюда свой язык. Так текст «Назад», ссылки соседей и оглавление
 * не расходятся между языками по недосмотру.
 */

/** Раскладка раздела: навигация слева, контент справа. */
export function DocsShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
      <div className="docs-shell py-10">
        <aside className="hidden lg:block">
          {/* Навигация липкая и прокручивается сама: список разделов длиннее
              экрана, и без собственной прокрутки нижние пункты было бы не достать */}
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 pr-2">
            <Sidebar lang={lang} />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

/** Адреса всех страниц одного языка — для generateStaticParams. */
export function slugsFor(lang: Lang): string[] {
  return Object.keys(PAGES[lang]);
}

export function articleMetadata(lang: Lang, path: string): Metadata {
  const item = findItem(path);
  if (!item) return {};

  const title = item.title[lang];
  const description = item.description[lang];
  const url = docsHref(lang, path);

  // Канонический адрес и карточка для соцсетей у каждой страницы свои:
  // без них поисковик считает все разделы одной страницей, а ссылка
  // в мессенджере разворачивается описанием главной
  return {
    title,
    description,
    alternates: {
      canonical: url,
      // Тот же раздел на другом языке — это перевод, а не дубль
      languages: {
        en: docsHref("en", path),
        ru: docsHref("ru", path),
      },
    },
    // Картинку указываем явно: объявленный здесь openGraph заменяет
    // родительский целиком, вместе с картинкой, которую Next подставляет
    // из opengraph-image.tsx. Без неё ссылка на раздел разворачивается
    // в мессенджере голым текстом
    openGraph: {
      type: "article",
      url: `${SITE}${url}`,
      title: `${title} — PathLogs UI`,
      description,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — PathLogs UI`,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export function DocsArticle({ lang, path }: { lang: Lang; path: string }) {
  const item = findItem(path);
  const page = PAGES[lang][path];

  // Пункт есть в навигации, а файла нет (или наоборот) — это ошибка сборки,
  // а не «страница не найдена»: пользователь пришёл по ссылке из меню
  if (!item || !page) notFound();

  const t = dict(lang);
  const { prev, next } = neighbours(path);
  const group = groupOf(path, lang);
  const Content = page.default;

  return (
    <div className="flex min-w-0 gap-12">
      <article className="min-w-0 flex-1 pb-16">
        <header className="mb-8">
          {group && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-hover">
              {group}
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{item.title[lang]}</h1>
          <p className="mt-2 text-base leading-relaxed text-muted">{item.description[lang]}</p>
        </header>

        <div className="docs-prose">
          <Content />
        </div>

        <nav className="mt-16 flex gap-3 border-t border-edge pt-6">
          {prev ? (
            <Link
              href={docsHref(lang, prev.slug)}
              className="docs-plain group flex flex-1 flex-col gap-0.5 rounded-xl border border-edge p-4 transition hover:border-accent/50"
            >
              <span className="text-xs text-muted">{t.prev}</span>
              <span className="font-medium transition group-hover:text-accent-hover">
                {prev.title[lang]}
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next && (
            <Link
              href={docsHref(lang, next.slug)}
              className="docs-plain group flex flex-1 flex-col items-end gap-0.5 rounded-xl border border-edge p-4 text-right transition hover:border-accent/50"
            >
              <span className="text-xs text-muted">{t.next}</span>
              <span className="font-medium transition group-hover:text-accent-hover">
                {next.title[lang]}
              </span>
            </Link>
          )}
        </nav>
      </article>

      <Toc entries={page.toc} lang={lang} />
    </div>
  );
}
