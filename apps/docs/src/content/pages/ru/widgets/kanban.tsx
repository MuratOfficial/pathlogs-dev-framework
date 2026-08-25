import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { KanbanDemo } from "@/demos/widgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "data", title: "Данные" },
  { id: "props", title: "Пропсы" },
  { id: "optimistic", title: "Оптимистичное состояние" },
  { id: "dnd", title: "Тонкости перетаскивания" },
  { id: "order", title: "Порядок отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Доска с перетаскиванием карточек и колонок, WIP-лимитами, скрытыми колонками
        и оптимистичным состоянием. О домене не знает ничего: что показывать
        на карточке, решает <code>renderCard</code>.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add kanban" />
        <p>
          Копирует три файла: <code>Kanban.tsx</code>, <code>ColumnEditor.tsx</code>{" "}
          и <code>kanbanOrder.ts</code>. Дальше это ваш код — правьте как обычные
          файлы проекта.
        </p>
      </Section>

      <Section title="Пример" id="example">
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
  labels={RU_LABELS}
/>`}
        >
          <KanbanDemo />
        </Example>
        <p>
          Попробуйте: перетащите карточку между колонками и внутри колонки,
          переставьте колонку за ручку слева, откройте её настройки, поменяйте
          WIP-лимит. Колонка «Готово» отсортирована по дате — слот там встаёт
          туда, где карточка окажется на самом деле.
        </p>
      </Section>

      <Section title="Данные" id="data">
        <p>Доске нужен минимум полей — всё остальное ваше:</p>
        <CodeBlock
          code={`interface KanbanItem {
  id: string;
  columnId: string | null;
  order: number;
  createdAt: string;     // ISO — сравнивается лексикографически
  color?: string | null; // персональный цвет карточки
}

interface KanbanColumn {
  id: string;
  name: string;
  color: string;         // #rrggbb — им подкрашивается вся колонка
  order: number;
  wipLimit?: number | null;
  sort?: "MANUAL" | "CREATED_DESC" | "CREATED_ASC";
  hidden?: boolean;
}`}
        />
        <p>Ваш тип просто расширяет базовый:</p>
        <CodeBlock
          code={`interface Task extends KanbanItem {
  number: number;
  title: string;
  priority: 1 | 2 | 3 | 4;
  assignees: Member[];
}

<Kanban<Task, KanbanColumn> items={tasks} … />`}
        />
        <Callout tone="warn" title="columnId должен быть проставлен">
          Доска читает <code>item.columnId</code> напрямую и не пытается вывести
          колонку из статуса. Если у вас есть запасное правило («карточка без
          колонки показывается в колонке своего статуса»), примените его до передачи
          в виджет — на сервере или в <code>useMemo</code>.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "items", type: "I[]", required: true, description: "Карточки." },
            { name: "columns", type: "C[]", required: true, description: "Колонки." },
            {
              name: "renderCard",
              type: "(item, ctx) => ReactNode",
              required: true,
              description:
                "Содержимое карточки. В ctx приходит { dragging, column } — например, чтобы приглушить карточку во время переноса.",
            },
            {
              name: "onMoveItem",
              type: "(itemId, columnId, orderedIds) => void | Promise",
              required: true,
              description: "Карточка переехала. orderedIds — полный новый порядок целевой колонки.",
            },
            {
              name: "onReorderColumns",
              type: "(orderedIds: string[]) => void | Promise",
              description: "Без него колонки не перетаскиваются — ручка не показывается.",
            },
            {
              name: "onCreateColumn",
              type: "(name, color) => void | Promise",
              description: "Без него нет кнопки «новая колонка».",
            },
            {
              name: "onUpdateColumn",
              type: "(columnId, fields) => void | Promise",
              description: "Без него нет кнопки настроек колонки.",
            },
            {
              name: "onSetColumnHidden",
              type: "(columnId, hidden) => void | Promise",
              description: "Скрытие колонки и полоса «скрытые колонки» внизу.",
            },
            { name: "onDeleteColumn", type: "(columnId) => void | Promise", description: "Удаление колонки." },
            { name: "onOpenItem", type: "(item: I) => void", description: "Клик по карточке." },
            {
              name: "filter",
              type: "(item: I) => boolean",
              description:
                "Фильтр карточек. Колонки остаются на месте — видно и структуру доски, и сколько в ней осталось.",
            },
            {
              name: "canManageColumns",
              type: "boolean",
              default: "false",
              description: "Право менять состав колонок: создание и удаление.",
            },
            { name: "palette", type: "readonly string[]", description: "Палитра цветов колонок." },
            { name: "toolbar", type: "ReactNode", description: "Полоса над доской: фильтр, индикатор обновлений." },
            { name: "labels", type: "KanbanLabels", description: "Подписи. По умолчанию английские." },
          ]}
        />
        <Callout tone="note" title="Возможности включаются наличием колбэка">
          Не передали <code>onDeleteColumn</code> — кнопки удаления нет. Так права
          выражаются одним способом, а не двумя (<code>canDelete</code> плюс
          обработчик), и рассогласоваться им негде.
        </Callout>
      </Section>

      <Section title="Оптимистичное состояние" id="optimistic">
        <p>
          Доска применяет перенос сразу и держит своё состояние до ответа сервера.
          Свежие <code>items</code> заменяют его — но только когда все начатые
          действия завершились.
        </p>
        <Callout tone="why" title="Почему не «всегда доверять props»">
          Пользователь перетащил карточку А, через полсекунды — карточку Б.
          Ревалидация после первого переноса приносит данные, в которых второго
          переноса ещё нет. Примени их сразу — карточка Б прыгнет назад,
          а через мгновение вернётся: доска «дёргается» при быстрой работе.
          Поэтому синхронизация ждёт, пока не останется незавершённых действий.
        </Callout>
        <Callout tone="warn" title="Не держите свою копию">
          Если приложение тоже будет хранить локальное состояние доски, оно
          разойдётся с внутренним. Передавайте в <code>items</code> данные
          с сервера как есть.
        </Callout>
        <p>
          <code>onMoveItem</code> получает <strong>полный</strong> порядок колонки,
          а не одну позицию: сервер должен записать порядок целиком, иначе два
          одновременных переноса разъедутся.
        </p>
      </Section>

      <Section title="Тонкости перетаскивания" id="dnd">
        <p>
          Здесь несколько решений, каждое из которых — ответ на конкретную поломку:
        </p>
        <ul>
          <li>
            <strong>Источник прячется не в <code>dragstart</code>, а на первом{" "}
            <code>drag</code>.</strong> <code>dragstart</code> — дискретное событие,
            React применил бы <code>setState</code> синхронно, карточка исчезла бы
            прямо в момент старта, и браузер отменил бы перенос.
          </li>
          <li>
            <strong>Скрытая карточка остаётся в дереве</strong> (атрибут{" "}
            <code>hidden</code>, а не удаление). Иначе её <code>onDragEnd</code>{" "}
            не сработал бы при отмене переноса Escape — и доска осталась бы
            без этой карточки.
          </li>
          <li>
            <strong>Слот повторяет высоту карточки</strong>, поэтому соседи
            не «прыгают» в момент захвата.
          </li>
          <li>
            <strong>Лента подкручивается у края</strong> во время переноса: указатель
            принадлежит браузеру, и без автопрокрутки колонку за пределами экрана
            было бы нечем достать.
          </li>
          <li>
            <strong>Границы колонки — четыре отдельных свойства.</strong> React
            обновляет сокращённое <code>borderColor</code> и{" "}
            <code>borderTopColor</code> независимо, и верхняя полоса «залипает»
            от прошлого состояния.
          </li>
        </ul>
      </Section>

      <Section title="Порядок отдельно" id="order">
        <p>
          Все правила порядка живут в <code>kanbanOrder.ts</code> — без React
          и без DOM, с тестами:
        </p>
        <CodeBlock
          code={`import {
  columnItems,     // карточки колонки в порядке показа
  dropSlotIndex,   // куда встанет карточка при разных режимах сортировки
  insertAt,        // новый порядок id после вставки
  reorderColumns,  // новый порядок колонок
  isOverWipLimit,
  applyOrder,
} from "@/components/ui/kanban/kanbanOrder";`}
        />
        <p>
          Самое неочевидное здесь — <code>dropSlotIndex</code>. При ручном порядке
          слот встаёт под курсор; при сортировке по дате — туда, где карточка
          окажется на самом деле (иначе она прыгнула бы после отпускания);
          при активном фильтре — в конец, потому что «место под курсором» ничего
          не говорит о настоящем порядке, когда видно не все карточки.
        </p>
      </Section>
    </>
  );
}
