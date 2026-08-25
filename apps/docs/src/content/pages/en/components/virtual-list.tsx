import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { VirtualListDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "sizes", title: "Variable heights" },
  { id: "hook", title: "The useVirtual hook" },
];

export default function Page() {
  return (
    <>
      <p>
        Windowed rendering of a long list: only the visible part lives in the DOM. At ten
        thousand rows an ordinary <code>map</code> puts the tab on the floor — the browser
        cannot carry that many nodes.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`<VirtualList items={rows} itemKey={(r) => r.id} height={280}>
  {(row) => <div className="row">{row.title}</div>}
</VirtualList>`}
        >
          <VirtualListDemo />
        </Example>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "items", type: "T[]", required: true, description: "The list data." },
            {
              name: "children",
              type: "(item, index) => ReactNode",
              required: true,
              description: "How to render one item.",
            },
            {
              name: "itemKey",
              type: "(item, index) => string | number",
              description: "The item's key. Defaults to the index.",
            },
            {
              name: "estimateSize",
              type: "number | (index) => number",
              default: "40",
              description: "The expected height — a first approximation until measured.",
            },
            {
              name: "stickToBottom",
              type: "boolean",
              default: "false",
              description: "Stick to the end as items arrive — for logs and chats.",
            },
            { name: "overscan", type: "number", default: "4", description: "Spare rows beyond the window's edges." },
            { name: "height", type: "number | string", default: "360", description: "The height of the scroll area." },
          ]}
        />
      </Section>

      <Section title="Variable heights" id="sizes">
        <Callout tone="why" title="Heights need not match">
          <code>estimateSize</code> is only a first approximation. After that every rendered
          item reports its real height, so a list of rows of differing length does not judder
          after the first pass.
        </Callout>
      </Section>

      <Section title="The useVirtual hook" id="hook">
        <p>The component is a thin wrapper over the hook. For your own markup, take it directly:</p>
        <CodeBlock
          code={`import { useVirtual } from "@toimetdev/pathlogs-hooks";

const v = useVirtual({ count: rows.length, estimateSize: 36, stickToBottom: true });
// v.items, v.totalSize, v.scrollRef, v.measure, v.scrollToIndex, v.atBottom`}
        />
      </Section>
    </>
  );
}
