import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { ActivityTimelineDemo } from "@/demos/dataviz";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "bursts", title: "Collapsing runs" },
  { id: "logic", title: "The grouping, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A chronology of events: grouped by day, with consecutive similar events collapsed into
        a single entry. The feed stays readable instead of drowning in seven identical
        «changed the status» lines.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`<ActivityTimeline
  events={feed}
  renderEvent={(e) => <span><b>{e.actor}</b> {e.text}</span>}
  renderBurst={(events) => <span><b>{events[0].actor}</b> updated statuses</span>}
  renderIcon={(e) => <span>{ICONS[e.kind]}</span>}
/>`}
        >
          <ActivityTimelineDemo />
        </Example>
        <p>Expand a collapsed run to see the individual events inside it.</p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "events",
              type: "E[]",
              required: true,
              description: "The events. They need id, at (the time) and kind (the type).",
            },
            {
              name: "renderEvent",
              type: "(event: E) => ReactNode",
              required: true,
              description: "How to render a single event.",
            },
            { name: "renderBurst", type: "(events: E[]) => ReactNode", description: "The heading of a collapsed run." },
            { name: "renderIcon", type: "(event: E) => ReactNode", description: "The marker on the left of the timeline." },
            { name: "now", type: "Date", description: "The reference point for relative time. Defaults to now." },
            { name: "order", type: '"desc" | "asc"', default: '"desc"', description: "Newest on top or at the bottom." },
            {
              name: "burstThreshold",
              type: "number",
              default: "3",
              description: "From how many consecutive similar events to start collapsing.",
            },
            { name: "expandable", type: "boolean", default: "true", description: "Expand a run on click." },
          ]}
        />
      </Section>

      <Section title="Collapsing runs" id="bursts">
        <Callout tone="why" title="A run never crosses a day boundary">
          Events are first cut into calendar days, and only then are runs collapsed within each
          day. Otherwise «×7» could mean «six yesterday and one today» — and the day heading
          would stop meaning anything.
        </Callout>
        <p>
          The gap inside a run is measured between neighbouring events, not from its start: ten
          edits at one every twenty minutes are one piece of work, not five separate runs.
        </p>
      </Section>

      <Section title="The grouping, separately" id="logic">
        <CodeBlock
          code={`import {
  groupActivity,   // events → days with runs collapsed
  collapseBursts,  // collapsing consecutive similar events
  relativeTime,    // «5 minutes ago» in a given locale
  dayLabel,        // «Today» / «Yesterday» / a date
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
