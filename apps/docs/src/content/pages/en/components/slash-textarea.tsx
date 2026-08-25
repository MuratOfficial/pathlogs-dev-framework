import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { SlashTextareaDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "logic", title: "Trigger detection, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A text field with a «/» command menu — as in Notion, Linear and Slack. A relative of{" "}
        <a href="/docs/components/mention-textarea">MentionTextarea</a>, except «/» runs an
        action or inserts a template rather than a name.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`<SlashTextarea
  value={value}
  onValueChange={setValue}
  commands={commands}
  onCommand={(cmd) => {
    if (cmd.id === "date") return new Date().toLocaleDateString(); // gets inserted
    createTask();                                                  // or an action
  }}
/>`}
        >
          <SlashTextareaDemo />
        </Example>
        <p>Type «/» in the field and the menu appears. Arrows and Enter pick a command.</p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "value / onValueChange",
              type: "string / (v) => void",
              required: true,
              description: "The field's text.",
            },
            {
              name: "commands",
              type: "SlashCommand[]",
              required: true,
              description: "The commands: id, label, hint, icon, keywords.",
            },
            {
              name: "onCommand",
              type: "(cmd) => string | void",
              required: true,
              description: "A string is inserted in place of «/…»; void means an action command.",
            },
            { name: "trigger", type: "string", default: '"/"', description: "The trigger character." },
            { name: "rows", type: "number", default: "4", description: "The field height." },
          ]}
        />
      </Section>

      <Section title="Trigger detection, separately" id="logic">
        <Callout tone="why" title="A path does not open the menu">
          The trigger only fires at the start of a line or after a space: <code>/dep</code> is
          a command, <code>src/index.ts</code> is not. The same machinery catches «@» for
          mentions and «#» for labels.
        </Callout>
        <CodeBlock
          code={`import {
  triggerAt,       // the active trigger at the caret (null — menu closed)
  replaceTrigger,  // replace «/…» with text and return the new caret
  filterByQuery,   // pick matches for what has been typed
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
