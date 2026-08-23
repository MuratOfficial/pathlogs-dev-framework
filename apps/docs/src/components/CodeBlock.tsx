import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";

export interface CodeBlockProps {
  code: string;
  lang?: string;
  /** Подпись в шапке: путь к файлу. Без неё показывается язык. */
  title?: string;
  /**
   * Номера строк. По умолчанию появляются у многострочного кода: у команды
   * в одну строку нумеровать нечего, а гутер только сдвигал бы её вправо.
   */
  lineNumbers?: boolean;
  /** Без внешней рамки — для кода внутри другого блока (вкладка «Код»). */
  bare?: boolean;
}

/** Как подписывать язык в шапке. Неизвестные показываем как есть. */
const LANG_LABEL: Record<string, string> = {
  tsx: "tsx",
  ts: "ts",
  js: "js",
  jsx: "jsx",
  css: "css",
  json: "json",
  bash: "terminal",
  sh: "terminal",
  html: "html",
  markdown: "md",
};

/**
 * Блок кода с подсветкой, номерами строк и кнопкой копирования.
 *
 * Подсветка делается на сервере во время сборки: Shiki весит больше самого
 * сайта, и тащить его в браузер ради статичных примеров незачем.
 *
 * Тем сразу две. С `defaultColor: false` Shiki не пишет цвет напрямую,
 * а кладёт оба варианта в переменные `--shiki-light` и `--shiki-dark`;
 * какой из них применить, решает CSS по атрибуту `data-theme`. Поэтому
 * подсветка следует за темой сайта, а не за системной настройкой.
 */
export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  lineNumbers,
  bare = false,
}: CodeBlockProps) {
  const trimmed = code.trim();
  const multiline = trimmed.includes("\n");
  const numbered = lineNumbers ?? multiline;

  const html = await codeToHtml(trimmed, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  const body = (
    <div className={`docs-code ${numbered ? "docs-code--numbered" : ""}`}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );

  if (bare) {
    return (
      <div className="group/code relative">
        {body}
        <CopyButton value={trimmed} className="docs-code__copy" />
      </div>
    );
  }

  return (
    <figure className="not-prose group/code relative my-5 overflow-hidden rounded-xl border border-edge bg-surface">
      <figcaption className="flex items-center gap-2 border-b border-edge bg-surface-2/40 px-4 py-2">
        {title ? (
          <>
            <svg
              className="h-3.5 w-3.5 shrink-0 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span className="font-mono text-xs text-muted">{title}</span>
          </>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted/70">
            {LANG_LABEL[lang] ?? lang}
          </span>
        )}
        <span className="ml-auto" />
      </figcaption>
      {body}
      <CopyButton value={trimmed} className="docs-code__copy docs-code__copy--titled" />
    </figure>
  );
}
