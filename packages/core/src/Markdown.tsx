import type { ReactNode } from "react";
import {
  parseBlocks,
  parseInline,
  parseInlineWithMentions,
  type Inline,
} from "./markdownParser.js";
import { cn } from "./cn.js";

/**
 * Рендер ограниченного Markdown в React-элементы.
 *
 * Сырой HTML невозможен по построению: разбор даёт дерево, а из дерева
 * строятся элементы — строка с чужим тегом станет текстом, а не разметкой.
 * Никакого dangerouslySetInnerHTML здесь нет и быть не должно.
 *
 * Грамматика — в ./markdown.ts, там же её тесты.
 */

function renderInline(nodes: Inline[], keyBase = ""): ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyBase}${i}`;
    switch (node.kind) {
      case "text":
        return node.text;
      case "code":
        return (
          <code key={key} className="pl-md__code">
            {node.text}
          </code>
        );
      case "link":
        return (
          <a
            key={key}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="pl-md__link"
          >
            {renderInline(node.children, `${key}-`)}
          </a>
        );
      case "strong":
        return <strong key={key}>{renderInline(node.children, `${key}-`)}</strong>;
      case "em":
        return <em key={key}>{renderInline(node.children, `${key}-`)}</em>;
      case "del":
        return <del key={key}>{renderInline(node.children, `${key}-`)}</del>;
      case "mention":
        return (
          <span key={key} className="pl-md__mention">
            {node.text}
          </span>
        );
    }
  });
}

export interface MarkdownInlineProps {
  text: string;
  /** Имена для подсветки @упоминаний. */
  mentions?: string[];
}

/** Только инлайн-разметка: пункты списков, заголовки, однострочные подписи. */
export function MarkdownInline({ text, mentions }: MarkdownInlineProps) {
  const nodes = mentions?.length
    ? parseInlineWithMentions(text, mentions)
    : parseInline(text);
  return <>{renderInline(nodes)}</>;
}

const HEADING_CLASS: Record<number, string> = {
  1: "pl-md__h1",
  2: "pl-md__h2",
  3: "pl-md__h3",
};

export interface MarkdownProps {
  text: string;
  className?: string;
  /** Имена для подсветки @упоминаний. */
  mentions?: string[];
}

/** Блочный Markdown: описания, комментарии, заметки. */
export function Markdown({ text, className, mentions }: MarkdownProps) {
  const blocks = parseBlocks(text);

  return (
    <div className={cn("pl-md", className)}>
      {blocks.map((b, idx) => {
        switch (b.kind) {
          case "h":
            // Абзац с классом заголовка, а не <h1>: пользовательский текст
            // не должен вмешиваться в структуру заголовков самой страницы
            return (
              <p key={idx} className={HEADING_CLASS[b.level]}>
                <MarkdownInline text={b.text} mentions={mentions} />
              </p>
            );
          case "hr":
            return <hr key={idx} className="pl-md__hr" />;
          case "code":
            return (
              <pre key={idx} className="pl-md__pre" data-lang={b.lang}>
                {b.lines.join("\n")}
              </pre>
            );
          case "ul":
            return (
              <ul key={idx} className="pl-md__ul">
                {b.items.map((it, j) => (
                  <li key={j}>
                    <MarkdownInline text={it} mentions={mentions} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="pl-md__ol">
                {b.items.map((it, j) => (
                  <li key={j}>
                    <MarkdownInline text={it} mentions={mentions} />
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={idx} className="pl-md__quote">
                {b.lines.map((l, j) => (
                  <p key={j}>
                    <MarkdownInline text={l} mentions={mentions} />
                  </p>
                ))}
              </blockquote>
            );
          case "p":
            return (
              <p key={idx} className="pl-md__p">
                {b.lines.map((l, j) => (
                  <span key={j}>
                    {j > 0 && "\n"}
                    <MarkdownInline text={l} mentions={mentions} />
                  </span>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
