import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findItem, groupOf, neighbours } from "@/content/nav";
import { PAGES } from "@/content/pages";
import { Toc } from "@/components/Toc";

/**
 * Все страницы документации живут на одном динамическом маршруте.
 *
 * Так навигация, поиск и сами страницы берут структуру из одного места
 * (`content/nav.ts`), и добавить раздел — значит дописать одну запись,
 * а не создавать файл маршрута и не забывать про меню.
 */

export function generateStaticParams() {
  // Из набора страниц, а не из меню: пока страница не написана, маршрут
  // для неё не создаётся и сборка не падает на пустом импорте
  return Object.keys(PAGES).map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");
  const item = findItem(path);
  if (!item) return {};

  // Канонический адрес и карточка для соцсетей у каждой страницы свои:
  // без них поисковик считает все разделы одной страницей, а ссылка
  // в мессенджере разворачивается описанием главной
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/docs/${path}` },
    openGraph: {
      type: "article",
      url: `/docs/${path}`,
      title: `${item.title} — PathLogs UI`,
      description: item.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} — PathLogs UI`,
      description: item.description,
    },
  };
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const item = findItem(path);
  const page = PAGES[path];

  // Пункт есть в навигации, а файла нет (или наоборот) — это ошибка сборки,
  // а не «страница не найдена»: пользователь пришёл по ссылке из меню
  if (!item || !page) notFound();

  const { prev, next } = neighbours(path);
  const group = groupOf(path);
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
          <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
          <p className="mt-2 text-base leading-relaxed text-muted">{item.description}</p>
        </header>

        <div className="docs-prose">
          <Content />
        </div>

        <nav className="mt-16 flex gap-3 border-t border-edge pt-6">
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="docs-plain group flex flex-1 flex-col gap-0.5 rounded-xl border border-edge p-4 transition hover:border-accent/50"
            >
              <span className="text-xs text-muted">Назад</span>
              <span className="font-medium transition group-hover:text-accent-hover">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next && (
            <Link
              href={`/docs/${next.slug}`}
              className="docs-plain group flex flex-1 flex-col items-end gap-0.5 rounded-xl border border-edge p-4 text-right transition hover:border-accent/50"
            >
              <span className="text-xs text-muted">Дальше</span>
              <span className="font-medium transition group-hover:text-accent-hover">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </article>

      <Toc entries={page.toc} />
    </div>
  );
}
