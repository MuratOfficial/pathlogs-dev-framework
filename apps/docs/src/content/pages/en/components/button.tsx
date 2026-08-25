import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { ButtonDemo, ButtonSizesDemo } from "@/demos/basics";

export const toc = [
  { id: "variants", title: "Variants" },
  { id: "sizes", title: "Sizes" },
  { id: "loading", title: "Loading" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        A button with style variants, sizes, an icon and a loading state. Everything else is
        ordinary <code>&lt;button&gt;</code> attributes.
      </p>

      <Section title="Variants" id="variants">
        <Example
          code={`import { Button } from "@toimetdev/pathlogs-core";

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>
<Button variant="gradient">Gradient</Button>`}
        >
          <ButtonDemo />
        </Example>
        <Callout tone="note" title="type=&quot;button&quot; by default">
          A button inside a form that unexpectedly submits it is the source of the most
          maddening bugs. A deliberate <code>type=&quot;submit&quot;</code> can always be
          spelled out.
        </Callout>
      </Section>

      <Section title="Sizes" id="sizes">
        <Example
          code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
        >
          <ButtonSizesDemo />
        </Example>
      </Section>

      <Section title="Loading" id="loading">
        <p>
          <code>loading</code> shows a spinner, disables the button and sets{" "}
          <code>aria-busy</code>. It is worth switching the caption to a continuous form while
          it runs — «Saving» rather than «Save»:
        </p>
        <Example
          code={`<Button variant="primary" loading={pending}>
  {pending ? "Saving" : "Save"}
</Button>`}
        >
          <ButtonDemo />
        </Example>
        <p>
          The spinner inherits the text colour, so it reads equally well on every variant — it
          needs no colour of its own.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "variant",
              type: '"primary" | "secondary" | "ghost" | "danger" | "gradient"',
              default: '"secondary"',
              description: "The styling.",
            },
            { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "The size." },
            {
              name: "loading",
              type: "boolean",
              default: "false",
              description: "A spinner in place of the icon; the button is disabled.",
            },
            { name: "icon", type: "ReactNode", description: "An icon to the left of the caption." },
            { name: "block", type: "boolean", default: "false", description: "Fill the container's full width." },
            {
              name: "…",
              type: "ButtonHTMLAttributes",
              description: "Everything else goes to <button>: onClick, disabled, form, aria-*.",
            },
          ]}
        />
        <p>
          The component forwards <code>ref</code> — you can focus it programmatically or feed
          it into your own positioning logic.
        </p>
      </Section>
    </>
  );
}
