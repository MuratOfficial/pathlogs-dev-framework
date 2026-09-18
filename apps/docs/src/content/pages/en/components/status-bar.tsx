import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { StatusBarDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "fit", title: "Priorities when space runs out" },
  { id: "logic", title: "The layout, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A bottom bar like a code editor's: segments, live counters, connection state. It
        completes <a href="/docs/components/app-shell">AppShell</a> from below.
      </p>

      <Section title="Example" id="example">
        <Example
          plain
          code={`<StatusBar
  segments={[
    { id: "branch", content: <>main</>, priority: 5 },
    { id: "conn", content: <LiveIndicator status="live" />, pinned: true, align: "right" },
    { id: "pos", content: <>Ln 42, Col 8</>, priority: 1, align: "right" },
  ]}
/>`}
        >
          <StatusBarDemo />
        </Example>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "segments",
              type: "StatusBarSegment[]",
              required: true,
              description: "The segments: content, priority, pinned, align, onClick, tip.",
            },
            {
              name: "gap",
              type: "number",
              default: "12",
              description: "The gap between segments (must match the CSS).",
            },
          ]}
        />
      </Section>

      <Section title="Priorities when space runs out" id="fit">
        <Callout tone="why" title="You cannot just clip at the edge">
          On a narrow screen the bar does not fit. <code>overflow: hidden</code> would remove
          whatever happened to be on the right, not whatever mattered least. So segments move
          into a «more» menu in ascending order of priority, and a <code>pinned</code> one —
          usually the connection status — is never removed: showing «no connection» matters
          more than fitting the width.
        </Callout>
      </Section>

      <Section title="The layout, separately" id="logic">
        <CodeBlock code={`import { fitSegments, estimateWidth } from "@toimetdev/pathlogs-core";`} />
      </Section>
    </>
  );
}
