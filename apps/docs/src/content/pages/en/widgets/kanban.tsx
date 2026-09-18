import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { KanbanDemo } from "@/demos/widgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "data", title: "The data" },
  { id: "props", title: "Props" },
  { id: "optimistic", title: "Optimistic state" },
  { id: "dnd", title: "Drag-and-drop subtleties" },
  { id: "order", title: "The ordering, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        A board with draggable cards and columns, WIP limits, hidden columns and optimistic
        state. It knows nothing about your domain: what to show on a card is decided by{" "}
        <code>renderCard</code>.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add kanban" />
        <p>
          Copies three files: <code>Kanban.tsx</code>, <code>ColumnEditor.tsx</code> and{" "}
          <code>kanbanOrder.ts</code>. From then on it is your code — edit it like any other
          file in the project.
        </p>
      </Section>

      <Section title="Example" id="example">
        <Example
          plain
          code={`<Kanban
  items={tasks}
  columns={columns}
  canManageColumns={isManager}
  renderCard={(task) => <TaskCard task={task} />}
  onOpenItem={(task) => router.push(\`/tasks/\${task.id}\`)}
  onMoveItem={(id, columnId, orderedIds) => moveTaskAction(id, columnId, orderedIds)}
  onReorderColumns={(ids) => reorderColumnsAction(projectId, ids)}
  onUpdateColumn={(id, fields) => updateColumnAction(id, fields)}
  onDeleteColumn={deleteColumnAction}
  labels={EN_LABELS}
/>`}
        >
          <KanbanDemo />
        </Example>
        <p>
          Try it: drag a card between columns and within a column, move a column by the handle
          on the left, open its settings, change the WIP limit. The «Done» column is sorted by
          date — the slot there appears where the card will actually land.
        </p>
      </Section>

      <Section title="The data" id="data">
        <p>The board needs a minimum of fields — everything else is yours:</p>
        <CodeBlock
          code={`interface KanbanItem {
  id: string;
  columnId: string | null;
  order: number;
  createdAt: string;     // ISO — compared lexicographically
  color?: string | null; // the card's personal colour
}

interface KanbanColumn {
  id: string;
  name: string;
  color: string;         // #rrggbb — tints the whole column
  order: number;
  wipLimit?: number | null;
  sort?: "MANUAL" | "CREATED_DESC" | "CREATED_ASC";
  hidden?: boolean;
}`}
        />
        <p>Your own type simply extends the base one:</p>
        <CodeBlock
          code={`interface Task extends KanbanItem {
  number: number;
  title: string;
  priority: 1 | 2 | 3 | 4;
  assignees: Member[];
}

<Kanban<Task, KanbanColumn> items={tasks} … />`}
        />
        <Callout tone="warn" title="columnId must be filled in">
          The board reads <code>item.columnId</code> directly and does not try to infer a
          column from a status. If you have a fallback rule («a card with no column is shown
          in the column matching its status»), apply it before handing data to the widget — on
          the server or in a <code>useMemo</code>.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "items", type: "I[]", required: true, description: "The cards." },
            { name: "columns", type: "C[]", required: true, description: "The columns." },
            {
              name: "renderCard",
              type: "(item, ctx) => ReactNode",
              required: true,
              description:
                "The card's contents. ctx carries { dragging, column } — to dim the card while it is being moved, for instance.",
            },
            {
              name: "onMoveItem",
              type: "(itemId, columnId, orderedIds) => void | Promise",
              required: true,
              description:
                "A card moved. orderedIds is the complete new order of the target column.",
            },
            {
              name: "onReorderColumns",
              type: "(orderedIds: string[]) => void | Promise",
              description: "Without it columns cannot be dragged — no handle is shown.",
            },
            {
              name: "onCreateColumn",
              type: "(name, color) => void | Promise",
              description: "Without it there is no «new column» button.",
            },
            {
              name: "onUpdateColumn",
              type: "(columnId, fields) => void | Promise",
              description: "Without it there is no column settings button.",
            },
            {
              name: "onSetColumnHidden",
              type: "(columnId, hidden) => void | Promise",
              description: "Hiding a column, plus the «hidden columns» bar at the bottom.",
            },
            { name: "onDeleteColumn", type: "(columnId) => void | Promise", description: "Deleting a column." },
            { name: "onOpenItem", type: "(item: I) => void", description: "A click on a card." },
            {
              name: "filter",
              type: "(item: I) => boolean",
              description:
                "A card filter. Columns stay in place — you can see both the board's structure and how much is left in it.",
            },
            {
              name: "canManageColumns",
              type: "boolean",
              default: "false",
              description: "Permission to change the set of columns: creating and deleting.",
            },
            { name: "palette", type: "readonly string[]", description: "The palette of column colours." },
            {
              name: "toolbar",
              type: "ReactNode",
              description: "The bar above the board: a filter, an update indicator.",
            },
            { name: "labels", type: "KanbanLabels", description: "Captions. English by default." },
          ]}
        />
        <Callout tone="note" title="Features are switched on by the presence of a callback">
          Do not pass <code>onDeleteColumn</code> and there is no delete button. That way
          permissions are expressed one way rather than two (<code>canDelete</code> plus a
          handler), and there is nothing for them to disagree about.
        </Callout>
      </Section>

      <Section title="Optimistic state" id="optimistic">
        <p>
          The board applies a move immediately and holds its own state until the server
          answers. Fresh <code>items</code> replace it — but only once every action that
          started has finished.
        </p>
        <Callout tone="why" title="Why not «always trust the props»">
          The user drags card A, and half a second later card B. Revalidation after the first
          move brings back data in which the second move does not exist yet. Apply it straight
          away and card B jumps back, then returns a moment later: the board «judders» when
          you work quickly. So synchronisation waits until no action is still in flight.
        </Callout>
        <Callout tone="warn" title="Do not keep a copy of your own">
          If the application also holds local board state, it will drift apart from the
          internal one. Pass the server's data into <code>items</code> as it is.
        </Callout>
        <p>
          <code>onMoveItem</code> receives the <strong>complete</strong> order of the column,
          not a single position: the server must write the whole order, otherwise two
          simultaneous moves diverge.
        </p>
      </Section>

      <Section title="Drag-and-drop subtleties" id="dnd">
        <p>Several decisions here, each an answer to a specific breakage:</p>
        <ul>
          <li>
            <strong>
              The source hides on the first <code>drag</code>, not on <code>dragstart</code>.
            </strong>{" "}
            <code>dragstart</code> is a discrete event, so React would apply{" "}
            <code>setState</code> synchronously, the card would vanish at the very moment of
            the start, and the browser would cancel the drag.
          </li>
          <li>
            <strong>The hidden card stays in the tree</strong> (the <code>hidden</code>{" "}
            attribute rather than removal). Otherwise its <code>onDragEnd</code> would not
            fire when the drag is cancelled with Escape — and the board would be left without
            that card.
          </li>
          <li>
            <strong>The slot matches the card's height</strong>, so neighbours do not «jump»
            at the moment of pick-up.
          </li>
          <li>
            <strong>The strip auto-scrolls near the edge</strong> during a drag: the pointer
            belongs to the browser, and without auto-scroll there would be no way to reach a
            column off-screen.
          </li>
          <li>
            <strong>The column's borders are four separate properties.</strong> React updates
            the shorthand <code>borderColor</code> and <code>borderTopColor</code>{" "}
            independently, and the top stripe «sticks» from the previous state.
          </li>
        </ul>
      </Section>

      <Section title="The ordering, separately" id="order">
        <p>
          All the ordering rules live in <code>kanbanOrder.ts</code> — no React, no DOM, with
          tests:
        </p>
        <CodeBlock
          code={`import {
  columnItems,     // a column's cards in display order
  dropSlotIndex,   // where a card will land under each sort mode
  insertAt,        // the new order of ids after an insertion
  reorderColumns,  // the new order of columns
  isOverWipLimit,
  applyOrder,
} from "@/components/ui/kanban/kanbanOrder";`}
        />
        <p>
          The least obvious of these is <code>dropSlotIndex</code>. Under manual ordering the
          slot appears under the cursor; under date sorting, where the card will actually end
          up (otherwise it would jump after release); and with an active filter, at the end —
          because «the place under the cursor» says nothing about the real order when not all
          cards are visible.
        </p>
      </Section>
    </>
  );
}
