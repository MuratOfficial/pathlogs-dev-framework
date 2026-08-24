import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DependencyGraphDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "layout", title: "Слоистая раскладка" },
  { id: "cycles", title: "Циклы" },
  { id: "logic", title: "Раскладка отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Граф зависимостей: слоистая раскладка ориентированного графа. Сосед{" "}
        <a href="/docs/widgets/gantt">диаграммы Ганта</a> — из тех же связей
        «A блокирует B» там считается критический путь, здесь строится картинка.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add dep-graph" />
      </Section>

      <Section title="Пример" id="example">
        <Example plain code={`<DependencyGraph
  nodes={tasks}
  edges={links}
  renderNode={(task) => <span>#{task.number} {task.title}</span>}
/>`}>
          <DependencyGraphDemo />
        </Example>
        <p>Кликните по узлу — подсветятся его прямые соседи, остальное приглушится.</p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "nodes", type: "N[]", required: true, description: "Вершины. Нужен только id." },
            { name: "edges", type: "{ from, to }[]", required: true, description: "Связи «from → to»." },
            { name: "renderNode", type: "(node, meta) => ReactNode", required: true, description: "Содержимое блока узла." },
            { name: "direction", type: '"LR" | "TB"', default: '"LR"', description: "Слева направо или сверху вниз." },
            { name: "onSelect", type: "(node) => void", description: "Клик по узлу." },
            { name: "highlightNeighbours", type: "boolean", default: "true", description: "Подсвечивать соседей выбранного узла." },
          ]}
        />
      </Section>

      <Section title="Слоистая раскладка" id="layout">
        <p>
          Это упрощённый алгоритм Сугиямы: разрыв циклов, разбивка по слоям
          методом длиннейшего пути, снижение пересечений медианной эвристикой
          и только потом координаты. Связи, перескакивающие через слой,
          разбиваются служебными вершинами-изгибами и огибают чужие блоки.
        </p>
        <Callout tone="why" title="Порядок слоёв не станет хуже исходного">
          Точное решение задачи о минимуме пересечений NP-полно, поэтому здесь
          эвристика. Но лучший результат из проходов выбирается по настоящему
          числу пересечений, а не по вере в неё, — поэтому раскладка никогда
          не выходит хуже, чем была.
        </Callout>
      </Section>

      <Section title="Циклы" id="cycles">
        <Callout tone="why" title="Цикл не ломает картинку">
          Слои существуют только в графе без циклов, но отказаться от раскладки
          нельзя — цикл в зависимостях задач встречается сплошь и рядом, и его
          нужно увидеть, а не получить пустой экран. Обратные связи снимаются,
          рисуются пунктиром и перечисляются под графом.
        </Callout>
      </Section>

      <Section title="Раскладка отдельно" id="logic">
        <CodeBlock
          code={`import {
  layoutDag,       // полная раскладка: узлы, рёбра, размеры
  breakCycles,     // снять обратные связи
  assignLayers,    // разбивка по слоям
  countCrossings,  // число пересечений (метрика качества)
} from "@/components/ui/dep-graph/dagLayout";`}
        />
      </Section>
    </>
  );
}
