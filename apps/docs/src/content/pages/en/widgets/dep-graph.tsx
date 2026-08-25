import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DependencyGraphDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "layout", title: "Layered layout" },
  { id: "cycles", title: "Cycles" },
  { id: "logic", title: "The layout, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A dependency graph with a layered layout. A relative of the{" "}
        <a href="/docs/widgets/gantt">Gantt chart</a> — the same «A blocks B» links yield a
        critical path there, and a picture here.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add dep-graph" />
      </Section>

      <Section title="Example" id="example">
        <Example
          plain
          code={`<DependencyGraph
  nodes={tasks}
  edges={links}
  renderNode={(task) => <span>#{task.number} {task.title}</span>}
/>`}
        >
          <DependencyGraphDemo />
        </Example>
        <p>Click a node — its immediate neighbours light up and everything else dims.</p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "nodes", type: "N[]", required: true, description: "The vertices. Only an id is required." },
            { name: "edges", type: "{ from, to }[]", required: true, description: "«from → to» links." },
            {
              name: "renderNode",
              type: "(node, meta) => ReactNode",
              required: true,
              description: "The contents of a node's box.",
            },
            {
              name: "direction",
              type: '"LR" | "TB"',
              default: '"LR"',
              description: "Left to right, or top to bottom.",
            },
            { name: "onSelect", type: "(node) => void", description: "A click on a node." },
            {
              name: "highlightNeighbours",
              type: "boolean",
              default: "true",
              description: "Highlight the selected node's neighbours.",
            },
          ]}
        />
      </Section>

      <Section title="Layered layout" id="layout">
        <p>
          This is a simplified Sugiyama algorithm: break the cycles, assign layers by longest
          path, reduce crossings with the median heuristic, and only then compute coordinates.
          Links that skip a layer are split by dummy bend vertices and route around other
          people's boxes.
        </p>
        <Callout tone="why" title="The layer order never gets worse than it started">
          Minimising crossings exactly is NP-complete, so this is a heuristic. But the best
          result across the passes is chosen by the actual number of crossings rather than by
          faith in the heuristic — so the layout never comes out worse than it was.
        </Callout>
      </Section>

      <Section title="Cycles" id="cycles">
        <Callout tone="why" title="A cycle does not break the picture">
          Layers only exist in a graph without cycles, but refusing to lay it out is not an
          option — a cycle in task dependencies happens all the time, and it needs to be seen,
          not replaced by an empty screen. Back edges are removed, drawn as dashed lines, and
          listed under the graph.
        </Callout>
      </Section>

      <Section title="The layout, separately" id="logic">
        <CodeBlock
          code={`import {
  layoutDag,       // the full layout: nodes, edges, dimensions
  breakCycles,     // remove the back edges
  assignLayers,    // assign vertices to layers
  countCrossings,  // the number of crossings (the quality metric)
} from "@/components/ui/dep-graph/dagLayout";`}
        />
      </Section>
    </>
  );
}
