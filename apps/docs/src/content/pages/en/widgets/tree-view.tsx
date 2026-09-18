import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { TreeViewDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "checks", title: "Tri-state checkboxes" },
  { id: "logic", title: "The model, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A tree with keyboard navigation, tri-state checkboxes and draggable nodes. shadcn/ui
        has no tree at all — and one is needed constantly: files, sections, nested tasks.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add tree-view" />
      </Section>

      <Section title="Example" id="example">
        <Example
          code={`<TreeView
  nodes={tree}
  expanded={expanded}
  onExpandedChange={setExpanded}
  checkable
  checked={checked}
  onCheckedChange={setChecked}
  onMove={(next) => setTree(next)}
  renderLabel={(node) => node.name}
/>`}
        >
          <TreeViewDemo />
        </Example>
        <p>
          Arrows move focus and expand branches, Space ticks a checkbox, and dragging changes
          nesting.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "nodes", type: "N[]", required: true, description: "The tree. A node needs id and children." },
            {
              name: "renderLabel",
              type: "(node, meta) => ReactNode",
              required: true,
              description: "The node's caption.",
            },
            { name: "renderIcon", type: "(node, expanded) => ReactNode", description: "An icon on the left." },
            {
              name: "expanded / onExpandedChange",
              type: "Set<string> / (set) => void",
              description: "The expanded nodes.",
            },
            {
              name: "checkable",
              type: "boolean",
              default: "false",
              description: "Enable tri-state checkboxes.",
            },
            {
              name: "checked / onCheckedChange",
              type: "Set<string> / (set) => void",
              description: "The ticked nodes.",
            },
            {
              name: "onMove",
              type: "(nodes, moved) => void",
              description: "Dragging a node. Without it the tree is read-only.",
            },
            { name: "onActivate", type: "(node) => void", description: "A click or Enter on a node." },
          ]}
        />
      </Section>

      <Section title="Tri-state checkboxes" id="checks">
        <Callout tone="why" title="A parent derives its state from its children">
          A parent node stores no state of its own — it computes it: every child ticked means
          «on», some of them «partial», none «off». Otherwise, after unticking one box deep in
          a branch, the parent would stay ticked and lie about its contents. Clicking a
          «partial» parent turns the whole subtree on — that is how people read it.
        </Callout>
        <Callout tone="why" title="A node cannot be moved into its own descendant">
          Such an operation would cut the subtree off from the tree and it would vanish
          entirely. The check is built into <code>canDrop</code>: an invalid move simply does
          not happen.
        </Callout>
      </Section>

      <Section title="The model, separately" id="logic">
        <CodeBlock
          code={`import {
  flattenTree,    // tree → a flat list of visible rows (for virtualisation)
  moveNode,       // a move, with the descendant check built in
  checkStates,    // tri-state for the whole tree
  treeKeyAction,  // ARIA keyboard behaviour
  filterTree,     // search that keeps ancestors
} from "@/components/ui/tree-view/treeModel";`}
        />
      </Section>
    </>
  );
}
