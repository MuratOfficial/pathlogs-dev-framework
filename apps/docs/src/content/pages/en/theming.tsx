import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { ThemeDemo } from "@/demos/hooks";

export const toc = [
  { id: "tokens", title: "Tokens" },
  { id: "themes", title: "Light and dark" },
  { id: "custom", title: "Your own palette" },
  { id: "tailwind", title: "Tailwind utilities" },
  { id: "color", title: "Working with colour" },
  { id: "layers", title: "Layers" },
];

const TOKENS = [
  ["--background", "Page background"],
  ["--surface", "Cards, panels, dialogs"],
  ["--surface-2", "Inputs, nested surfaces"],
  ["--border", "Borders (the utility is called border-edge)"],
  ["--foreground", "Primary text"],
  ["--muted", "Secondary text"],
  ["--accent", "Accent: buttons, links, focus"],
  ["--accent-hover", "Accent on hover"],
  ["--accent-2, --accent-3, --accent-pink", "Extra accents for gradients"],
  ["--accent-foreground", "Text on an accent fill"],
  ["--danger, --success, --warning, --info", "State semantics"],
];

export default function Page() {
  return (
    <>
      <p>
        The entire theme is a flat set of CSS variables. Components only ever read{" "}
        <code>var()</code> and contain no colours of their own, so you can recolour them
        without touching a single line inside the package.
      </p>

      <Section title="Tokens" id="tokens">
        <div className="not-prose my-5 overflow-hidden rounded-xl border border-edge">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {TOKENS.map(([name, description]) => (
                <tr key={name} className="border-b border-edge/60 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <code className="font-mono text-[12px] text-accent-hover">{name}</code>
                  </td>
                  <td className="px-4 py-2.5 text-foreground/85">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Besides colours there are radii (<code>--radius-sm</code> …{" "}
          <code>--radius-2xl</code>), shadows (<code>--shadow</code> …{" "}
          <code>--shadow-2xl</code>), timings (<code>--duration</code>,{" "}
          <code>--ease-out-expo</code>) and a scale of layers.
        </p>
      </Section>

      <Section title="Light and dark" id="themes">
        <p>
          Dark is the default value on <code>:root</code>. Light is switched on by an
          attribute on <code>&lt;html&gt;</code>:
        </p>
        <CodeBlock lang="html" code={`<html data-theme="light">`} />
        <p>
          The value <code>system</code> hands the decision to the{" "}
          <code>prefers-color-scheme</code> media query. All of this is what{" "}
          <code>useTheme</code> does:
        </p>
        <Example
          code={`import { useTheme } from "@toimetdev/pathlogs-hooks";

const { preference, resolved, setTheme, toggle } = useTheme();

// preference — what the user chose:   light | dark | system
// resolved   — what is on the screen: light | dark`}
        >
          <ThemeDemo />
        </Example>
        <Callout tone="why" title="Why the attribute is the source of truth, not React state">
          The theme is applied by an inline script before hydration even begins. If components
          kept it in <code>useState</code>, the first frame would render with the default
          theme and React would complain about a markup mismatch. Reading the attribute
          through <code>useSyncExternalStore</code> removes both problems at once.
        </Callout>
      </Section>

      <Section title="Your own palette" id="custom">
        <p>
          Redefine the variables after importing the tokens — the cascade does the rest. No
          component needs to know about it:
        </p>
        <CodeBlock
          lang="css"
          code={`@import "@toimetdev/pathlogs-tokens/styles/index.css";

:root {
  --accent: #0ea5e9;
  --accent-hover: #38bdf8;
  --accent-2: #06b6d4;
  --radius: 0.25rem;
}

[data-theme="light"] {
  --accent-hover: #0284c7;
}`}
        />
        <Callout tone="warn" title="Never define a token only inside a media query">
          A value declared solely under <code>prefers-color-scheme</code> disappears the
          moment the user picks a theme by hand. Declare the base value on{" "}
          <code>:root</code>, and put only the differences in the theme.
        </Callout>
      </Section>

      <Section title="Tailwind utilities" id="tailwind">
        <p>
          The bridge in <code>tokens/styles/tailwind.css</code> declares{" "}
          <code>@theme inline</code>, so the utilities point at the variables rather than at
          values — a theme change cascades into them with no rebuild:
        </p>
        <CodeBlock
          code={`<div className="rounded-xl border border-edge bg-surface p-4 text-foreground">
  <p className="text-muted">Secondary text</p>
  <button className="bg-accent text-accent-foreground hover:bg-accent-hover">
    Button
  </button>
</div>`}
        />
        <p>
          The border utility is called <code>border-edge</code> rather than{" "}
          <code>border-border</code>: the latter would read like a stutter.
        </p>
      </Section>

      <Section title="Working with colour" id="color">
        <p>
          Label and column colours are chosen by the user, so the package knows how to compute
          readability and transparency:
        </p>
        <CodeBlock
          code={`import { alpha, readableTextOn, luminance, backdropCss } from "@toimetdev/pathlogs-tokens";

alpha("#6366f1", 0.3);       // "#6366f14d" — eight-digit hex, safe inside gradients
readableTextOn("#ffff00");   // "#000000" — white on yellow is unreadable
luminance("#1b2233");        // relative luminance per WCAG 2.1

backdropCss({ color: "#6366f1", colorTo: "#ec4899", angle: 45 });`}
        />
        <PropsTable
          rows={[
            {
              name: "alpha",
              type: "(hex: string, opacity: number) => string",
              description:
                "Transparency as eight-digit hex rather than rgba(): such a string can be concatenated into gradients and dropped into CSS variables without being parsed.",
            },
            {
              name: "readableTextOn",
              type: '(hex: string) => "#000000" | "#ffffff"',
              description:
                "Black or white — whichever contrasts better on that background. Computed from luminance, not from «looks dark to me».",
            },
            {
              name: "backdropCss",
              type: "(bg: SurfaceBackdrop) => string",
              description:
                "A translucent backdrop: a single blob or a gradient. One function serves both the backdrop itself and its preview in settings, so the two cannot drift apart.",
            },
            {
              name: "BOARD_PALETTE",
              type: "readonly string[]",
              description: "A muted palette for cards, columns and labels.",
            },
            {
              name: "SURFACE_PALETTE",
              type: "readonly string[]",
              description:
                "A vivid palette for backdrops: the background is translucent, and muted shades disappear against it.",
            },
          ]}
        />
      </Section>

      <Section title="Layers" id="layers">
        <p>
          A shared <code>z-index</code> scale matters more than it looks: without one, a
          portal from one component covers a portal from another in arbitrary order.
        </p>
        <CodeBlock
          lang="css"
          code={`--z-sticky: 20;    /* sticky panels */
--z-header: 30;    /* header, drawer scrim */
--z-drawer: 40;    /* sliding sidebar */
--z-dropdown: 50;  /* dropdown panels, mention menus */
--z-modal: 60;     /* dialogs and the command palette */
--z-toast: 80;
--z-tooltip: 90;   /* tooltips — above everything */`}
        />
      </Section>
    </>
  );
}
