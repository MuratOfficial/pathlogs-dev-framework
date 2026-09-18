import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DragScrollAxisDemo, DragScrollDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Example" },
  { id: "options", title: "Options" },
  { id: "axis", title: "Both axes" },
  { id: "how", title: "How it works" },
  { id: "styles", title: "Styles" },
  { id: "math", title: "The maths, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        Grab the strip, pull — it follows the cursor and coasts to a stop after you let go.
        Like panning a graph, but for an ordinary scrollable container.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { useDragScroll } from "@toimetdev/pathlogs-hooks";

function Board() {
  const ref = useDragScroll<HTMLDivElement>({ axis: "x", keyboard: true });

  return (
    <div ref={ref} className="flex gap-3 overflow-x-auto">
      {columns.map((c) => <Column key={c.id} {...c} />)}
    </div>
  );
}`}
        >
          <DragScrollDemo />
        </Example>
        <p>
          The hook returns a ref callback — hanging it on the container is enough. The scroll
          classes (<code>overflow-x-auto</code> and friends) are yours to set: the hook is
          responsible for behaviour, not layout.
        </p>
      </Section>

      <Section title="Options" id="options">
        <PropsTable
          rows={[
            {
              name: "axis",
              type: '"x" | "y" | "both"',
              default: '"x"',
              description:
                "The scrolling axis. Keys across the axis are not intercepted — the page is waiting for those.",
            },
            {
              name: "momentum",
              type: "boolean",
              default: "true",
              description: (
                <>
                  Inertia after a fling. Switched off automatically under{" "}
                  <code>prefers-reduced-motion</code>.
                </>
              ),
            },
            {
              name: "keyboard",
              type: "boolean",
              default: "false",
              description:
                "The strip joins the tab order and listens for arrows, Page and Home/End — but only while focus is on the strip itself, not on an element inside it.",
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Temporarily disable dragging without removing the hook.",
            },
          ]}
        />
        <Callout tone="note" title="Options are read at event time">
          <code>axis</code> and <code>enabled</code> can change on the fly: the hook reads
          them on every event rather than at bind time, so listeners are never re-subscribed
          and the ref callback stays stable.
        </Callout>
      </Section>

      <Section title="Both axes" id="axis">
        <p>
          With <code>axis: &quot;both&quot;</code> the canvas drags in any direction — this is
          how the Gantt chart is panned:
        </p>
        <Example
          code={`const ref = useDragScroll<HTMLDivElement>({ axis: "both", momentum: false });

<div ref={ref} className="h-56 overflow-auto">
  <div className="w-[48rem]">…</div>
</div>`}
        >
          <DragScrollAxisDemo />
        </Example>
      </Section>

      <Section title="How it works" id="how">
        <p>
          There is a lot here that is not obvious, and almost every decision is an answer to a
          specific breakage:
        </p>
        <ul>
          <li>
            <strong>Clicks do not break.</strong> Dragging engages only past a 5px movement
            threshold, and a click «caught» by it is suppressed during the capture phase.
            Without this, a shaky hand while clicking a card would open the card instead of
            scrolling — or the other way round.
          </li>
          <li>
            <strong>Native drag&amp;drop wins.</strong> On <code>dragstart</code> the drag
            is cancelled and the strip starts auto-scrolling near the edge. Otherwise there
            would be no way to carry a card to a column off-screen: during a native drag the
            pointer belongs to the browser.
          </li>
          <li>
            <strong>Touch is left alone.</strong> Finger scrolling is already native there,
            and intercepting it would only make it worse.
          </li>
          <li>
            <strong>Cursor and edges follow reality.</strong> The «grab» cursor and the fading
            edges appear only when the strip actually has somewhere to go.
          </li>
          <li>
            <strong>Inertia dies against the edge.</strong> Hit the end and velocity is zeroed,
            so the strip does not judder at the boundary. A long frame (the tab was in the
            background) does not teleport the strip: the step is capped at 50ms.
          </li>
        </ul>
        <Callout tone="why" title="Why a fling dies if you «drag and hold»">
          Velocity is measured over a 90ms window before the <em>release</em>, not before the
          last point of the track. So a pause at the end of the gesture lands in the
          denominator: hold still and there is no inertia, and the strip stays exactly where
          you brought it.
        </Callout>
      </Section>

      <Section title="Styles" id="styles">
        <p>
          The visual half lives in{" "}
          <code>@toimetdev/pathlogs-tokens/styles/scroll.css</code> and hooks onto the data
          attributes the hook sets:
        </p>
        <CodeBlock
          lang="html"
          code={`<div data-pl-drag-scroll="true"      <!-- there is room to scroll: «grab» cursor -->
     data-pl-scroll-edge="both"     <!-- content is hidden left and right -->
     data-pl-scroll-edge-y="end"    <!-- and below -->
     data-pl-scroll-keys="true">    <!-- listening for keys -->`}
        />
        <Callout tone="why" title="Why edges fade with a mask rather than an overlay gradient">
          An overlay needs an extra wrapper element and knowledge of what lies beneath the
          strip: coloured columns, an image, a different theme. A mask works on the element
          itself and depends on neither background nor theme. The X and Y layers intersect,
          so a single container fades both the sides and the top and bottom at once.
        </Callout>
      </Section>

      <Section title="The maths, separately" id="math">
        <p>
          All the arithmetic is lifted out of the hook and knows nothing about the DOM — which
          is why it is covered by tests rather than checked by hand:
        </p>
        <CodeBlock
          code={`import {
  isDragIntent,     // movement passed the threshold — a drag, not a click
  flingVelocity,    // fling speed from the pointer track
  decayVelocity,    // inertia decay per frame
  edgeScrollSpeed,  // auto-scroll speed near the edge during drag&drop
  hiddenEdges,      // which edge «continues» off-screen
  keyboardScroll,   // what a given key press should do
} from "@toimetdev/pathlogs-hooks";`}
        />
        <p>
          The same module holds <code>attachDragScroll(el, getOptions)</code> — binding to an
          element without React, if you need the behaviour outside the React tree.
        </p>
      </Section>
    </>
  );
}
