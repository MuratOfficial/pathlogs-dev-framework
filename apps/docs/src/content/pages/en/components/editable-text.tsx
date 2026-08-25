import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { EditableTextDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "behaviour", title: "Behaviour" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        Text that is edited in place with a click: a task title, a description, a note. No
        separate form, and no edit mode for the whole page.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { EditableText } from "@toimetdev/pathlogs-core";

<EditableText
  value={task.title}
  onSave={(next) => updateTask(task.id, { title: next })}
  big
  tip="Click to rename"
/>

<EditableText
  value={task.description}
  onSave={(next) => updateTask(task.id, { description: next })}
  multiline
  markdown
  placeholder="Add a description…"
/>`}
        >
          <EditableTextDemo />
        </Example>
      </Section>

      <Section title="Behaviour" id="behaviour">
        <ul>
          <li>
            <strong>Saving</strong> — on blur, and on Enter in a single-line field. In a
            multiline field Enter inserts a line break, as it should.
          </li>
          <li>
            <strong>Escape</strong> cancels the edit and restores the original value.
          </li>
          <li>
            <strong>The keyboard</strong> opens editing the same way the mouse does: Enter or
            Space on the focused text.
          </li>
          <li>
            <strong>While saving</strong> the text is dimmed — you can see the change has not
            landed yet.
          </li>
        </ul>
        <Callout tone="why" title="An unchanged value is never saved">
          Clicking the text and then clicking away is ordinary behaviour: that is how people
          scroll a page and drop focus. If every such click sent a request, a task's history
          would swell within a week with entries saying «changed the title to the same
          thing». So the draft is compared with the original as trimmed values, and a match
          simply does nothing.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "value", type: "string", required: true, description: "The current value." },
            {
              name: "onSave",
              type: "(next: string) => void | Promise<void>",
              required: true,
              description: "Saving. Until the promise resolves, the text is shown dimmed.",
            },
            {
              name: "multiline",
              type: "boolean",
              default: "false",
              description: "A multiline field instead of a single-line one.",
            },
            {
              name: "markdown",
              type: "boolean",
              default: "false",
              description:
                "Render the value as limited Markdown in view mode. Works together with multiline.",
            },
            { name: "big", type: "boolean", default: "false", description: "A large face — for headings." },
            { name: "placeholder", type: "string", default: '"—"', description: "What to show instead of an empty value." },
            { name: "tip", type: "string", description: "A tooltip when hovering the text." },
            { name: "rows", type: "number", default: "5", description: "The height of the multiline field." },
            { name: "disabled", type: "boolean", default: "false", description: "Editing is not allowed — no permission, say." },
          ]}
        />
      </Section>
    </>
  );
}
