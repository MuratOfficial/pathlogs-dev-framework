import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DashboardGridDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "packing", title: "Расталкивание и сжатие" },
  { id: "logic", title: "Упаковка отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Плиточная сетка с перетаскиванием и ресайзом — мини-grid-layout. Плитки
        живут в целочисленной сетке колонок; двигаешь одну — она расталкивает
        соседей, освободилось место — всё оседает вверх.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add dashboard-grid" />
      </Section>

      <Section title="Пример" id="example">
        <Example plain code={`<DashboardGrid
  items={items}
  onItemsChange={setItems}
  columns={12}
  rowHeight={72}
>
  {(item) => <Tile id={item.id} />}
</DashboardGrid>`}>
          <DashboardGridDemo />
        </Example>
        <p>Тащите плитки и тяните за нижний правый угол — соседи расступаются, сетка оседает.</p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "items", type: "GridItem[]", required: true, description: "Плитки: id, x, y, w, h, static?." },
            { name: "onItemsChange", type: "(items) => void", required: true, description: "Новая раскладка после жеста." },
            { name: "renderItem", type: "(item) => ReactNode", required: true, description: "Содержимое плитки по её id." },
            { name: "columns", type: "number", default: "12", description: "Число колонок." },
            { name: "rowHeight", type: "number", default: "80", description: "Высота строки (px)." },
            { name: "gap", type: "number", default: "12", description: "Зазор между плитками (px)." },
            { name: "resizable", type: "boolean", default: "true", description: "Разрешить ресайз за нижний правый угол." },
          ]}
        />
      </Section>

      <Section title="Расталкивание и сжатие" id="packing">
        <Callout tone="why" title="Плитку расталкивают, а не отменяют ход">
          Пользователь тащит плитку туда, куда хочет её поставить. Остановить его
          на полпути — значит проигнорировать жест. Поэтому цель уступается
          перетаскиваемой, а занимавшие клетки съезжают вниз каскадом. После
          жеста сетка осаживается вверх, убирая пустоты. Логика того же класса,
          что у <a href="/docs/widgets/kanban">канбан-доски</a>.
        </Callout>
      </Section>

      <Section title="Упаковка отдельно" id="logic">
        <CodeBlock
          code={`import {
  moveItem,      // переместить с расталкиванием и сжатием
  resizeItem,    // изменить размер
  compact,       // осадить всё вверх
  findFreeSpot,  // первое свободное место под новую плитку
} from "@/components/ui/dashboard-grid/gridLayout";`}
        />
      </Section>
    </>
  );
}
