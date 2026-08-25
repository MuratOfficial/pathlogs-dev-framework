import type { Metadata } from "next";
import { DocsArticle, articleMetadata, slugsFor } from "@/views/DocsArticle";

/** Парный к английскому маршруту — см. пояснение там. */

export function generateStaticParams() {
  return slugsFor("ru").map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata("ru", slug.join("/"));
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <DocsArticle lang="ru" path={slug.join("/")} />;
}
