import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { themeScript } from "@toimetdev/pathlogs-tokens";
import { SiteChrome } from "@/components/SiteChrome";
import { LangProvider } from "@/components/LangProvider";
import { LOCALE_TAG, SITE_META, homeHref, langPrefix, type Lang } from "@/content/locale";

/**
 * Общая оболочка страницы для обоих языков.
 *
 * У сайта два корневых макета — по одному на язык, — иначе атрибут `lang`
 * у `<html>` пришлось бы держать одинаковым для русского и английского.
 * Разметка при этом одна: два макета отличаются только тем, какой язык
 * они сюда передают.
 */

// Те же шрифты и те же наборы символов, что в pathlogs: кириллица нужна
// и моноширинному — в примерах кода встречаются русские строки и комментарии.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const SITE = "https://pathlogs-ui.vercel.app";

/**
 * Метаданные главной для одного языка.
 *
 * `alternates.languages` обязателен: без него поисковик считает русскую
 * и английскую версии конкурирующими копиями одной страницы, а не переводами
 * друг друга, и выбирает из них одну сам.
 */
export function rootMetadata(lang: Lang): Metadata {
  const meta = SITE_META[lang];
  const path = homeHref(lang);

  return {
    // Нужен, чтобы относительные пути в openGraph и alternates разворачивались
    // в абсолютные: соцсети и поисковики других не понимают
    metadataBase: new URL(SITE),
    title: { default: meta.title, template: "%s — PathLogs UI" },
    description: meta.description,
    applicationName: "PathLogs UI",
    authors: [{ name: "Murat Toimet", url: "https://github.com/MuratOfficial" }],
    creator: "Murat Toimet",
    keywords: meta.keywords,
    openGraph: {
      type: "website",
      locale: LOCALE_TAG[lang],
      url: path,
      siteName: "PathLogs UI",
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    alternates: {
      canonical: path,
      languages: { en: "/", ru: "/ru" },
    },
  };
}

export const viewport: Viewport = {
  // Цвет адресной строки под каждую тему: со светлой страницей тёмная
  // полоса сверху выглядит обрезком чужого интерфейса
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
  ],
};

export function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/*
          Тема ставится до первой отрисовки. Скрипт синхронный и блокирует
          рендер — здесь это ровно то, что нужно: иначе страница мигнёт
          светлой темой перед тем, как применится тёмная.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body>
        <LangProvider lang={lang}>
          <SiteChrome lang={lang} />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}

/** Префикс языка — пригождается маршрутам для сборки ссылок. */
export { langPrefix };
