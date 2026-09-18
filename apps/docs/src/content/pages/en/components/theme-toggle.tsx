import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { ThemeToggleDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        A switch between the light and dark themes. The same one that sits in this site's
        header.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { ThemeToggle } from "@toimetdev/pathlogs-core";

<ThemeToggle
  labels={{ toDark: "Dark theme", toLight: "Light theme", action: "Toggle theme" }}
/>`}
        >
          <ThemeToggleDemo />
        </Example>
        <p>
          The icons lie on top of one another and swap by rotating — the switch reads as a
          single movement rather than a picture being replaced.
        </p>
        <Callout tone="warn" title="The theme script in head is required">
          Without <code>themeScript()</code> from <code>@toimetdev/pathlogs-tokens</code> the
          page flashes the wrong theme on every load: the attribute appears only after
          hydration. Details are in <a href="/docs/theming">«Themes and tokens»</a>.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "storageKey",
              type: "string",
              default: '"theme"',
              description: (
                <>
                  The key in <code>localStorage</code>. Must match the key passed to{" "}
                  <code>themeScript()</code>.
                </>
              ),
            },
            {
              name: "labels",
              type: "{ toDark?, toLight?, action? }",
              description:
                "The hover tooltip in each state, and the button's accessible name.",
            },
            { name: "className", type: "string", description: "Extra classes." },
          ]}
        />
        <p>
          A switch of your own — with three states, or a dropdown — is built on the{" "}
          <code>useTheme</code> hook: it gives you both the user's choice and what is actually
          on screen.
        </p>
      </Section>
    </>
  );
}
