import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";

export interface CodeBlockProps {
  code: string;
  lang?: string;
  /** Подпись над блоком: путь к файлу или команда. */
  title?: string;
  /** Убрать рамку и отступы — для кода внутри другого блока. */
  bare?: boolean;
}

/**
 * Блок кода с подсветкой и кнопкой копирования.
 *
 * Подсветка делается на сервере во время сборки: Shiki весит больше самого
 * сайта, и тащить его в браузер ради статичных примеров незачем.
 *
 * Темы сразу две: Shiki кладёт вариант для тёмной в CSS-переменную
 * `--shiki-dark`, а правило в globals переключает их по `[data-theme]` —
 * поэтому подсветка следует за темой сайта, а не за системной настройкой.
 */
export async function CodeBlock({ code, lang = "tsx", title, bare = false }: CodeBlockProps) {
  const trimmed = code.trim();
  const html = await codeToHtml(trimmed, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  if (bare) {
    return (
      <div className="docs-code relative">
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <CopyButton value={trimmed} className="absolute right-2 top-2" />
      </div>
    );
  }

  return (
    <figure className="not-prose group relative overflow-hidden rounded-xl border border-edge bg-surface">
      {title && (
        <figcaption className="flex items-center gap-2 border-b border-edge bg-surface-2/50 px-4 py-2 font-mono text-xs text-muted">
          {title}
        </figcaption>
      )}
      <div className="docs-code relative">
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <CopyButton
          value={trimmed}
          className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
        />
      </div>
    </figure>
  );
}
