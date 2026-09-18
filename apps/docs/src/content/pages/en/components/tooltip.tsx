import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { TooltipDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "why", title: "Why a layer and not a wrapper" },
  { id: "a11y", title: "Accessibility" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        One tooltip for the whole application. Mounted once at the root, after which any
        element with a <code>data-tip</code> attribute gets a tooltip — nothing to wrap and
        nothing to import.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { TooltipLayer } from "@toimetdev/pathlogs-core";

// once, at the root of the app
<TooltipLayer />

// anywhere afterwards
<button data-tip="Archive project">…</button>
<span data-tip="Blocked by UI-12">🔒</span>`}
        >
          <TooltipDemo />
        </Example>
        <p>
          The tooltip appears above the element, or below it when there is not enough room
          above, and is always kept inside the window horizontally.
        </p>
      </Section>

      <Section title="Why a layer and not a wrapper" id="why">
        <Callout tone="why" title="Clipping inside overflow containers">
          A wrapper component draws the bubble inside the same subtree — which means inside a
          board column, a scrollable list or a strip with <code>overflow: hidden</code>. There
          it gets clipped, and <code>z-index</code> does not save it: inside someone else's
          stacking context it is powerless.
          <br />
          <br />
          A global layer portals the bubble into <code>body</code> with{" "}
          <code>position: fixed</code>. There is nothing left to clip it.
        </Callout>
        <p>Side benefits of the approach:</p>
        <ul>
          <li>a tooltip can be attached to a server component — the attribute needs no JS;</li>
          <li>the DOM holds one bubble rather than a hundred hidden ones;</li>
          <li>nothing has to be imported at the point of use.</li>
        </ul>
        <p>
          The price: <code>fixed</code> coordinates go stale on scroll, so the tooltip simply
          hides while scrolling.
        </p>
      </Section>

      <Section title="Accessibility" id="a11y">
        <p>
          Screen readers announce the native <code>title</code>, but not a custom attribute.
          So the layer sets <code>aria-label</code> itself on elements that have no visible
          text and no <code>aria-label</code> of their own:
        </p>
        <CodeBlock
          lang="html"
          code={`<!-- before -->
<button data-tip="Column settings"><svg …/></button>

<!-- after -->
<button data-tip="Column settings" aria-label="Column settings"><svg …/></button>`}
        />
        <p>
          Elements with text are left alone: their accessible name is already the visible
          text, and duplicating it in a tooltip would mean reading the same thing twice. New
          elements are picked up through a <code>MutationObserver</code>.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "attribute",
              type: "string",
              default: '"data-tip"',
              description: "The anchor attribute. Change it if data-tip is already taken.",
            },
            { name: "maxWidth", type: "number", default: "220", description: "Maximum bubble width, px." },
            { name: "gap", type: "number", default: "8", description: "Gap between the element and the bubble, px." },
          ]}
        />
      </Section>
    </>
  );
}
