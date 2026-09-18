import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { MenuDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "dialogs", title: "Dialogs inside a menu" },
  { id: "trigger", title: "Your own button" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        A fold for secondary actions: a «More» button and a dropdown panel. You put ready-made
        buttons inside as they are — they need to know nothing about the menu.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { Menu, MenuItem } from "@toimetdev/pathlogs-core";

<Menu label="More" count={3} tip="Other actions">
  <MenuItem onClick={exportExcel}>Export to Excel</MenuItem>
  <MenuItem href="/projects/1/templates">Task templates</MenuItem>
  <MenuItem tone="danger" onClick={archive}>Archive project</MenuItem>
</Menu>`}
        >
          <MenuDemo />
        </Example>
        <p>
          An entry with <code>href</code> renders as a link rather than a button — so that
          Ctrl+click and «open in new tab» work.
        </p>
      </Section>

      <Section title="Dialogs inside a menu" id="dialogs">
        <p>
          The most common scenario: a menu item opens a modal. The naive implementation breaks
          right here.
        </p>
        <CodeBlock
          code={`<Menu>
  <MenuItem onClick={() => setOpen(true)}>Delete project</MenuItem>
  <ConfirmDialog open={open} onConfirm={remove} onCancel={() => setOpen(false)} />
</Menu>`}
        />
        <Callout tone="why" title="Why the menu stays open while a dialog is up">
          The dialog is declared inside the menu panel. If the menu closed on the click, the
          panel would unmount and take the dialog with it before it ever appeared — from the
          outside this looks like «the button does not work».
          <br />
          <br />
          So <code>useDismiss</code> skips closing while a{" "}
          <code>[data-pl-overlay]</code> — the marker of an open modal — is in the document.
          The modal covers the menu anyway, so there is no visible difference.
        </Callout>
      </Section>

      <Section title="Your own button" id="trigger">
        <p>
          The default button is three dots with a caption. If you need a different one, pass a{" "}
          <code>trigger</code>: it receives the open state and a toggle.
        </p>
        <CodeBlock
          code={`<Menu
  trigger={({ open, toggle }) => (
    <Button variant={open ? "primary" : "secondary"} onClick={toggle}>
      Actions {open ? "▲" : "▼"}
    </Button>
  )}
>
  <MenuItem onClick={…}>…</MenuItem>
</Menu>`}
        />
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "children", type: "ReactNode", required: true, description: "The panel's contents." },
            {
              name: "label",
              type: "string",
              default: '"More"',
              description: "The button caption. Hidden on narrow screens, leaving the icon.",
            },
            {
              name: "trigger",
              type: "(props: { open, toggle }) => ReactNode",
              description: "Your own button instead of the default one.",
            },
            { name: "count", type: "number", description: "How many actions are hidden — as a number on the button." },
            {
              name: "align",
              type: '"start" | "end"',
              default: '"end"',
              description: "Which side the panel drops from.",
            },
            { name: "tip", type: "string", description: "A tooltip on the button." },
          ]}
        />
        <p>
          <code>MenuItem</code> takes <code>onClick</code> or <code>href</code>,{" "}
          <code>icon</code>, <code>tone</code> (<code>default</code> or <code>danger</code>)
          and <code>disabled</code>.
        </p>
      </Section>
    </>
  );
}
