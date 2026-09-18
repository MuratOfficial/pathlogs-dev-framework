import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { PageHintDemo } from "@/demos/basics";
import { DragScrollDemo } from "@/demos/hooks";

export const toc = [
  { id: "portal", title: "Portal" },
  { id: "drag-scroll", title: "DragScroll" },
  { id: "page-hint", title: "PageHint" },
  { id: "backdrop", title: "Backdrop" },
];

export default function Page() {
  return (
    <>
      <p>Four components, each of which fits on a single screen.</p>

      <Section title="Portal" id="portal">
        <p>
          Rendering into <code>body</code>, past the current subtree. Every popup layer needs
          it: an element drawn inside a container with <code>overflow: hidden</code> is
          clipped by its bounds, and a <code>z-index</code> inside someone else's stacking
          context does not save it.
        </p>
        <CodeBlock
          code={`import { Portal } from "@toimetdev/pathlogs-core";

<Portal>
  <div style={{ position: "fixed", inset: 0 }}>…</div>
</Portal>`}
        />
        <Callout tone="note" title="It renders nothing before mounting">
          There is no <code>document</code> on the server, and markup that was absent from the
          server response must not appear in the first frame of hydration. So the portal waits
          for mount.
        </Callout>
        <PropsTable
          rows={[
            { name: "children", type: "ReactNode", required: true, description: "What to render." },
            {
              name: "container",
              type: "Element | null",
              default: "document.body",
              description: "Where to render it.",
            },
          ]}
        />
      </Section>

      <Section title="DragScroll" id="drag-scroll">
        <p>
          A drag-scrollable container — for places with no client component of their own:
          server pages, rows of tabs, wide tables.
        </p>
        <Example
          code={`import { DragScroll } from "@toimetdev/pathlogs-core";

<DragScroll axis="x" keyboard className="flex gap-3 overflow-x-auto">
  {tabs.map((t) => <Tab key={t.id} {...t} />)}
</DragScroll>`}
        >
          <DragScrollDemo />
        </Example>
        <p>
          It takes the same options as{" "}
          <a href="/docs/hooks/use-drag-scroll">useDragScroll</a>: <code>axis</code>,{" "}
          <code>momentum</code>, <code>keyboard</code>, <code>enabled</code>. The scroll
          classes are set by the calling code — the component is responsible for behaviour,
          not layout.
        </p>
      </Section>

      <Section title="PageHint" id="page-hint">
        <p>A subtitle-style hint under a page heading.</p>
        <Example
          code={`import { PageHint } from "@toimetdev/pathlogs-core";

<h1>Project board</h1>
<PageHint>Drag a card to the edge of the board — it scrolls itself.</PageHint>`}
        >
          <PageHintDemo />
        </Example>
        <Callout tone="why" title="Why a separate block and not an ordinary paragraph">
          An explanation set in the same size reads as a continuation of the page's text and
          gets lost. An accent bar, an icon and a muted colour say «this is a note, not
          content» straight away.
        </Callout>
      </Section>

      <Section title="Backdrop" id="backdrop">
        <p>
          A coloured page backdrop: a soft blob at the top or a full-width gradient. In the
          tracker this is a project's personal background — each member has their own.
        </p>
        <CodeBlock
          code={`import { Backdrop } from "@toimetdev/pathlogs-core";

<Backdrop backdrop={{ color: "#6366f1", colorTo: "#ec4899", angle: 135 }} />

// a single colour — a radial blob at the top left
<Backdrop backdrop={{ color: "#10b981" }} />`}
        />
        <p>
          It is drawn <code>fixed</code> behind the content and does not intercept the
          pointer — text above it can be clicked and selected. The colours are translucent, so
          the same backdrop works in both themes.
        </p>
        <p>
          The CSS string can be obtained on its own too — <code>backdropCss(bg)</code> from{" "}
          <code>@toimetdev/pathlogs-tokens</code>. One function serves both the backdrop
          itself and its preview in settings: there is nothing for them to drift apart on.
        </p>
      </Section>
    </>
  );
}
