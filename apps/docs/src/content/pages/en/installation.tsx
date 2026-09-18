import { Callout, CodeBlock, Example, Section } from "@/components/docs";
import { ButtonDemo } from "@/demos/basics";

export const toc = [
  { id: "packages", title: "Packages" },
  { id: "styles", title: "Styles" },
  { id: "theme", title: "Theme script" },
  { id: "check", title: "Checking it works" },
  { id: "without-tailwind", title: "Without Tailwind" },
];

export default function Page() {
  return (
    <>
      <Section title="Packages" id="packages">
        <CodeBlock
          lang="bash"
          code="npm install @toimetdev/pathlogs-core @toimetdev/pathlogs-hooks @toimetdev/pathlogs-tokens"
        />
        <p>
          <code>core</code> depends on the other two, so strictly speaking one package would
          be enough. Installing all three is still more convenient: that way{" "}
          <code>@toimetdev/pathlogs-hooks</code> and <code>@toimetdev/pathlogs-tokens</code>{" "}
          show up in your <code>package.json</code> as direct dependencies rather than as a
          detail of someone else's tree.
        </p>
        <p>
          React 18 or newer is a peer dependency. The packages pull in nothing else: no clsx,
          no radix, no date utilities.
        </p>
      </Section>

      <Section title="Styles" id="styles">
        <p>Three imports into your main CSS file — usually `globals.css`:</p>
        <CodeBlock
          lang="css"
          title="src/app/globals.css"
          code={`@import "tailwindcss";

@import "@toimetdev/pathlogs-tokens/styles/index.css";
@import "@toimetdev/pathlogs-core/styles/components.css";
@import "@toimetdev/pathlogs-tokens/styles/tailwind.css";`}
        />
        <p>What each line does:</p>
        <ul>
          <li>
            <code>tokens/styles/index.css</code> — variables, base styles, animations and the
            styles for drag-scrollable strips;
          </li>
          <li>
            <code>core/styles/components.css</code> — the look of the package's components;
          </li>
          <li>
            <code>tokens/styles/tailwind.css</code> — the bridge to Tailwind v4: turns tokens
            into the utilities <code>bg-surface</code>, <code>text-muted</code>,{" "}
            <code>border-edge</code>.
          </li>
        </ul>

        <Callout tone="warn" title="The order matters">
          The Tailwind bridge comes <strong>last</strong>. It declares an{" "}
          <code>@theme inline</code> block that refers to the variables — if the tokens are
          not there yet, the utilities are built with empty values and silently colour
          nothing.
        </Callout>
      </Section>

      <Section title="Theme script" id="theme">
        <p>
          The theme lives in <code>localStorage</code> and in a <code>data-theme</code>{" "}
          attribute on <code>&lt;html&gt;</code>. So the page never flashes the wrong theme
          before hydration, that attribute is set by a tiny synchronous script in{" "}
          <code>&lt;head&gt;</code>:
        </p>
        <CodeBlock
          title="src/app/layout.tsx"
          code={`import { themeScript } from "@toimetdev/pathlogs-tokens";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}`}
        />
        <Callout tone="why" title="Why a synchronous script and not an effect">
          An effect runs after the first paint — which means the user has already seen a frame
          in the wrong theme. This script blocks rendering on purpose: it costs a fraction of
          a millisecond and removes the flash entirely.{" "}
          <code>suppressHydrationWarning</code> is needed because the attribute on{" "}
          <code>&lt;html&gt;</code> appears before hydration and therefore does not match the
          server-rendered markup.
        </Callout>
      </Section>

      <Section title="Checking it works" id="check">
        <p>If everything is wired up, buttons look like this and follow the theme:</p>
        <Example
          code={`import { Button } from "@toimetdev/pathlogs-core";

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="gradient">Gradient</Button>`}
        >
          <ButtonDemo />
        </Example>
        <p>
          If nothing is styled, it is almost always the import order, or the CSS landing in
          the wrong file. The components do not rely on Tailwind, so missing styles simply
          mean <code>components.css</code> never arrived.
        </p>
      </Section>

      <Section title="Without Tailwind" id="without-tailwind">
        <p>
          The <code>core</code> components are marked up with their own <code>pl-*</code>{" "}
          classes and work in a project with any CSS framework, or none at all. In that case
          two imports are enough:
        </p>
        <CodeBlock
          lang="css"
          code={`@import "@toimetdev/pathlogs-tokens/styles/index.css";
@import "@toimetdev/pathlogs-core/styles/components.css";`}
        />
        <p>
          Registry widgets are a different matter: they are marked up with Tailwind. If your
          project has no Tailwind, say so when configuring the CLI (<code>--no-tailwind</code>
          ) and it will warn you that widgets will arrive unstyled.
        </p>
      </Section>
    </>
  );
}
