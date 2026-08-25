import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { LogStreamDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "virtual", title: "Virtualisation" },
  { id: "logic", title: "The parsing, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A stream of logs: ANSI colours, filtering by level and substring, match highlighting
        and follow-tail. The framework is called pathlogs — and had no log output in it.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add log-stream" />
      </Section>

      <Section title="Example" id="example">
        <Example plain code={`<LogStream lines={lines} follow height={320} />`}>
          <LogStreamDemo />
        </Example>
        <p>
          Click the levels in the toolbar — the filter is built from whichever are selected.
          Search highlights matches right inside the lines.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "lines",
              type: "LogLine[]",
              required: true,
              description: "The lines: seq, text, level?, at?, source?.",
            },
            { name: "follow", type: "boolean", default: "true", description: "Stick to the end as lines arrive." },
            { name: "toolbar", type: "boolean", default: "true", description: "The search and level toolbar." },
            { name: "lineNumbers", type: "boolean", default: "true", description: "Line numbers on the left." },
            {
              name: "wrap",
              type: "boolean",
              default: "false",
              description: "Wrap long lines instead of scrolling horizontally.",
            },
            { name: "onSelectLine", type: "(line) => void", description: "A click on a line." },
            { name: "height", type: "number | string", default: "420", description: "The height of the scroll area." },
          ]}
        />
      </Section>

      <Section title="Virtualisation" id="virtual">
        <Callout tone="why" title="The level is detected once per line">
          Lines are virtualised through{" "}
          <a href="/docs/components/virtual-list">useVirtual</a>: a CI log of tens of thousands
          of lines renders only the visible part. A line's level is recognised when it enters
          the buffer, not when it is drawn — otherwise the text would be re-parsed on every
          frame of scrolling.
        </Callout>
      </Section>

      <Section title="The parsing, separately" id="logic">
        <CodeBlock
          code={`import { parseAnsi, stripAnsi } from "@/components/ui/log-stream/ansi";
import {
  appendLines,   // append to the buffer, evicting anything over the limit
  filterLines,   // filter by level, source and substring
  matchRanges,   // match ranges for highlighting
} from "@/components/ui/log-stream/logBuffer";`}
        />
      </Section>
    </>
  );
}
