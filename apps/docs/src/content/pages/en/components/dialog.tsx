import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DialogDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "a11y", title: "Focus and keyboard" },
  { id: "label", title: "A window without a heading" },
];

export default function Page() {
  return (
    <>
      <p>
        A modal window: portalled into <code>body</code>, with a scrim, a focus trap, Escape
        and a scroll lock on the page beneath it.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { Dialog, Button, Field, Input } from "@toimetdev/pathlogs-core";

const [open, setOpen] = useState(false);

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="New project"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={submit}>Create</Button>
    </>
  }
>
  <Field label="Name" required>
    {(props) => <Input {...props} />}
  </Field>
</Dialog>`}
        >
          <DialogDemo />
        </Example>
        <p>
          The state lives outside. That way one and the same window serves both creating and
          editing without growing an internal mode of its own.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "open", type: "boolean", required: true, description: "Whether the window is shown." },
            {
              name: "onClose",
              type: "() => void",
              required: true,
              description: "Called on Escape, a click on the scrim, and the close button.",
            },
            { name: "title", type: "string", description: "The visible heading of the window." },
            {
              name: "header",
              type: "ReactNode",
              description:
                "A custom heading instead of the title string — with an icon and a counter, say.",
            },
            {
              name: "label",
              type: "string",
              description:
                "The accessible name when there is no visible heading: the window draws its own, but a screen reader still needs a name.",
            },
            { name: "footer", type: "ReactNode", description: "The action bar at the bottom." },
            {
              name: "size",
              type: '"sm" | "md" | "lg" | "xl"',
              default: '"md"',
              description: "Maximum width: 24 / 32 / 42 / 56 rem.",
            },
            {
              name: "align",
              type: '"center" | "top"',
              default: '"center"',
              description: "Pin the window to the top — this is how the command palette sits.",
            },
            {
              name: "busy",
              type: "boolean",
              default: "false",
              description: "Saving in progress: closing is blocked so the result is not lost.",
            },
            {
              name: "dismissOnBackdrop",
              type: "boolean",
              default: "true",
              description: "Close on a click on the scrim.",
            },
            {
              name: "dismissOnEscape",
              type: "boolean",
              default: "true",
              description: "Close on Escape.",
            },
          ]}
        />
      </Section>

      <Section title="Focus and keyboard" id="a11y">
        <ul>
          <li>
            On opening, focus moves to the first interactive element, or to the panel itself
            if there is none. Without this the keyboard would be left on the page beneath the
            scrim.
          </li>
          <li>
            Tab from the last element wraps back to the first: focus never leaves the window.
          </li>
          <li>
            On closing, focus returns to wherever the window was opened from — otherwise after
            Escape the keyboard would end up at the top of the page.
          </li>
          <li>
            Page scrolling beneath the window is locked: otherwise the wheel over the scrim
            scrolls the content away, and on closing the user is no longer where they were.
          </li>
        </ul>
        <Callout tone="why" title="The data-pl-overlay attribute on the scrim">
          It is a marker meaning «a window is open above everything». Because of it,{" "}
          <code>useDismiss</code> does not close dropdown menus: the click and Escape are
          addressed to the window, and closing the menu would take the dialog declared inside
          it along too.
        </Callout>
      </Section>

      <Section title="A window without a heading" id="label">
        <p>
          If the window draws its own heading (a confirmation, a palette), pass{" "}
          <code>label</code> instead of <code>title</code>: no header bar appears, but the
          accessible name remains.
        </p>
        <CodeBlock
          code={`<Dialog open={open} onClose={close} label="Delete project?" size="sm">
  {/* your own markup with an icon and a heading */}
</Dialog>`}
        />
      </Section>
    </>
  );
}
