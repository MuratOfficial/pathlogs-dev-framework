import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { SparklineDemo, SparklineTableDemo } from "@/demos/dataviz";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "table", title: "В строке таблицы" },
  { id: "props", title: "Пропсы" },
  { id: "logic", title: "Геометрия отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Инлайновый спарклайн: тренд одной строкой — в таблицу, в бейдж, в статус-бар.
        Один <code>&lt;path&gt;</code> в SVG и, по желанию, точки экстремумов. Без chart-библиотеки.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`<Sparkline values={commits} width={130} height={30} fill dots />
<Sparkline values={latency} extremes color="var(--warning)" />
<Sparkline values={burndown} smooth fill color="var(--success)" />`}
        >
          <SparklineDemo />
        </Example>
      </Section>

      <Section title="В строке таблицы" id="table">
        <p>
          Главное место спарклайна — не отдельный график, а ячейка рядом с числом:
          колонка «как менялось» без разворачивания в полноценную диаграмму.
        </p>
        <Example
          code={`<td>{row.name}</td>
<td className="text-right">{row.series.at(-1)}</td>
<td><Sparkline values={row.series} width={90} height={22} /></td>`}
        >
          <SparklineTableDemo />
        </Example>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "values", type: "number[]", required: true, description: "Ряд значений слева направо." },
            { name: "width / height", type: "number", default: "120 / 32", description: "Размеры в пикселях." },
            { name: "color", type: "string", default: "var(--accent)", description: "Цвет линии." },
            { name: "fill", type: "boolean", default: "false", description: "Залить область под линией градиентом цвета линии." },
            { name: "smooth", type: "boolean", default: "false", description: "Сгладить кривыми вместо ломаной." },
            { name: "dots", type: "boolean", default: "false", description: "Пометить первую и последнюю точку." },
            { name: "extremes", type: "boolean", default: "false", description: "Пометить минимум и максимум ряда." },
            { name: "zeroBased", type: "boolean", default: "false", description: "Включить ноль в шкалу — тогда высоты сопоставимы между графиками." },
            { name: "maxPoints", type: "number", description: "Проредить длинный ряд до этого числа точек, сохраняя выбросы." },
            { name: "label", type: "string", description: "Доступная подпись. По умолчанию — «Тренд +N%»." },
          ]}
        />
        <Callout tone="why" title="Прореживание сохраняет выбросы">
          При <code>maxPoints</code> ряд сжимается по корзинам, и в каждой остаётся
          минимум и максимум, а не среднее. Спарклайн рисуют ради всплесков —
          усреднение было бы единственным способом их гарантированно потерять.
        </Callout>
      </Section>

      <Section title="Геометрия отдельно" id="logic">
        <p>Расчёт линии — чистый и переиспользуемый без React:</p>
        <CodeBlock
          code={`import {
  sparklineGeometry, // точки, path линии и заливки
  extentOf,          // границы шкалы (плоский ряд не делит на ноль)
  decimate,          // прореживание с сохранением экстремумов
  trend,             // доля изменения первое → последнее
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
