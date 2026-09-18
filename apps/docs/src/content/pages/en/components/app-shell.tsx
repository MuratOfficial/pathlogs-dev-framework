import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "responsive", title: "Responsiveness" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        An application shell: a static sidebar on a wide screen, and a sliding drawer with a
        header and a hamburger on a narrow one.
      </p>

      <Section title="Example" id="example">
        <CodeBlock
          title="src/app/(app)/layout.tsx"
          code={`import { AppShell } from "@toimetdev/pathlogs-core";

export default function AppLayout({ children }) {
  return (
    <AppShell
      brand={
        <span className="flex items-center gap-2">
          <Logo />
          <span className="text-sm font-bold">PathLogs</span>
        </span>
      }
      menuLabel="Open menu"
      sidebar={<Navigation />}
    >
      {children}
    </AppShell>
  );
}`}
        />
        <p>
          The sidebar's contents arrive as a prop, whole — the shell does not dictate what
          navigation looks like.
        </p>
      </Section>

      <Section title="Responsiveness" id="responsive">
        <p>The breakpoint is 1024px. Below it a header and a hamburger appear.</p>
        <Callout tone="why" title="The breakpoint lives in CSS, not in JS">
          A media query applies before the first paint. Checking the window width in an effect
          would give you a frame with a collapsed sidebar on desktop — a visible flash on
          every page load.
        </Callout>
        <p>Two more small things people usually forget:</p>
        <ul>
          <li>
            clicking any link inside the sidebar closes the drawer — on mobile, navigating
            always means the menu is no longer wanted;
          </li>
          <li>while the drawer is open, page scrolling beneath it is locked.</li>
        </ul>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "sidebar", type: "ReactNode", required: true, description: "The side menu's contents." },
            { name: "children", type: "ReactNode", required: true, description: "The page contents." },
            {
              name: "brand",
              type: "ReactNode",
              description:
                "What to show in the mobile header next to the hamburger: a logo, a name.",
            },
            {
              name: "menuLabel",
              type: "string",
              default: '"Open menu"',
              description: "The accessible name of the hamburger button.",
            },
          ]}
        />
        <p>
          The sidebar is 15rem wide. If you need a different width, override{" "}
          <code>.pl-shell__sidebar</code> and the inset on <code>.pl-shell__main</code>: both
          values sit next to each other in <code>components.css</code>.
        </p>
      </Section>
    </>
  );
}
