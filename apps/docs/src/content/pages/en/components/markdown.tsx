import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { MarkdownDemo, MarkdownSafetyDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "syntax", title: "What is supported" },
  { id: "safety", title: "Safety" },
  { id: "mentions", title: "Mentions" },
  { id: "parser", title: "The parser, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        Limited Markdown for text that users write: task descriptions, comments, notes. No
        dependencies and no raw HTML.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { Markdown, MarkdownInline } from "@toimetdev/pathlogs-core";

<Markdown text={task.description} mentions={members.map((m) => m.name)} />

// inline markup only — for list entries and one-line captions
<MarkdownInline text={item.title} />`}
        >
          <MarkdownDemo />
        </Example>
      </Section>

      <Section title="What is supported" id="syntax">
        <CodeBlock
          lang="markdown"
          code={`# Heading           (levels 1–3)
**bold** *italic* ~~strikethrough~~ \`code\`

- bulleted list
1. numbered list

> a quote

---

[a link](https://example.com)

\`\`\`ts
a code block
\`\`\``}
        />
        <p>
          Heading levels stop at three, and the heading itself renders as a paragraph in a
          large face: user text has no business interfering with the page's heading structure
          or breaking its layout.
        </p>
      </Section>

      <Section title="Safety" id="safety">
        <Example
          code={`<Markdown text={"<script>alert(1)</script> — stays text.\\n\\n[Dangerous](javascript:alert(1)) — not a link."} />`}
        >
          <MarkdownSafetyDemo />
        </Example>
        <Callout tone="why" title="Safe by construction, not by a sanitiser">
          Parsing produces a tree, and React elements are built from that tree. A string
          containing a foreign tag becomes a text node — not because it was filtered out, but
          because there is physically nowhere for it to turn into markup.{" "}
          <code>dangerouslySetInnerHTML</code> is not here and should not be.
          <br />
          <br />
          Links go through a protocol allowlist: <code>http</code>, <code>https</code>,{" "}
          <code>mailto</code>. Everything else — including <code>javascript:</code> and{" "}
          <code>data:</code> — stays visible as text, so the author notices the markup did not
          take.
        </Callout>
        <p>
          Images are deliberately absent: they let someone pull a reader's IP to a third-party
          server, and they break list layout.
        </p>
      </Section>

      <Section title="Mentions" id="mentions">
        <p>
          A list of known names highlights <code>@mentions</code> in the text:
        </p>
        <CodeBlock
          code={`<Markdown text={comment.body} mentions={project.members.map((m) => m.name)} />`}
        />
        <p>
          Names are sorted from longest to shortest: otherwise «@John» would swallow the start
          of «@John Smith», and the mention would fall apart into a highlight plus a tail of
          text. Special characters in names are escaped — a name with a dot does not become
          «any character».
        </p>
      </Section>

      <Section title="The parser, separately" id="parser">
        <PropsTable
          rows={[
            { name: "text", type: "string", required: true, description: "The source text." },
            { name: "mentions", type: "string[]", description: "Names to highlight as @mentions." },
            { name: "className", type: "string", description: "Extra classes for the container." },
          ]}
        />
        <p>The grammar is available without React too — for a table of contents or search:</p>
        <CodeBlock
          code={`import { parseBlocks, parseInline, parseInlineWithMentions } from "@toimetdev/pathlogs-core";

parseBlocks("# Heading\\n\\ntext");
// [{ kind: "h", level: 1, text: "Heading" }, { kind: "p", lines: ["text"] }]

parseInline("**bold**");
// [{ kind: "strong", children: [{ kind: "text", text: "bold" }] }]`}
        />
      </Section>
    </>
  );
}
