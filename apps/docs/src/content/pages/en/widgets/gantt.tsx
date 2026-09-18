import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { GanttDemo } from "@/demos/widgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "critical", title: "The critical path" },
  { id: "drag", title: "Dragging" },
  { id: "layout", title: "The layout, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A Gantt chart: dated items as bars that can be moved and stretched by their edges.
        Dependencies are drawn as arrows, and the critical path is highlighted.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add gantt" />
      </Section>

      <Section title="Example" id="example">
        <Example
          plain
          code={`<Gantt
  items={tasks}
  edges={links.filter((l) => l.type === "BLOCKS")}
  locale="en-US"
  renderLabel={(task) => (
    <>
      <span className="font-mono text-[11px] text-muted">UI-{task.number}</span>
      <span className="truncate">{task.title}</span>
    </>
  )}
  barColor={(task) => STATUS_COLORS[task.status]}
  onChangeDates={(id, dates) => updateTaskAction(id, dates)}
  onOpenItem={(task) => router.push(\`/tasks/\${task.id}\`)}
/>`}
        >
          <GanttDemo />
        </Example>
        <p>
          Drag a bar whole or by its edge. The canvas pans on both axes, arrows scroll, and
          Home and End jump to the ends.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "items",
              type: "I[]",
              required: true,
              description: (
                <>
                  The items. They need <code>id</code>, <code>startDate</code> and{" "}
                  <code>dueDate</code> — strings like <code>2026-02-14</code>.
                </>
              ),
            },
            {
              name: "renderLabel",
              type: "(item: I) => ReactNode",
              required: true,
              description: "The row's caption in the left-hand column.",
            },
            {
              name: "edges",
              type: "{ fromId, toId }[]",
              default: "[]",
              description: "«from blocks to» links: arrows and the critical path.",
            },
            {
              name: "onChangeDates",
              type: "(itemId, { startDate, dueDate }) => void | Promise",
              description: "The new dates after a drag. Without it the chart is read-only.",
            },
            { name: "onOpenItem", type: "(item: I) => void", description: "A click on a bar." },
            {
              name: "barColor",
              type: "(item: I) => string",
              description: "The bar colour — usually by status. Overridden by the item.color field.",
            },
            {
              name: "locale",
              type: "string",
              description: "The locale for the scale's captions. Defaults to the browser's locale.",
            },
            { name: "labels", type: "GanttLabels", description: "Captions. English by default." },
          ]}
        />
        <Callout tone="note" title="A single date is enough">
          An item with only a due date is drawn as a one-day bar. Otherwise half the plan —
          everything given a deadline but no start — would simply be invisible. A due date
          earlier than the start does not produce an inside-out bar: it collapses to a day.
        </Callout>
      </Section>

      <Section title="The critical path" id="critical">
        <p>
          The chain of dependencies that is longest by total duration. Highlighted in amber —
          both the bars themselves and the arrows between them.
        </p>
        <Callout tone="why" title="A cycle has no path">
          The path is computed in topological order. If the vertices could not be ordered,
          there is a cycle in the graph — and then a critical path simply does not exist.
          Showing some chain anyway would be a lie: you cannot plan against it.
        </Callout>
        <p>
          A single item does not count as a path either: «a critical path of one task» says
          nothing about the plan.
        </p>
      </Section>

      <Section title="Dragging" id="drag">
        <ul>
          <li>
            <strong>A whole bar</strong> moves both ends, preserving its duration.
          </li>
          <li>
            <strong>The edges</strong> move only their own end and stop against the opposite
            one — you cannot turn a bar inside out and get a due date before the start.
          </li>
          <li>
            <strong>The offset is rounded to a day.</strong> A bar lands on a whole day, not
            between days.
          </li>
          <li>
            <strong>A zero offset saves nothing</strong> — that was a click, not a drag.
          </li>
        </ul>
        <Callout tone="note" title="Dates are assembled from local parts">
          <code>toISOString()</code> converts to UTC and, in negative time zones, shifts the
          date back by a day. So the string is assembled from <code>getFullYear</code>,{" "}
          <code>getMonth</code> and <code>getDate</code> — and «14 February» stays the
          fourteenth in every zone.
        </Callout>
      </Section>

      <Section title="The layout, separately" id="layout">
        <CodeBlock
          code={`import {
  datedRows,      // what makes it onto the chart at all, in start order
  buildScale,     // the date scale: day width chosen from the plan's length
  layoutBars,     // the position of each bar
  criticalPath,   // the longest chain of dependencies
  applyDrag,      // the dates after a drag
  toISODate,
} from "@/components/ui/gantt/ganttLayout";`}
        />
        <p>
          The day width is chosen automatically: 32px for plans up to a month and a half, 20px
          up to three months, and 12px beyond that. Over a yearly horizon, 32px per day would
          give you a canvas impossible to scroll through.
        </p>
      </Section>
    </>
  );
}
