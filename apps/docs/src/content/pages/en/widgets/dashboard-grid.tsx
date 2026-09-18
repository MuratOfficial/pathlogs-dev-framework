import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DashboardGridDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "packing", title: "Pushing and compacting" },
  { id: "logic", title: "The packing, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A tile grid with dragging and resizing — a small grid-layout. Tiles live in an integer
        column grid; move one and it pushes its neighbours aside, free up space and everything
        settles upwards.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add dashboard-grid" />
      </Section>

      <Section title="Example" id="example">
        <Example
          plain
          code={`<DashboardGrid
  items={items}
  onItemsChange={setItems}
  columns={12}
  rowHeight={72}
>
  {(item) => <Tile id={item.id} />}
</DashboardGrid>`}
        >
          <DashboardGridDemo />
        </Example>
        <p>
          Drag the tiles and pull the bottom-right corner — neighbours step aside and the grid
          settles.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "items", type: "GridItem[]", required: true, description: "The tiles: id, x, y, w, h, static?." },
            {
              name: "onItemsChange",
              type: "(items) => void",
              required: true,
              description: "The new layout after a gesture.",
            },
            {
              name: "children",
              type: "(item) => ReactNode",
              required: true,
              description: "A tile's contents, by its id.",
            },
            { name: "columns", type: "number", default: "12", description: "The number of columns." },
            { name: "rowHeight", type: "number", default: "80", description: "The row height (px)." },
            { name: "gap", type: "number", default: "12", description: "The gap between tiles (px)." },
            {
              name: "resizable",
              type: "boolean",
              default: "true",
              description: "Allow resizing by the bottom-right corner.",
            },
          ]}
        />
      </Section>

      <Section title="Pushing and compacting" id="packing">
        <Callout tone="why" title="A tile pushes rather than being refused">
          The user drags a tile where they want to put it. Stopping them halfway means ignoring
          the gesture. So the target yields to the tile being dragged, and whoever occupied
          those cells slides down in a cascade. After the gesture the grid settles upwards,
          removing the gaps. The logic is of the same class as the{" "}
          <a href="/docs/widgets/kanban">kanban board's</a>.
        </Callout>
      </Section>

      <Section title="The packing, separately" id="logic">
        <CodeBlock
          code={`import {
  moveItem,      // move, pushing and compacting
  resizeItem,    // resize
  compact,       // settle everything upwards
  findFreeSpot,  // the first free spot for a new tile
} from "@/components/ui/dashboard-grid/gridLayout";`}
        />
      </Section>
    </>
  );
}
