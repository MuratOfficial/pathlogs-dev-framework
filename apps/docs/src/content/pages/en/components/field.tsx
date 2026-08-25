import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { FieldDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "render-prop", title: "Why a function, not children" },
  { id: "props", title: "Props" },
  { id: "inputs", title: "The inputs on their own" },
];

export default function Page() {
  return (
    <>
      <p>
        A field wrapper: label, hint and error — and the wiring that connects them to the
        input through <code>id</code> and <code>aria-describedby</code>.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { Field, Input, Select, Textarea } from "@toimetdev/pathlogs-core";

<Field label="Project name" required hint="Visible to every member">
  {(props) => <Input {...props} defaultValue="Customer portal" />}
</Field>

<Field label="Email" error={invalid ? "That does not look like an email address" : undefined}>
  {(props) => <Input {...props} value={email} onChange={onChange} />}
</Field>`}
        >
          <FieldDemo />
        </Example>
        <p>
          While an error is set, the hint is hidden: two messages under one field compete with
          each other, and right now the error matters more.
        </p>
      </Section>

      <Section title="Why a function, not children" id="render-prop">
        <Callout tone="why" title="The wrapper has to hand the input a generated id">
          The label is tied to the input through <code>htmlFor</code>, and the hint and error
          through <code>aria-describedby</code>. All three need one and the same unique
          identifier.
          <br />
          <br />
          If the input arrived as ordinary children, the calling code would have to invent an{" "}
          <code>id</code> by hand and remember it everywhere. A function receives the
          attributes ready-made — and there is nothing left to forget.
        </Callout>
        <CodeBlock
          code={`// what the function receives
{
  id: ":r3:",
  "aria-describedby": ":r3:-error",   // when there is an error or a hint
  "aria-invalid": true,               // when there is an error
}`}
        />
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "label", type: "ReactNode", description: "The label above the field." },
            {
              name: "hint",
              type: "ReactNode",
              description: "The hint below the field. Hidden while an error is shown.",
            },
            {
              name: "error",
              type: "ReactNode",
              description: (
                <>
                  The error text. While it is set, the field is marked{" "}
                  <code>aria-invalid</code> and the message is announced as{" "}
                  <code>role=&quot;alert&quot;</code>.
                </>
              ),
            },
            { name: "required", type: "boolean", description: "An asterisk next to the label." },
            {
              name: "children",
              type: "(props) => ReactNode",
              required: true,
              description: "The field itself. Receives the id and the aria attributes.",
            },
          ]}
        />
      </Section>

      <Section title="The inputs on their own" id="inputs">
        <p>
          <code>Input</code>, <code>Textarea</code> and <code>Select</code> are thin wrappers
          over the native elements with shared styling and a focus ring. They work without{" "}
          <code>Field</code> too:
        </p>
        <CodeBlock
          code={`<Input placeholder="Search…" />
<Textarea rows={4} />
<Select defaultValue="MANAGER">
  <option value="ADMIN">Administrator</option>
  <option value="MANAGER">Manager</option>
</Select>`}
        />
        <p>
          All three forward <code>ref</code> and accept any native attributes. The invalid
          state is styled from <code>aria-invalid</code> rather than a separate prop — so the
          styling follows accessibility instead of living next to it.
        </p>
      </Section>
    </>
  );
}
