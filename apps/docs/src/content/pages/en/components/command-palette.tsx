import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "try", title: "Try it" },
  { id: "items", title: "Local entries" },
  { id: "search", title: "Server-side search" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        A ⌘K command palette: jumping to sections, searching your data and launching actions,
        all from one input.
      </p>

      <Section title="Try it" id="try">
        <Callout tone="note" title="It is already running on this site">
          Press <kbd className="pl-kbd">⌘</kbd>
          <kbd className="pl-kbd">K</kbd> (or <kbd className="pl-kbd">Ctrl</kbd>
          <kbd className="pl-kbd">K</kbd>) — the documentation search opens. That is this very
          component, not a copy of it: the site's pages are handed to it as <code>items</code>.
        </Callout>
        <p>
          Arrows move through the list, Enter opens, Escape closes. Hovering with the mouse
          moves the same cursor the keyboard does — they never fight over the selection.
        </p>
      </Section>

      <Section title="Local entries" id="items">
        <p>
          Application sections and commands need no request — they are filtered in place by
          title and hidden keywords:
        </p>
        <CodeBlock
          code={`import { CommandPalette } from "@toimetdev/pathlogs-core";

<CommandPalette
  items={[
    { id: "dashboard", group: "Navigation", title: "Projects", hint: "g d",
      onSelect: () => router.push("/dashboard") },
    { id: "new", group: "Actions", title: "New task",
      keywords: "create add issue",
      onSelect: () => setNewTaskOpen(true) },
  ]}
  labels={{ placeholder: "Search projects, tasks, sections…", empty: "Nothing found" }}
/>`}
        />
        <p>
          The default shortcut is <code>mod+k</code>. The palette registers it itself; pass{" "}
          <code>hotkey={"{null}"}</code> if you drive opening from outside.
        </p>
      </Section>

      <Section title="Server-side search" id="search">
        <p>
          Everything that is not on the client comes from the <code>search</code> function. It
          is called with a delay after typing — while the user is still typing, the
          intermediate substrings are of no use to anyone:
        </p>
        <CodeBlock
          code={`<CommandPalette
  items={navItems}
  search={async (query) => {
    const { projects, tasks } = await searchAction(query);
    return [
      ...projects.map((p) => ({
        id: \`p:\${p.id}\`, group: "Projects", title: p.name, badge: p.key,
        onSelect: () => router.push(\`/projects/\${p.id}\`),
      })),
      ...tasks.map((t) => ({
        id: \`t:\${t.id}\`, group: "Tasks", title: t.title,
        badge: \`\${t.projectKey}-\${t.number}\`,
        onSelect: () => router.push(\`/tasks/\${t.id}\`),
      })),
    ];
  }}
/>`}
        />
        <Callout tone="why" title="Why the data source lives outside">
          The palette has no business knowing about your database. This way one component
          serves a static command menu, a full-text search and suggestions from an external
          service alike — and a failed request simply leaves the local entries in place
          instead of bringing the window down.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "items",
              type: "CommandItem[]",
              default: "[]",
              description: "Entries available without a request. Filtered by title and keywords.",
            },
            {
              name: "search",
              type: "(query: string) => Promise<CommandItem[]>",
              description: "The source of results from the server.",
            },
            { name: "debounce", type: "number", default: "150", description: "Delay before the request, ms." },
            {
              name: "hotkey",
              type: "string | null",
              default: '"mod+k"',
              description: "The opening shortcut. null means external control only.",
            },
            {
              name: "open / onOpenChange",
              type: "boolean / (open: boolean) => void",
              description: "External control. Without them the palette keeps its own state.",
            },
            {
              name: "labels",
              type: "{ placeholder, empty, navigate, select }",
              description: "Captions. English by default.",
            },
          ]}
        />
        <p>A list entry:</p>
        <CodeBlock
          code={`interface CommandItem {
  id: string;
  title: string;
  group?: string;     // section heading; entries group in order of appearance
  badge?: string;     // a short label on the left: project key, task number
  hint?: string;      // a hint on the right: the entry's own shortcut
  icon?: ReactNode;
  keywords?: string;  // extra text for searching, never displayed
  onSelect: () => void;
}`}
        />
      </Section>
    </>
  );
}
