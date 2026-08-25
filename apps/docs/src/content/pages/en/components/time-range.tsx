import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { TimeRangeDemo } from "@/demos/dataviz";

export const toc = [
  { id: "example", title: "Example" },
  { id: "syntax", title: "Syntax" },
  { id: "props", title: "Props" },
  { id: "logic", title: "The parser, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        Picking a time range in <code>now-15m</code> syntax — as in Grafana and Kibana. Ready
        made ranges, free-form expressions, and stepping back and forth by the range's own
        length.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`const [range, setRange] = useState({ from: "now-24h", to: "now" });

<TimeRangePicker value={range} onChange={setRange} locale="en-US" />`}
        >
          <TimeRangeDemo />
        </Example>
      </Section>

      <Section title="Syntax" id="syntax">
        <p>
          An expression is <code>now</code> with an offset and a rounding:
        </p>
        <CodeBlock
          lang="text"
          code={`now              right now
now-15m          fifteen minutes ago
now-1h           an hour ago
now/d            the start of today (on the left) / the end (on the right)
now-1d/d         all of yesterday
now/w            this week (from Monday)
2026-02-14       a specific date`}
        />
        <Callout tone="why" title="The notation stays relative">
          <code>now-1h</code> is stored in the URL as it is and, a day later, still shows the
          last hour rather than the same hour yesterday. A pair of timestamps cannot do that —
          hence an expression rather than two numbers. Converting to absolute dates is
          available at any moment through <code>toAbsolute</code>.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "value", type: "{ from, to }", required: true, description: "The range as a pair of expressions." },
            { name: "onChange", type: "(range) => void", required: true, description: "The new range." },
            { name: "presets", type: "TimePreset[]", description: "Your own set of ready-made ranges instead of the default." },
            { name: "now", type: "Date", description: "The reference point for expressions. Defaults to now." },
            {
              name: "nudge",
              type: "boolean",
              default: "true",
              description: "«Earlier/later» arrows — stepping by the range's own length.",
            },
            { name: "custom", type: "boolean", default: "true", description: "Allow entering your own expressions." },
            { name: "locale", type: "string", default: "en-US", description: "The locale for captions." },
          ]}
        />
      </Section>

      <Section title="The parser, separately" id="logic">
        <CodeBlock
          code={`import {
  resolveRange,      // { from, to } of expressions → a pair of Dates
  parseTimeExpr,     // one expression → a Date (null if unparseable)
  shiftRange,        // step by the range's own length
  toAbsolute,        // convert to absolute dates
  TIME_PRESETS,      // the standard ranges
} from "@toimetdev/pathlogs-core";`}
        />
        <Callout tone="note" title="An unparseable expression is null">
          Parsing does not quietly substitute «the last hour» for something it failed to
          understand: a range silently swapped for a different one is the worst kind of error
          in a report, because the numbers still look real.
        </Callout>
      </Section>
    </>
  );
}
