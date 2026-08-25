import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { TagInputDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "logic", title: "The parsing, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        Multi-value input: chips instead of a comma-separated string. Labels, addresses,
        identifiers. Enter and comma add a value; Backspace in an empty field removes the last
        chip.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`<TagInput
  value={tags}
  onChange={setTags}
  max={6}
  onReject={(v, reason) => toast(reason === "duplicate" ? "already there" : "…")}
/>`}
        >
          <TagInputDemo />
        </Example>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "value / onChange",
              type: "string[] / (tags) => void",
              required: true,
              description: "The list of values.",
            },
            { name: "max", type: "number", description: "The maximum count." },
            {
              name: "caseInsensitive",
              type: "boolean",
              default: "true",
              description: "«Bug» and «bug» are the same value.",
            },
            { name: "validate", type: "(value) => boolean", description: "A check: false rejects the value." },
            {
              name: "separators",
              type: "string[]",
              description: "Separators used when parsing a paste. Comma, semicolon and newline by default.",
            },
            {
              name: "onReject",
              type: "(value, reason) => void",
              description: "A rejected value: duplicate | invalid | limit.",
            },
            { name: "name", type: "string", description: "A hidden field — to submit the tags with an ordinary form." },
          ]}
        />
      </Section>

      <Section title="The parsing, separately" id="logic">
        <Callout tone="why" title="The main case is a paste from the clipboard">
          <code>a, b;c</code> pasted from an email or a spreadsheet is broken into separate
          chips, with duplicates and blanks filtered out. Space is not among the separators:
          values are often two words («Murat Toimet», «in progress»).
        </Callout>
        <CodeBlock
          code={`import {
  addTags,       // add, filtering duplicates, blanks and anything over the limit
  splitTags,     // split a pasted string by the separators
  normalizeTag,  // trim whitespace and surrounding quotes
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
