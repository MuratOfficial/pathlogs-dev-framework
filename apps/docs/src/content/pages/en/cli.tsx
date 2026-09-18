import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "why", title: "Why by copying" },
  { id: "init", title: "init" },
  { id: "add", title: "add" },
  { id: "list", title: "list" },
  { id: "config", title: "pathlogs.json" },
  { id: "update", title: "Updating" },
  { id: "own", title: "Your own widget" },
];

export default function Page() {
  return (
    <>
      <p>
        Heavyweight widgets are not installed as a package — they are copied into your
        project's code with a single command, and from then on they live as ordinary files
        of yours.
      </p>

      <Section title="Why by copying" id="why">
        <p>
          A board or a chart almost always needs edits for a particular domain: a different
          card body, different permissions, a different set of actions. A component you cannot
          open and edit grows props instead — <code>renderCardHeader</code>,{" "}
          <code>hideAssignees</code>, <code>cardClassName</code> — and six months later its
          API is larger than the component itself.
        </p>
        <Callout tone="why" title="Where the line runs">
          The packages hold what has a stable API and rarely needs edits: tokens, hooks,
          dialogs. The registry holds what every project rewrites for itself. If you find
          yourself wanting to «tweak it just a little» more than once a quarter, it belongs
          in the registry.
        </Callout>
      </Section>

      <Section title="init" id="init">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui init" />
        <p>
          The command creates the config and the widget directory, and appends the style
          imports:
        </p>
        <CodeBlock
          lang="bash"
          code={`Setting up PathLogs UI

  widget directory  src/components/ui
  import alias      @/components/ui
  stylesheet        src/app/globals.css
  Tailwind          yes

  + pathlogs.json
  + src/components/ui/
  ~ src/app/globals.css (style imports added)`}
        />
        <p>
          The imports are inserted <strong>after</strong>{" "}
          <code>@import &quot;tailwindcss&quot;</code> if it is present: order matters in CSS.
          Running it again duplicates nothing. If there is no stylesheet, the command does not
          invent a structure it knows nothing about — it simply prints what to paste.
        </p>
      </Section>

      <Section title="add" id="add">
        <CodeBlock
          lang="bash"
          code={`npx @toimetdev/pathlogs-ui add kanban
npx @toimetdev/pathlogs-ui add gantt filter-bar
npx @toimetdev/pathlogs-ui add kanban --dry-run`}
        />
        <p>
          Files are copied into the directory from your config, and the imports between them
          are rewritten to use your alias:
        </p>
        <CodeBlock
          code={`// in the registry
import { columnItems } from "./kanbanOrder";

// in your project
import { columnItems } from "@/components/ui/kanban/kanbanOrder";`}
        />
        <Callout tone="note" title="Existing files are never overwritten">
          Widgets are copied into your project precisely so that you edit them. Silently
          clobbering someone's edit is the worst thing a command like this could do, so it
          skips files that already exist and says so. To overwrite deliberately:{" "}
          <code>--force</code>.
        </Callout>
        <p>
          At the end the command prints which packages the widget needs — that list is baked
          into its metadata rather than guessed.
        </p>
      </Section>

      <Section title="list" id="list">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui list" />
        <p>Shows everything the registry contains, with a description of each widget.</p>
      </Section>

      <Section title="pathlogs.json" id="config">
        <CodeBlock
          lang="json"
          title="pathlogs.json"
          code={`{
  "componentsDir": "src/components/ui",
  "alias": "@/components/ui",
  "css": "src/app/globals.css",
  "tailwind": true
}`}
        />
        <PropsTable
          rows={[
            {
              name: "componentsDir",
              type: "string",
              default: '"src/components/ui"',
              description: "Where to put widgets, relative to the project root.",
            },
            {
              name: "alias",
              type: "string",
              default: '"@/components/ui"',
              description:
                "The alias widgets use to import one another. An empty string keeps relative paths.",
            },
            {
              name: "css",
              type: "string",
              default: '"src/app/globals.css"',
              description: "The file init appends the style imports to.",
            },
            {
              name: "tailwind",
              type: "boolean",
              default: "true",
              description:
                "Whether the project uses Tailwind. If not, add warns that widgets will arrive unstyled.",
            },
          ]}
        />
        <p>
          The values can be set during setup:{" "}
          <code>init --dir src/ui --alias @/ui --no-tailwind</code>.
        </p>
      </Section>

      <Section title="Updating" id="update">
        <p>
          There is no in-place update for widgets, and that is deliberate: the file in your
          project may already differ from the original, and automatically merging someone
          else's edits is a source of quiet breakage.
        </p>
        <p>If you do want to pull in a newer version:</p>
        <CodeBlock
          lang="bash"
          code={`# see what would change
npx @toimetdev/pathlogs-ui add kanban --dry-run

# overwrite and sort the conflicts out in git
npx @toimetdev/pathlogs-ui add kanban --force
git diff`}
        />
        <p>
          This is why widgets are worth committing right after copying — then{" "}
          <code>git diff</code> shows exactly your edits on top of the original.
        </p>
      </Section>

      <Section title="Your own widget" id="own">
        <p>The registry is just a directory of files plus a description. To add your own:</p>
        <CodeBlock
          lang="json"
          title="registry/widgets/my-widget/meta.json"
          code={`{
  "name": "my-widget",
  "title": "My widget",
  "description": "What it does and why it is useful",
  "type": "widget",
  "dependencies": ["@xyflow/react"],
  "registryDependencies": ["filter-bar"],
  "packageDependencies": ["@toimetdev/pathlogs-core"],
  "tailwind": true,
  "files": [
    { "path": "MyWidget.tsx", "target": "my-widget/MyWidget.tsx" }
  ]
}`}
        />
        <ul>
          <li>
            <code>dependencies</code> — third-party npm packages;
          </li>
          <li>
            <code>registryDependencies</code> — other registry widgets, installed first;
          </li>
          <li>
            <code>packageDependencies</code> — packages of the framework itself.
          </li>
        </ul>
        <p>
          The CLI expands dependencies in installation order and prints a single{" "}
          <code>npm install</code> command for everything that is missing.
        </p>
      </Section>
    </>
  );
}
