import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { FlowCanvasDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "zoom", title: "Zooming to the cursor" },
  { id: "logic", title: "The maths, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A pan/zoom canvas with nodes and edges — a small react-flow. The canvas pans by
        dragging, zooms with the wheel, and nodes move and snap to the grid.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add flow-canvas" />
      </Section>

      <Section title="Example" id="example">
        <Example
          plain
          code={`<FlowCanvas
  nodes={nodes}
  onNodesChange={setNodes}
  edges={edges}
  renderNode={(node) => <div>{node.label}</div>}
/>`}
        >
          <FlowCanvasDemo />
        </Example>
        <p>
          Drag the background and the canvas pans. The wheel zooms. Nodes drag and land on the
          grid. The ⤢ button fits everything into view.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "nodes", type: "N[]", required: true, description: "The nodes: id, x, y, width?, height?." },
            {
              name: "renderNode",
              type: "(node, meta) => ReactNode",
              required: true,
              description: "A node's contents.",
            },
            {
              name: "edges",
              type: "FlowEdge[]",
              default: "[]",
              description: "Links, with optional port sides.",
            },
            {
              name: "onNodesChange",
              type: "(nodes) => void",
              description: "The new positions after a drag. Without it nodes do not move.",
            },
            {
              name: "grid",
              type: "number",
              default: "20",
              description: "The grid step for snapping and the background. 0 disables the grid.",
            },
            {
              name: "onSelect",
              type: "(node | null) => void",
              description: "Selecting a node, or clearing it by clicking the background.",
            },
          ]}
        />
      </Section>

      <Section title="Zooming to the cursor" id="zoom">
        <Callout tone="why" title="The point under the cursor stays put">
          That is the whole point of zooming: the world point under the cursor must land on
          the same screen point before and after. Otherwise the wheel drags the canvas
          sideways and aiming at a node becomes impossible. The camera offset is adjusted so
          that the point does not move.
        </Callout>
      </Section>

      <Section title="The maths, separately" id="logic">
        <CodeBlock
          code={`import {
  worldToScreen, screenToWorld,  // mutually inverse transforms
  zoomAt,                        // zoom that preserves the point under the cursor
  fitView,                       // a camera that fits everything on screen
  snapToGrid, portPoint, edgePath,
} from "@/components/ui/flow-canvas/viewport";`}
        />
      </Section>
    </>
  );
}
