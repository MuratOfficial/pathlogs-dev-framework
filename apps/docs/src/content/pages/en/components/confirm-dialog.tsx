import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { ConfirmDialogDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "tone", title: "Tone" },
  { id: "wrapper", title: "Your own wrapper" },
];

export default function Page() {
  return (
    <>
      <p>
        Confirming an action instead of <code>window.confirm</code>: the same purpose, but in
        your application's style, with a «working» state and without blocking the thread.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { ConfirmDialog } from "@toimetdev/pathlogs-core";

const [open, setOpen] = useState(false);
const [pending, startTransition] = useTransition();

<ConfirmDialog
  open={open}
  pending={pending}
  title="Delete this column?"
  message="Its cards will move to the first remaining column."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  pendingLabel="Deleting…"
  onConfirm={() => startTransition(() => deleteColumn(id))}
  onCancel={() => setOpen(false)}
/>`}
        >
          <ConfirmDialogDemo />
        </Example>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "open", type: "boolean", required: true, description: "Whether the window is shown." },
            {
              name: "title",
              type: "string",
              required: true,
              description: "The question — short and to the point.",
            },
            {
              name: "message",
              type: "string",
              description:
                "The consequences: what exactly will happen, and what will not be undoable.",
            },
            {
              name: "onConfirm",
              type: "() => void",
              required: true,
              description:
                "Confirmation. The window does not close itself — close it once the action has finished.",
            },
            { name: "onCancel", type: "() => void", required: true, description: "Declining." },
            {
              name: "pending",
              type: "boolean",
              default: "false",
              description: "The action is running: buttons are disabled and the window cannot be closed.",
            },
            {
              name: "tone",
              type: '"danger" | "accent"',
              default: '"danger"',
              description: "A destructive action, or an ordinary question.",
            },
            { name: "confirmLabel", type: "string", default: '"Confirm"', description: "The confirm button's caption." },
            { name: "cancelLabel", type: "string", default: '"Cancel"', description: "The cancel button's caption." },
            { name: "pendingLabel", type: "string", default: '"Working…"', description: "The caption while the action runs." },
          ]}
        />
      </Section>

      <Section title="Tone" id="tone">
        <p>
          <code>danger</code> — an exclamation mark in a triangle and a red button: for
          deletion and anything irreversible. <code>accent</code> — a question mark in a
          circle: for ordinary «are you sure?» moments.
        </p>
        <Callout tone="why" title="Why the window does not close itself">
          The action is almost always asynchronous. Were the window to close immediately, the
          user would see a list with the item still in it and press «delete» a second time. So
          the window stays until the calling code decides everything is done.
        </Callout>
      </Section>

      <Section title="Your own wrapper" id="wrapper">
        <p>
          If your product's wording differs from the defaults, put a thin wrapper in the
          application rather than repeating captions at every call site:
        </p>
        <CodeBlock
          title="src/components/Confirm.tsx"
          code={`import { ConfirmDialog, type ConfirmDialogProps } from "@toimetdev/pathlogs-core";

export function Confirm(props: ConfirmDialogProps) {
  return (
    <ConfirmDialog
      confirmLabel="Yes, go ahead"
      cancelLabel="Never mind"
      pendingLabel="Working on it…"
      {...props}
    />
  );
}`}
        />
        <p>
          The framework makes no claim on such wrappers: the set of captions depends on your
          product's tone of voice, not on the component.
        </p>
      </Section>
    </>
  );
}
