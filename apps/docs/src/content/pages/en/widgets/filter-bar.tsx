import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { FilterBarDemo } from "@/demos/widgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "fields", title: "Describing the fields" },
  { id: "query", title: "The query string" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        A filter bar assembled from a description of the fields. The bar does not know what to
        filter — the <code>fields</code> array does. So a new condition is added with one
        entry rather than edits across five files.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add filter-bar" />
      </Section>

      <Section title="Example" id="example">
        <Example
          plain
          code={`const [filter, setFilter] = useState(emptyFilter(taskFilterFields));
const matched = tasks.filter((t) => matchesFilter(taskFilterFields, filter, t));

<FilterBar
  fields={taskFilterFields}
  value={filter}
  onChange={setFilter}
  matchedCount={matched.length}
  totalCount={tasks.length}
  savedFilters={presets}
  onSaveFilter={(name, query) => saveFilterAction(projectId, name, query)}
  onDeleteFilter={deleteFilterAction}
/>`}
        >
          <FilterBarDemo />
        </Example>
      </Section>

      <Section title="Describing the fields" id="fields">
        <p>
          A field is a label, a control type and a «does this item match» function. The
          ready-made matchers cover almost everything:
        </p>
        <CodeBlock
          code={`import {
  textMatcher, equalsMatcher, includesMatcher, type FilterField,
} from "@/components/ui/filter-bar/filterModel";

export const taskFilterFields: FilterField<Task>[] = [
  {
    key: "q", label: "Search", kind: "text", placeholder: "title or number",
    matches: textMatcher((t) => [t.title, t.number]),
  },
  {
    key: "status", label: "Status", kind: "select", anyLabel: "Any",
    options: statusOptions,
    matches: equalsMatcher((t) => t.status),
  },
  {
    key: "assignee", label: "Assignee", kind: "select", anyLabel: "Any",
    options: members.map((m) => ({ value: m.id, label: m.name })),
    matches: includesMatcher((t) => t.assignees),
  },
];`}
        />
        <PropsTable
          rows={[
            {
              name: "textMatcher",
              type: "(pick: (item) => (string | number | null)[]) => Matcher",
              description:
                "A case-insensitive substring across several properties at once: «12» finds task №12, «pay» finds «Payment page».",
            },
            {
              name: "equalsMatcher",
              type: "(pick: (item) => string | null) => Matcher",
              description: "An exact match on one property.",
            },
            {
              name: "includesMatcher",
              type: "(pick: (item) => { id: string }[]) => Matcher",
              description: "The value is among the related entities: assignees, labels.",
            },
          ]}
        />
        <p>
          A matcher of your own is an ordinary <code>(item, value) =&gt; boolean</code>
          function: a date range, «overdue», «unassigned».
        </p>
      </Section>

      <Section title="The query string" id="query">
        <p>
          The state serialises to an ordinary query string. Saved presets and the address bar
          hold it in exactly that form:
        </p>
        <CodeBlock
          code={`serializeFilter(fields, filter);  // "status=TODO&assignee=u1"
parseFilter(fields, query);       // back into state`}
        />
        <p>
          So a link to a filtered list opens as precisely what it was, and a saved filter is
          just a string in the database.
        </p>
        <Callout tone="why" title="Unknown keys are ignored when parsing">
          Fields change over time: one is removed, another renamed. A preset saved six months
          ago should keep working — even without the vanished condition — rather than bringing
          the screen down.
        </Callout>
        <Callout tone="note" title="Compatible with the previous format">
          The format matches the one the pathlogs tracker uses (
          <code>status=TODO&amp;assignee=…</code>), so moving to the widget requires no
          migration of saved filters in the database.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "fields", type: "FilterField<T>[]", required: true, description: "The field descriptions." },
            { name: "value", type: "FilterState", required: true, description: "The current state." },
            { name: "onChange", type: "(next: FilterState) => void", required: true, description: "A change." },
            {
              name: "savedFilters",
              type: "{ id, name, query }[]",
              description: "Presets. Without handlers they can only be applied.",
            },
            {
              name: "onSaveFilter",
              type: "(name, query) => void | Promise",
              description: "Saving a preset. Without it there is no «save filter» button.",
            },
            { name: "onDeleteFilter", type: "(id: string) => void | Promise", description: "Deleting a preset." },
            {
              name: "matchedCount / totalCount",
              type: "number",
              description: "How many passed the filter and how many there are — the caption under the bar.",
            },
            {
              name: "compact",
              type: "boolean",
              default: "false",
              description: "A dense layout: the bar sits inside a header rather than standing on its own.",
            },
            { name: "labels", type: "FilterBarLabels", description: "Captions. English by default." },
          ]}
        />
      </Section>
    </>
  );
}
