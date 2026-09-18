import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "options", title: "Options" },
  { id: "rules", title: "Highlighting rules" },
];

export default function Page() {
  return (
    <>
      <p>
        Highlighting the active section while scrolling — and smoothly moving to it on click.
        The table of contents on the right of this very page runs on it.
      </p>

      <Section title="Example" id="example">
        <CodeBlock
          code={`import { useActiveSection } from "@toimetdev/pathlogs-hooks";

function Toc({ entries }) {
  const { active, scrollTo } = useActiveSection(
    entries.map((e) => e.id),
    { offset: 80 }        // height of the sticky header
  );

  return (
    <ul>
      {entries.map((e) => (
        <li key={e.id}>
          <button
            onClick={() => scrollTo(e.id)}
            aria-current={active === e.id ? "true" : undefined}
          >
            {e.title}
          </button>
        </li>
      ))}
    </ul>
  );
}`}
        />
        <p>
          Sections are located with <code>document.getElementById</code>, so on the page
          itself it is enough to put <code>id</code>s on the headings.
        </p>
      </Section>

      <Section title="Options" id="options">
        <PropsTable
          rows={[
            {
              name: "ids",
              type: "string[]",
              required: true,
              description: "Section ids, in the order they appear on the page.",
            },
            {
              name: "offset",
              type: "number | (() => number)",
              default: "0",
              description: (
                <>
                  The top inset below which a section counts as «scrolled to» — usually the
                  height of the sticky bar. Pass a function if that height depends on the
                  screen width.
                </>
              ),
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Turn tracking off.",
            },
          ]}
        />
        <p>
          Returns <code>{"{ active, scrollTo }"}</code>. Smooth scrolling is disabled under{" "}
          <code>prefers-reduced-motion</code>.
        </p>
        <Callout tone="note" title="Prefer passing the offset as a function">
          A sticky bar tucks under the header on a narrow screen and sits at the top of the
          window on a wide one. A hard-coded number will be wrong in one of those cases; a
          function computes the inset at check time.
        </Callout>
      </Section>

      <Section title="Highlighting rules" id="rules">
        <p>
          The active section is the last one whose top edge has already passed the offset
          line. With two exceptions:
        </p>
        <ul>
          <li>
            <strong>Before you have reached any of them</strong> — the first one is active.
            Otherwise nothing would be highlighted at the top of the page.
          </li>
          <li>
            <strong>At the very bottom of the page</strong> — the last one is active. Short
            sections at the end physically cannot rise to the line, and without this rule they
            would never light up.
          </li>
        </ul>
        <Callout tone="why" title="Why the recalculation is tied to the frame">
          Scroll events arrive more often than the browser paints frames. Computing positions
          on every one of them means thrashing layout dozens of times a second for nothing.
          So the recalculation is deferred to <code>requestAnimationFrame</code>.
        </Callout>
        <p>
          The arithmetic itself lives in{" "}
          <code>activeSectionId(positions, line, atBottom)</code> — a pure, DOM-free function
          covered by tests.
        </p>
      </Section>
    </>
  );
}
