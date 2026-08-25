import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "behaviour", title: "Behaviour" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        Sticky navigation across the sections of a long page: a click scrolls to the block,
        and the active entry lights up as you read.
      </p>

      <Section title="Example" id="example">
        <CodeBlock
          code={`import { SectionNav } from "@toimetdev/pathlogs-core";

<SectionNav
  aria-label="Task sections"
  sections={[
    { id: "overview", label: "Overview" },
    { id: "checklist", label: "Checklist", count: 7 },
    { id: "comments", label: "Comments", count: 12 },
    { id: "history", label: "History" },
  ]}
/>

{/* further down the page */}
<section id="overview">…</section>
<section id="checklist">…</section>`}
        />
        <p>
          Sections are located by <code>id</code>, so nothing is required of the page itself
          beyond those identifiers.
        </p>
      </Section>

      <Section title="Behaviour" id="behaviour">
        <ul>
          <li>
            <strong>The scroll inset</strong> is taken from the bar itself: its{" "}
            <code>top</code> from CSS plus its height. The bar sticks under the header on a
            narrow screen and to the top of the window on a wide one — a hard-coded number
            would be wrong in one of those cases.
          </li>
          <li>
            <strong>The row of sections drag-scrolls</strong> on a narrow screen, and clicking
            keeps working while it does: dragging engages only past a movement threshold.
          </li>
          <li>
            <strong>Smoothness is disabled</strong> under <code>prefers-reduced-motion</code>.
          </li>
        </ul>
        <Callout tone="note" title="The component is a wrapper over useActiveSection">
          If you need your own navigation markup (a vertical list, a table of contents on the
          right — like the one on this page), take <code>useActiveSection</code> directly.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "sections",
              type: "{ id: string; label: string; count?: number }[]",
              required: true,
              description:
                "Sections in the order they appear on the page. count is drawn as a badge on the right.",
            },
            {
              name: "aria-label",
              type: "string",
              description: "The accessible name of the navigation: «Task sections».",
            },
            { name: "className", type: "string", description: "Extra classes for the container." },
          ]}
        />
      </Section>
    </>
  );
}
