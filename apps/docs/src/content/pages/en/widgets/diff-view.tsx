import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DiffViewDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "words", title: "Word-level diffing" },
  { id: "logic", title: "The algorithm, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A diff of two texts: unified and side by side, with word-level highlighting inside a
        line. Changes are gathered into hunks with context rather than shown against the whole
        file.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add diff-view" />
      </Section>

      <Section title="Example" id="example">
        <Example plain code={`<DiffView before={before} after={after} mode="unified" filename="greet.ts" />`}>
          <DiffViewDemo />
        </Example>
        <p>Switch to «Split» and changed lines line up opposite one another.</p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "before / after", type: "string", required: true, description: "The original and changed text." },
            {
              name: "mode",
              type: '"unified" | "split"',
              default: '"unified"',
              description: "Unified, or two columns.",
            },
            {
              name: "inline",
              type: "boolean",
              default: "true",
              description: "Highlight changes within a line, word by word.",
            },
            {
              name: "collapse",
              type: "boolean",
              default: "true",
              description: "Collapse unchanged parts, keeping context (unified).",
            },
            { name: "context", type: "number", default: "3", description: "How many context lines around changes." },
            { name: "filename", type: "string", description: "The heading above the diff." },
          ]}
        />
      </Section>

      <Section title="Word-level diffing" id="words">
        <Callout tone="why" title="By words, not by characters">
          The in-line diff cuts a line into words, whitespace and punctuation. A
          character-level diff of a renamed variable gives you a porridge of individual
          letters — whereas by words you see exactly what changed. The tokeniser is
          Unicode-aware: Cyrillic and any non-Latin alphabet do not fall apart into letters.
        </Callout>
      </Section>

      <Section title="The algorithm, separately" id="logic">
        <CodeBlock
          code={`import {
  diffLines,   // line diff (LCS with common edges trimmed)
  diffWords,   // in-line diff by words
  buildHunks,  // gathering changes into hunks with context
  pairRows,    // laying out two columns
} from "@/components/ui/diff-view/diffModel";`}
        />
        <Callout tone="note" title="A guard against gigantic files">
          The full LCS matrix is computed up to roughly 2000×2000 lines. Beyond that the
          algorithm honestly reports «the block was replaced wholesale»: freezing the tab over
          half a gigabyte of memory would be worse than showing the file coarsely.
        </Callout>
      </Section>
    </>
  );
}
