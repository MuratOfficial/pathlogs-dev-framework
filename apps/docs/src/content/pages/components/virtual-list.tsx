import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { VirtualListDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "sizes", title: "Переменная высота" },
  { id: "hook", title: "Хук useVirtual" },
];

export default function Page() {
  return (
    <>
      <p>
        Оконный рендер длинного списка: в DOM живёт только видимая часть.
        На десяти тысячах строк обычный <code>map</code> кладёт вкладку —
        столько узлов браузер не тянет.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`<VirtualList items={rows} itemKey={(r) => r.id} height={280}>
  {(row) => <div className="row">{row.title}</div>}
</VirtualList>`}
        >
          <VirtualListDemo />
        </Example>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "items", type: "T[]", required: true, description: "Данные списка." },
            { name: "children", type: "(item, index) => ReactNode", required: true, description: "Отрисовка одного элемента." },
            { name: "itemKey", type: "(item, index) => string | number", description: "Ключ элемента. По умолчанию — индекс." },
            { name: "estimateSize", type: "number | (index) => number", default: "40", description: "Ожидаемая высота — первое приближение до измерения." },
            { name: "stickToBottom", type: "boolean", default: "false", description: "Прилипать к концу при новых элементах — для логов и чатов." },
            { name: "overscan", type: "number", default: "4", description: "Запас строк за краями окна." },
            { name: "height", type: "number | string", default: "360", description: "Высота области прокрутки." },
          ]}
        />
      </Section>

      <Section title="Переменная высота" id="sizes">
        <Callout tone="why" title="Высоты не обязаны совпадать">
          <code>estimateSize</code> — только первое приближение. Дальше каждый
          отрисованный элемент сообщает свою настоящую высоту, и список из строк
          разной длины не «дёргается» после первого прохода.
        </Callout>
      </Section>

      <Section title="Хук useVirtual" id="hook">
        <p>Компонент — тонкая обёртка над хуком. Для своей разметки берите хук напрямую:</p>
        <CodeBlock
          code={`import { useVirtual } from "@toimetdev/pathlogs-hooks";

const v = useVirtual({ count: rows.length, estimateSize: 36, stickToBottom: true });
// v.items, v.totalSize, v.scrollRef, v.measure, v.scrollToIndex, v.atBottom`}
        />
      </Section>
    </>
  );
}
