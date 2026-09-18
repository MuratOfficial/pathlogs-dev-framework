import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { MentionDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "ids", title: "Why ids and not text" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        A text field with <code>@mention</code> autocomplete. The menu opens on «@» and closes
        on a space; Enter and Tab insert the first match.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { MentionTextarea } from "@toimetdev/pathlogs-core";

<form action={addComment}>
  <MentionTextarea
    name="body"
    people={project.members}
    rows={3}
    placeholder="Type @ and start entering a name…"
  />
  <button type="submit">Send</button>
</form>`}
        >
          <MentionDemo />
        </Example>
        <p>
          Insertion bypasses <code>onChange</code>, so the caret lands right after the
          inserted name instead of jumping to the end of the text.
        </p>
      </Section>

      <Section title="Why ids and not text" id="ids">
        <p>
          Next to the field the component keeps a hidden input with the ids of everyone
          mentioned:
        </p>
        <CodeBlock lang="html" code={`<input type="hidden" name="mentions" value="u1,u3" />`} />
        <Callout tone="why" title="Notifications must not depend on the text">
          Parsing «@John Smith» back into a user is a lost cause: people get renamed, projects
          have namesakes, and the user is free to edit the text however they like. An id
          recorded at the moment of picking from the menu survives all of that.
          <br />
          <br />
          The text stays human-readable meanwhile, and <code>Markdown</code> can highlight the
          mentions when displaying it — a list of names is all it needs.
        </Callout>
        <p>
          The hidden field's name is changed with the <code>mentionsName</code> prop, if{" "}
          <code>mentions</code> is already taken in your form.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "name", type: "string", required: true, description: "The field's name in the form." },
            {
              name: "people",
              type: "{ id, name, image? }[]",
              required: true,
              description: "Who can be mentioned. Filtered by substring within the name.",
            },
            {
              name: "mentionsName",
              type: "string",
              default: '"mentions"',
              description: "The name of the hidden field holding comma-separated ids.",
            },
            { name: "limit", type: "number", default: "6", description: "How many matches to show." },
            {
              name: "value / onValueChange",
              type: "string / (value: string) => void",
              description: "External control of the value. Without them the component keeps it itself.",
            },
            { name: "rows", type: "number", default: "2", description: "The field height." },
            { name: "placeholder", type: "string", description: "The hint in an empty field." },
            {
              name: "autoFocus",
              type: "boolean",
              description: "Caret straight into the field — for a reply form opened by a click.",
            },
          ]}
        />
      </Section>
    </>
  );
}
