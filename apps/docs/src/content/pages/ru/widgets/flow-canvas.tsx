import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { FlowCanvasDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "zoom", title: "Зум к курсору" },
  { id: "logic", title: "Математика отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Канва pan/zoom с узлами и связями — мини-react-flow. Холст листается
        протяжкой, масштабируется колесом, узлы двигаются и липнут к сетке.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add flow-canvas" />
      </Section>

      <Section title="Пример" id="example">
        <Example plain code={`<FlowCanvas
  nodes={nodes}
  onNodesChange={setNodes}
  edges={edges}
  renderNode={(node) => <div>{node.label}</div>}
/>`}>
          <FlowCanvasDemo />
        </Example>
        <p>
          Тащите фон — холст листается. Колесо масштабирует. Узлы перетаскиваются
          и встают по сетке. Кнопка ⤢ вмещает всё в экран.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "nodes", type: "N[]", required: true, description: "Узлы: id, x, y, width?, height?." },
            { name: "renderNode", type: "(node, meta) => ReactNode", required: true, description: "Содержимое узла." },
            { name: "edges", type: "FlowEdge[]", default: "[]", description: "Связи с необязательными сторонами портов." },
            { name: "onNodesChange", type: "(nodes) => void", description: "Новые позиции после перетаскивания. Без него узлы не двигаются." },
            { name: "grid", type: "number", default: "20", description: "Шаг сетки для привязки и фона. 0 — без сетки." },
            { name: "onSelect", type: "(node | null) => void", description: "Выбор узла или сброс по клику на фон." },
          ]}
        />
      </Section>

      <Section title="Зум к курсору" id="zoom">
        <Callout tone="why" title="Точка под курсором остаётся на месте">
          Вся суть масштабирования: мировая точка под курсором до и после зума
          должна оказаться в той же точке экрана. Иначе колесо мыши таскает холст
          в сторону, и прицелиться в узел становится невозможно. Смещение камеры
          подстраивается так, чтобы точка не сдвинулась.
        </Callout>
      </Section>

      <Section title="Математика отдельно" id="logic">
        <CodeBlock
          code={`import {
  worldToScreen, screenToWorld,  // взаимно обратные преобразования
  zoomAt,                        // зум с сохранением точки под курсором
  fitView,                       // камера, вмещающая всё в экран
  snapToGrid, portPoint, edgePath,
} from "@/components/ui/flow-canvas/viewport";`}
        />
      </Section>
    </>
  );
}
