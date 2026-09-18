import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { FilterBarDemo } from "@/demos/widgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "fields", title: "Описание полей" },
  { id: "query", title: "Строка запроса" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Панель фильтров, собираемая из описания полей. Что фильтровать, панель
        не знает — знает массив <code>fields</code>. Поэтому новое условие
        добавляется одной записью, а не правкой пяти файлов.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add filter-bar" />
      </Section>

      <Section title="Пример" id="example">
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

      <Section title="Описание полей" id="fields">
        <p>
          Поле — это подпись, тип контрола и функция «подходит ли элемент». Готовые
          матчеры покрывают почти всё:
        </p>
        <CodeBlock
          code={`import {
  textMatcher, equalsMatcher, includesMatcher, type FilterField,
} from "@/components/ui/filter-bar/filterModel";

export const taskFilterFields: FilterField<Task>[] = [
  {
    key: "q", label: "Поиск", kind: "text", placeholder: "название или номер",
    matches: textMatcher((t) => [t.title, t.number]),
  },
  {
    key: "status", label: "Статус", kind: "select", anyLabel: "Любой",
    options: statusOptions,
    matches: equalsMatcher((t) => t.status),
  },
  {
    key: "assignee", label: "Исполнитель", kind: "select", anyLabel: "Любой",
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
                "Подстрока без учёта регистра сразу по нескольким свойствам: «12» находит задачу №12, «оплат» — «Страница оплаты».",
            },
            {
              name: "equalsMatcher",
              type: "(pick: (item) => string | null) => Matcher",
              description: "Точное совпадение одного свойства.",
            },
            {
              name: "includesMatcher",
              type: "(pick: (item) => { id: string }[]) => Matcher",
              description: "Значение есть среди связанных сущностей: исполнители, метки.",
            },
          ]}
        />
        <p>
          Свой матчер — обычная функция <code>(item, value) =&gt; boolean</code>:
          диапазон дат, «просрочено», «без исполнителя».
        </p>
      </Section>

      <Section title="Строка запроса" id="query">
        <p>
          Состояние сериализуется в обычный query string. В этом же виде оно лежит
          в сохранённых пресетах и в адресной строке:
        </p>
        <CodeBlock
          code={`serializeFilter(fields, filter);  // "status=TODO&assignee=u1"
parseFilter(fields, query);       // обратно в состояние`}
        />
        <p>
          Поэтому ссылка на отфильтрованный список открывается ровно тем же,
          чем была, а сохранённый фильтр — это просто строка в базе.
        </p>
        <Callout tone="why" title="Неизвестные ключи при разборе игнорируются">
          Поля со временем меняются: одно убрали, другое переименовали. Сохранённый
          полгода назад пресет должен продолжать работать — пусть и без исчезнувшего
          условия, — а не ронять экран.
        </Callout>
        <Callout tone="note" title="Совместимость с прежним форматом">
          Формат совпадает с тем, что использует трекер pathlogs
          (<code>status=TODO&amp;assignee=…</code>), поэтому при переходе
          на виджет мигрировать сохранённые фильтры в базе не нужно.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "fields", type: "FilterField<T>[]", required: true, description: "Описание полей." },
            { name: "value", type: "FilterState", required: true, description: "Текущее состояние." },
            { name: "onChange", type: "(next: FilterState) => void", required: true, description: "Изменение." },
            {
              name: "savedFilters",
              type: "{ id, name, query }[]",
              description: "Пресеты. Без обработчиков они только применяются.",
            },
            {
              name: "onSaveFilter",
              type: "(name, query) => void | Promise",
              description: "Сохранение пресета. Без него нет кнопки «сохранить фильтр».",
            },
            { name: "onDeleteFilter", type: "(id: string) => void | Promise", description: "Удаление пресета." },
            {
              name: "matchedCount / totalCount",
              type: "number",
              description: "Сколько прошло отбор и сколько всего — подпись под панелью.",
            },
            {
              name: "compact",
              type: "boolean",
              default: "false",
              description: "Плотная раскладка: панель встраивается в шапку, а не стоит отдельно.",
            },
            { name: "labels", type: "FilterBarLabels", description: "Подписи. По умолчанию английские." },
          ]}
        />
      </Section>
    </>
  );
}
