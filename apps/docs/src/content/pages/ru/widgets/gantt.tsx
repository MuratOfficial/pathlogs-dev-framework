import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { GanttDemo } from "@/demos/widgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "critical", title: "Критический путь" },
  { id: "drag", title: "Перетаскивание" },
  { id: "layout", title: "Раскладка отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Диаграмма Ганта: элементы с датами как полосы, которые можно двигать
        и растягивать за края. Зависимости рисуются стрелками, критический путь
        подсвечивается.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add gantt" />
      </Section>

      <Section title="Пример" id="example">
        <Example
          plain
          code={`<Gantt
  items={tasks}
  edges={links.filter((l) => l.type === "BLOCKS")}
  locale="ru-RU"
  renderLabel={(task) => (
    <>
      <span className="font-mono text-[11px] text-muted">UI-{task.number}</span>
      <span className="truncate">{task.title}</span>
    </>
  )}
  barColor={(task) => STATUS_COLORS[task.status]}
  onChangeDates={(id, dates) => updateTaskAction(id, dates)}
  onOpenItem={(task) => router.push(\`/tasks/\${task.id}\`)}
/>`}
        >
          <GanttDemo />
        </Example>
        <p>
          Потяните полосу целиком или за её край. Полотно листается протяжкой
          по обеим осям, стрелки прокручивают, Home и End прыгают к краям.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "items",
              type: "I[]",
              required: true,
              description: (
                <>
                  Элементы. Нужны <code>id</code>, <code>startDate</code> и{" "}
                  <code>dueDate</code> — строки вида <code>2026-02-14</code>.
                </>
              ),
            },
            {
              name: "renderLabel",
              type: "(item: I) => ReactNode",
              required: true,
              description: "Подпись строки в левой колонке.",
            },
            {
              name: "edges",
              type: "{ fromId, toId }[]",
              default: "[]",
              description: "Связи «from блокирует to»: стрелки и критический путь.",
            },
            {
              name: "onChangeDates",
              type: "(itemId, { startDate, dueDate }) => void | Promise",
              description: "Новые даты после перетаскивания. Без него диаграмма только для чтения.",
            },
            { name: "onOpenItem", type: "(item: I) => void", description: "Клик по полосе." },
            {
              name: "barColor",
              type: "(item: I) => string",
              description: "Цвет полосы — обычно по статусу. Перебивается полем item.color.",
            },
            {
              name: "locale",
              type: "string",
              description: "Локаль подписей шкалы. По умолчанию — локаль браузера.",
            },
            { name: "labels", type: "GanttLabels", description: "Подписи. По умолчанию английские." },
          ]}
        />
        <Callout tone="note" title="Одной даты достаточно">
          Элемент с одним только сроком рисуется однодневной полосой. Иначе половина
          плана — то, чему проставили дедлайн, но не начало, — просто не была бы видна.
          Срок раньше начала не даёт полосу «наизнанку»: она схлопывается в день.
        </Callout>
      </Section>

      <Section title="Критический путь" id="critical">
        <p>
          Самая длинная по суммарной длительности цепочка зависимостей.
          Подсвечивается янтарным — и сами полосы, и стрелки между ними.
        </p>
        <Callout tone="why" title="На цикле пути нет">
          Путь считается по топологическому порядку. Если разложить вершины
          не удалось, в графе цикл — и критического пути тогда просто не существует.
          Показать в этом случае какую-то цепочку значило бы соврать: планировать
          по ней нельзя.
        </Callout>
        <p>
          Одиночный элемент путём тоже не считается: «критический путь из одной
          задачи» ничего не сообщает о плане.
        </p>
      </Section>

      <Section title="Перетаскивание" id="drag">
        <ul>
          <li>
            <strong>Полоса целиком</strong> едет обоими концами, сохраняя длительность.
          </li>
          <li>
            <strong>Края</strong> двигают только свой конец и упираются
            в противоположный — вывернуть полосу и получить срок раньше начала
            нельзя.
          </li>
          <li>
            <strong>Сдвиг округляется до дня.</strong> Полоса встаёт на целый день,
            а не между днями.
          </li>
          <li>
            <strong>Нулевой сдвиг ничего не сохраняет</strong> — это был клик,
            а не перетаскивание.
          </li>
        </ul>
        <Callout tone="note" title="Даты собираются из локальных частей">
          <code>toISOString()</code> переводит в UTC и в отрицательных часовых
          поясах сдвигает дату на сутки назад. Поэтому строка собирается
          из <code>getFullYear</code>, <code>getMonth</code>, <code>getDate</code> —
          и «14 февраля» остаётся четырнадцатым в любом поясе.
        </Callout>
      </Section>

      <Section title="Раскладка отдельно" id="layout">
        <CodeBlock
          code={`import {
  datedRows,      // что вообще попадает на диаграмму, в порядке начала
  buildScale,     // шкала дат: ширина дня подбирается по длине плана
  layoutBars,     // положение каждой полосы
  criticalPath,   // самая длинная цепочка зависимостей
  applyDrag,      // даты после перетаскивания
  toISODate,
} from "@/components/ui/gantt/ganttLayout";`}
        />
        <p>
          Ширина дня подбирается автоматически: 32 px при плане до полутора месяцев,
          20 px до трёх и 12 px дальше. На годовом горизонте 32 px на день дали бы
          полотно, по которому невозможно листать.
        </p>
      </Section>
    </>
  );
}
