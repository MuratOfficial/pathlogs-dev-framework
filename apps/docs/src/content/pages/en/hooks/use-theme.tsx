import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { ThemeDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Example" },
  { id: "api", title: "What it returns" },
  { id: "fouc", title: "The flash on load" },
  { id: "dom", title: "Without React" },
];

export default function Page() {
  return (
    <>
      <p>
        The current theme as external DOM state. The hook does not store the theme itself — it
        reads the <code>data-theme</code> attribute on <code>&lt;html&gt;</code>, so a theme
        change from anywhere in the app reaches everyone at once.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { useTheme } from "@toimetdev/pathlogs-hooks";

function Toggle() {
  const { preference, resolved, setTheme, toggle } = useTheme();

  return (
    <button onClick={toggle}>
      {resolved === "dark" ? "Light" : "Dark"}
    </button>
  );
}`}
        >
          <ThemeDemo />
        </Example>
        <p>
          A ready-made switch already exists — <code>ThemeToggle</code> from{" "}
          <code>@toimetdev/pathlogs-core</code>. The hook is for when the switch is your own,
          or the theme feeds into logic: the colour of a chart, say.
        </p>
      </Section>

      <Section title="What it returns" id="api">
        <PropsTable
          rows={[
            {
              name: "preference",
              type: '"light" | "dark" | "system"',
              description: "What the user chose.",
            },
            {
              name: "resolved",
              type: '"light" | "dark"',
              description: "«system» already resolved into what is actually on screen.",
            },
            {
              name: "setTheme",
              type: "(theme: ThemePreference) => void",
              description: "Applies the theme and remembers the choice.",
            },
            {
              name: "toggle",
              type: "() => void",
              description:
                "Switches between light and dark. «system» resolves to the opposite of the current one.",
            },
          ]}
        />
        <p>
          The only argument is the <code>localStorage</code> key (<code>&quot;theme&quot;</code>{" "}
          by default). It must match the key passed to <code>themeScript()</code>.
        </p>
      </Section>

      <Section title="The flash on load" id="fouc">
        <p>
          The theme has to be applied <em>before</em> the first paint, or the page flashes.
          That is what the tiny synchronous script in <code>&lt;head&gt;</code> is for:
        </p>
        <CodeBlock
          code={`import { themeScript } from "@toimetdev/pathlogs-tokens";

<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
  </head>
</html>`}
        />
        <Callout tone="why" title="Why useSyncExternalStore and not useState plus an effect">
          The attribute is already in place by the time hydration runs. A component holding
          the theme in state would render its first frame with the default theme and earn a
          mismatch warning. <code>useSyncExternalStore</code> honestly tells the server «the
          default theme» and hands the client the real one straight away.
        </Callout>
        <p>
          The subscription watches both the attribute and the system setting; the latter only
          matters while <code>system</code> is selected.
        </p>
      </Section>

      <Section title="Without React" id="dom">
        <p>
          The same operations are available as plain functions — called by the inline script
          and by the tests alike:
        </p>
        <CodeBlock
          code={`import {
  getThemePreference,
  getResolvedTheme,
  setThemePreference,
  toggleTheme,
  subscribeTheme,
  themeScript,
} from "@toimetdev/pathlogs-tokens";`}
        />
        <p>
          Writing to <code>localStorage</code> can fail (private mode, cookies disabled) — and
          that does not break the switch: the theme is applied regardless, it just will not
          survive a reload.
        </p>
      </Section>
    </>
  );
}
