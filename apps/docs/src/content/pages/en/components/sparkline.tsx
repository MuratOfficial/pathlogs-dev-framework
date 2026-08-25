import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { SparklineDemo, SparklineTableDemo } from "@/demos/dataviz";

export const toc = [
  { id: "example", title: "Example" },
  { id: "table", title: "Inside a table row" },
  { id: "props", title: "Props" },
  { id: "logic", title: "The geometry, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        An inline sparkline: a trend on one line — in a table, in a badge, in the status bar.
        A single <code>&lt;path&gt;</code> in SVG plus, optionally, dots. No chart library.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`<Sparkline values={commits} width={130} height={30} fill dots />
<Sparkline values={latency} extremes color="var(--warning)" />
<Sparkline values={burndown} smooth fill color="var(--success)" />`}
        >
          <SparklineDemo />
        </Example>
      </Section>

      <Section title="Inside a table row" id="table">
        <p>
          A sparkline's real home is not a chart of its own but a cell next to a number: a
          «how it moved» column without unfolding into a full diagram.
        </p>
        <Example
          code={`<td>{row.name}</td>
<td className="text-right">{row.series.at(-1)}</td>
<td><Sparkline values={row.series} width={90} height={22} /></td>`}
        >
          <SparklineTableDemo />
        </Example>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "values", type: "number[]", required: true, description: "The series, left to right." },
            { name: "width / height", type: "number", default: "120 / 32", description: "Dimensions in pixels." },
            { name: "color", type: "string", default: "var(--accent)", description: "The line colour." },
            {
              name: "fill",
              type: "boolean",
              default: "false",
              description: "Fill the area under the line with a gradient of the line colour.",
            },
            { name: "smooth", type: "boolean", default: "false", description: "Smooth with curves instead of a polyline." },
            { name: "dots", type: "boolean", default: "false", description: "Mark the first and last points." },
            { name: "extremes", type: "boolean", default: "false", description: "Mark the minimum and maximum of the series." },
            {
              name: "zeroBased",
              type: "boolean",
              default: "false",
              description: "Include zero in the scale — then heights are comparable between charts.",
            },
            {
              name: "maxPoints",
              type: "number",
              description: "Thin a long series down to this many points, preserving the outliers.",
            },
            { name: "label", type: "string", description: "The accessible caption. «Trend +N%» by default." },
          ]}
        />
        <Callout tone="why" title="Thinning preserves the outliers">
          With <code>maxPoints</code> the series is compressed by buckets, and each bucket
          keeps its minimum and maximum rather than an average. A sparkline is drawn for the
          sake of its spikes — averaging would be the one sure way to lose them.
        </Callout>
      </Section>

      <Section title="The geometry, separately" id="logic">
        <p>The line maths is pure and reusable without React:</p>
        <CodeBlock
          code={`import {
  sparklineGeometry, // points, the line path and the fill path
  extentOf,          // scale bounds (a flat series never divides by zero)
  decimate,          // thinning that preserves extremes
  trend,             // change from first to last, as a fraction
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
