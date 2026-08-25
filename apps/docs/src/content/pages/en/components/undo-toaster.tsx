import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { UndoToasterDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "merge", title: "Merging runs" },
  { id: "logic", title: "The stack, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        «Undo» with a visible timer instead of a confirmation dialog. The action happens
        immediately, and beside it, for a few seconds, an undo appears with a draining ring.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`<UndoToaster onUndo={(a) => restore(a.payload)}>
  {({ notify }) => (
    <button onClick={() => {
      remove(item);
      notify({ label: "Deleted", mergeKey: "delete", payload: item });
    }}>Delete</button>
  )}
</UndoToaster>`}
        >
          <UndoToasterDemo />
        </Example>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "onUndo",
              type: "(action) => void",
              required: true,
              description: "What to do when «Undo» is pressed.",
            },
            {
              name: "children",
              type: "(controller) => ReactNode",
              required: true,
              description: "Gives you notify — called from your action handlers.",
            },
            {
              name: "ttlMs",
              type: "number",
              default: "5000",
              description: "How long an offer lives by default.",
            },
            {
              name: "placement",
              type: '"bottom" | "bottom-left" | "bottom-right"',
              default: '"bottom"',
              description: "Where to pin it.",
            },
          ]}
        />
      </Section>

      <Section title="Merging runs" id="merge">
        <Callout tone="why" title="Three deletions in a row are one offer">
          Actions sharing a <code>mergeKey</code> that arrive consecutively within the window
          fold into a single entry with a counter: «Deleted ×3». Without this, deleting three
          tasks would give you three stacked panels — and only the last one could be undone.
          Merging extends the entry's life from the latest action, not the first.
        </Callout>
      </Section>

      <Section title="The stack, separately" id="logic">
        <CodeBlock
          code={`import {
  pushUndo,      // push an action (merging runs)
  expireUndo,    // split into the living and the expired
  undoProgress,  // the fraction of life elapsed — for the ring
  undoLabel,     // the caption with the run counter
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
