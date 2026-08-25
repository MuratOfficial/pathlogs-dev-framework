import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { QueryInputDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "syntax", title: "Syntax" },
  { id: "props", title: "Props" },
  { id: "logic", title: "The parser, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        Structured search: <code>is:open author:me due:&lt;now+7d</code>. What{" "}
        <a href="/docs/widgets/filter-bar">FilterBar</a> gives to clicking on fields, this
        gives to typing — and on the same condition model. Conditions are drawn as chips, and
        keys and values autocomplete at the caret.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`<QueryInput
  value={query}
  onChange={setQuery}
  fields={fields}
  onParsed={(parsed) => setResults(tasks.filter((t) => matchesQuery(t, parsed, fields)))}
/>`}
        >
          <QueryInputDemo />
        </Example>
      </Section>

      <Section title="Syntax" id="syntax">
        <CodeBlock
          lang="text"
          code={`status:open           field equals value
label:bug,ui          any of the values (OR within a condition)
label:bug label:ui    both values (AND between conditions)
-status:done          negation
priority:>=3          numeric comparison
due:<now+7d           date comparison in TimeRangePicker syntax
crash                 a bare word — searched in the text`}
        />
        <Callout tone="why" title="An unknown key matches nothing">
          A typo in <code>assigne:me</code> does not quietly turn into «no filter at all» —
          such a condition passes no items, and the field highlights the unfamiliar key.
          Showing the full list as though a filter had been applied is worse than showing an
          empty one.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "value", type: "string", required: true, description: "The query string." },
            { name: "onChange", type: "(value: string) => void", required: true, description: "The string changed." },
            {
              name: "fields",
              type: "QueryField<T>[]",
              required: true,
              description:
                "The searchable fields: key, type, value options, and how to read the value off an item.",
            },
            {
              name: "onParsed",
              type: "(parsed) => void",
              description: "The parsed query — usually for filtering right away.",
            },
            { name: "onSubmit", type: "(value: string) => void", description: "Enter outside the suggestions." },
            { name: "placeholder", type: "string", description: "The hint in an empty field." },
          ]}
        />
      </Section>

      <Section title="The parser, separately" id="logic">
        <CodeBlock
          code={`import {
  parseQuery,     // string → conditions plus free text
  matchesQuery,   // does an item satisfy the query
  suggestAt,      // what to suggest at this caret position
  stringifyQuery, // conditions → string (for links and presets)
} from "@toimetdev/pathlogs-core";`}
        />
        <p>
          Date values are compared with the same parser as in{" "}
          <a href="/docs/components/time-range">TimeRangePicker</a>: <code>due:&lt;now+7d</code>{" "}
          works out of the box.
        </p>
      </Section>
    </>
  );
}
