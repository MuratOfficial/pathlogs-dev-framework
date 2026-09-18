import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DismissDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Example" },
  { id: "options", title: "Options" },
  { id: "blocked", title: "A dialog on top of a menu" },
];

export default function Page() {
  return (
    <>
      <p>
        Closing a popup layer on an outside click and on Escape. A small hook — but with one
        caveat that is the whole reason it exists.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { useRef, useState } from "react";
import { useDismiss } from "@toimetdev/pathlogs-hooks";

function Popover() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useDismiss(box, { enabled: open, onDismiss: () => setOpen(false) });

  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((v) => !v)}>Open</button>
      {open && <div className="absolute">…</div>}
    </div>
  );
}`}
        >
          <DismissDemo />
        </Example>
        <Callout tone="why" title="Why mousedown and not click">
          A click on a button outside would otherwise get to run before the close — and would
          reopen the layer, making it look like it refuses to close.
        </Callout>
      </Section>

      <Section title="Options" id="options">
        <PropsTable
          rows={[
            {
              name: "enabled",
              type: "boolean",
              required: true,
              description: "While false, no listeners are attached at all.",
            },
            {
              name: "onDismiss",
              type: "() => void",
              required: true,
              description: "What to do. Read at event time.",
            },
            {
              name: "escape",
              type: "boolean",
              default: "true",
              description: "Close on Escape.",
            },
            {
              name: "outsideClick",
              type: "boolean",
              default: "true",
              description: "Close on an outside click.",
            },
            {
              name: "blockedBy",
              type: "string",
              default: '"[data-pl-overlay]"',
              description: (
                <>
                  A selector meaning «something else is open above me». While such an element
                  is in the document, closing is skipped.
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section title="A dialog on top of a menu" id="blocked">
        <p>
          This is what <code>blockedBy</code> is for. A typical piece of markup: the dialog's
          trigger sits <em>inside</em> a dropdown menu, while the dialog itself is portalled
          into <code>body</code>.
        </p>
        <CodeBlock
          code={`<Menu>
  <MenuItem onClick={() => setConfirmOpen(true)}>Delete project</MenuItem>
  <ConfirmDialog open={confirmOpen} … />   {/* portalled into body */}
</Menu>`}
        />
        <p>
          Clicking the menu item opens the dialog. If the menu closed on that same click, it
          would unmount the trigger — and with it the dialog declared inside. The window would
          never appear: the user would simply see that «the button does not work».
        </p>
        <Callout tone="note" title="How it is wired">
          <code>Dialog</code> puts a <code>data-pl-overlay</code> attribute on its scrim.
          While such an element is in the document, <code>useDismiss</code> ignores both the
          click and Escape: they are addressed to the window, which already covers the menu
          anyway.
        </Callout>
        <p>
          If you have your own modals, give their selector:{" "}
          <code>{'blockedBy: ".my-modal-backdrop"'}</code>. An empty string turns the check
          off.
        </p>
      </Section>
    </>
  );
}
