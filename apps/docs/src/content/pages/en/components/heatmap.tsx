import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { HeatmapDemo } from "@/demos/dataviz";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "levels", title: "Levels by quantile" },
  { id: "logic", title: "The grid, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A calendar heatmap of the year — a grid of weeks, like the GitHub contribution graph.
        Each day's value becomes a colour level; months run above the grid, weekdays down the
        left.
      </p>

      <Section title="Example" id="example">
        <Example
          plain
          code={`<HeatmapCalendar
  values={{ "2026-02-14": 3, "2026-02-15": 7 }}
  color="var(--accent)"
  legend
  summary
/>`}
        >
          <HeatmapDemo />
        </Example>
        <p>
          <code>values</code> is a map of «day → number». A missing day counts as zero: there
          is no need to list all 365.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "values",
              type: "Record<string, number>",
              required: true,
              description: "Values by day, in YYYY-MM-DD form.",
            },
            {
              name: "from / to",
              type: "Date",
              description: "The interval bounds. Defaults to the last 365 days up to today.",
            },
            {
              name: "color",
              type: "string",
              default: "var(--accent)",
              description: "The base colour: levels are that colour at increasing opacity.",
            },
            { name: "levels", type: "number", default: "4", description: "How many colour levels, not counting empty." },
            { name: "cellSize", type: "number", default: "12", description: "The side of a cell in pixels." },
            { name: "weekStart", type: "number", default: "1", description: "Which day the week starts on: 1 is Monday." },
            { name: "legend", type: "boolean", default: "false", description: "A «less → more» legend under the grid." },
            {
              name: "summary",
              type: "boolean",
              default: "false",
              description: "A summary: total, active days, longest streak.",
            },
            { name: "onSelectDay", type: "(cell) => void", description: "A click on a cell." },
          ]}
        />
      </Section>

      <Section title="Levels by quantile" id="levels">
        <Callout tone="why" title="One outlier must not flatten the map">
          Level thresholds are computed from the quantiles of the non-zero values, not as equal
          slices from zero to the maximum. Otherwise a single day with a hundred events, on a
          background of ones, would repaint the entire map in the palest level. Quantiles give
          you a picture of the distribution rather than of one peak.
        </Callout>
        <p>
          A day with any non-zero value gets at least the first level: a day on which something
          happened does not look empty.
        </p>
      </Section>

      <Section title="The grid, separately" id="logic">
        <CodeBlock
          code={`import {
  buildHeatmap,        // weeks, months, thresholds, summary
  quantileThresholds,  // level thresholds by quantile
  activityStreaks,     // the current and the longest streak
  trailingRange,       // «the last N days, including today»
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
