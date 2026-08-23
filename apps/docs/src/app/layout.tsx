import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { themeScript } from "@toimetdev/pathlogs-tokens";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PathLogs UI — React-компоненты и виджеты",
    template: "%s — PathLogs UI",
  },
  description:
    "Дизайн-система, поведенческие хуки и готовые виджеты: канбан-доска, диаграмма Ганта, панель фильтров. Пакеты из npm, виджеты — копированием в проект.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/*
          Тема ставится до первой отрисовки. Скрипт синхронный и блокирует
          рендер — здесь это ровно то, что нужно: иначе страница мигнёт
          светлой темой перед тем, как применится тёмная.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <SiteChrome />
        {children}
      </body>
    </html>
  );
}
