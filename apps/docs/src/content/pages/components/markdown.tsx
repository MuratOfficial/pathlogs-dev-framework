import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { MarkdownDemo, MarkdownSafetyDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "syntax", title: "Что поддерживается" },
  { id: "safety", title: "Безопасность" },
  { id: "mentions", title: "Упоминания" },
  { id: "parser", title: "Разбор отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Ограниченный Markdown для текста, который пишут пользователи: описания задач,
        комментарии, заметки. Без зависимостей и без сырого HTML.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { Markdown, MarkdownInline } from "@toimetdev/pathlogs-core";

<Markdown text={task.description} mentions={members.map((m) => m.name)} />

// только инлайн-разметка — для пунктов списков и однострочных подписей
<MarkdownInline text={item.title} />`}
        >
          <MarkdownDemo />
        </Example>
      </Section>

      <Section title="Что поддерживается" id="syntax">
        <CodeBlock
          lang="markdown"
          code={`# Заголовок          (уровни 1–3)
**жирный** *курсив* ~~зачёркнутый~~ \`код\`

- маркированный список
1. нумерованный список

> цитата

---

[ссылка](https://example.com)

\`\`\`ts
блок кода
\`\`\``}
        />
        <p>
          Уровень заголовка ограничен тремя, а сам заголовок рендерится абзацем
          с крупным начертанием: пользовательский текст не должен вмешиваться
          в структуру заголовков страницы и ломать её вёрстку.
        </p>
      </Section>

      <Section title="Безопасность" id="safety">
        <Example
          code={`<Markdown text={"<script>alert(1)</script> — остаётся текстом.\\n\\n[Опасная](javascript:alert(1)) — не ссылка."} />`}
        >
          <MarkdownSafetyDemo />
        </Example>
        <Callout tone="why" title="Безопасность по построению, а не санитайзером">
          Разбор даёт дерево, а из дерева строятся React-элементы. Строка с чужим
          тегом становится текстовым узлом — не потому, что её отфильтровали,
          а потому, что превратиться в разметку ей физически негде.{" "}
          <code>dangerouslySetInnerHTML</code> здесь нет и быть не должно.
          <br />
          <br />
          Ссылки проходят белый список протоколов: <code>http</code>,{" "}
          <code>https</code>, <code>mailto</code>. Всё остальное — включая{" "}
          <code>javascript:</code> и <code>data:</code> — остаётся видимым текстом,
          чтобы автор заметил, что разметка не сработала.
        </Callout>
        <p>
          Картинок нет намеренно: они позволяют утащить IP читателя на чужой сервер
          и ломают вёрстку списков.
        </p>
      </Section>

      <Section title="Упоминания" id="mentions">
        <p>
          Список известных имён подсвечивает <code>@упоминания</code> в тексте:
        </p>
        <CodeBlock
          code={`<Markdown text={comment.body} mentions={project.members.map((m) => m.name)} />`}
        />
        <p>
          Имена сортируются от длинных к коротким: иначе «@Иван» съел бы начало
          «@Иван Петров», и упоминание распалось бы на подсветку и хвост текста.
          Спецсимволы в именах экранируются — имя с точкой не превратится
          в «любой символ».
        </p>
      </Section>

      <Section title="Разбор отдельно" id="parser">
        <PropsTable
          rows={[
            { name: "text", type: "string", required: true, description: "Исходный текст." },
            { name: "mentions", type: "string[]", description: "Имена для подсветки @упоминаний." },
            { name: "className", type: "string", description: "Дополнительные классы контейнера." },
          ]}
        />
        <p>Грамматика доступна и без React — например, для оглавления или поиска:</p>
        <CodeBlock
          code={`import { parseBlocks, parseInline, parseInlineWithMentions } from "@toimetdev/pathlogs-core";

parseBlocks("# Заголовок\\n\\nтекст");
// [{ kind: "h", level: 1, text: "Заголовок" }, { kind: "p", lines: ["текст"] }]

parseInline("**жирный**");
// [{ kind: "strong", children: [{ kind: "text", text: "жирный" }] }]`}
        />
      </Section>
    </>
  );
}
