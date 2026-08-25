import type { Metadata } from "next";
import { DocsArticle, articleMetadata, slugsFor } from "@/views/DocsArticle";

/**
 * Все английские страницы документации живут на одном динамическом маршруте.
 *
 * Так навигация, поиск и сами страницы берут структуру из одного места
 * (`content/nav.ts`), и добавить раздел — значит дописать одну запись,
 * а не создавать файл маршрута и не забывать про меню.
 */

export function generateStaticParams() {
  // Из набора страниц, а не из меню: пока страница не написана, маршрут
  // для неё не создаётся и сборка не падает на пустом импорте
  return slugsFor("en").map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata("en", slug.join("/"));
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <DocsArticle lang="en" path={slug.join("/")} />;
}
