import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { themeScript } from "@toimetdev/pathlogs-tokens";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

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

const SITE = "https://pathlogs-ui.vercel.app";
const TITLE = "PathLogs UI — React-компоненты, хуки и виджеты";
const DESCRIPTION =
  "Дизайн-система, поведенческие хуки и готовые виджеты: канбан-доска, диаграмма Ганта, панель фильтров. Примитивы ставятся из npm, виджеты копируются в проект.";

export const metadata: Metadata = {
  // Нужен, чтобы относительные пути в openGraph и alternates разворачивались
  // в абсолютные: соцсети и поисковики других не понимают
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s — PathLogs UI" },
  description: DESCRIPTION,
  applicationName: "PathLogs UI",
  authors: [{ name: "Murat Toimet", url: "https://github.com/MuratOfficial" }],
  creator: "Murat Toimet",
  keywords: [
    "react",
    "компоненты",
    "дизайн-система",
    "канбан",
    "диаграмма Ганта",
    "хуки",
    "typescript",
    "tailwind",
    "shadcn",
    "ui kit",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE,
    siteName: "PathLogs UI",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  // Цвет адресной строки под каждую тему: со светлой страницей тёмная
  // полоса сверху выглядит обрезком чужого интерфейса
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
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
        <SiteChrome />
        {children}
      </body>
    </html>
  );
}
