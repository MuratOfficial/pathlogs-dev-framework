import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { HeatmapDemo } from "@/demos/dataviz";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "levels", title: "Уровни по квантилям" },
  { id: "logic", title: "Сетка отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Календарная теплокарта года — сетка недель, как график вкладов на GitHub.
        Значение каждого дня превращается в уровень цвета; над сеткой — месяцы,
        слева — дни недели.
      </p>

      <Section title="Пример" id="example">
        <Example
          plain
          code={`<HeatmapCalendar
  values={{ "2026-02-14": 3, "2026-02-15": 7 }}
  color="var(--accent)"
  legend
  summary
/>`}
        >
          <HeatmapDemo />
        </Example>
        <p>
          <code>values</code> — карта «день → число». Отсутствующий день считается
          нулём: перечислять все 365 дней не нужно.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "values", type: "Record<string, number>", required: true, description: "Значения по дням в формате YYYY-MM-DD." },
            { name: "from / to", type: "Date", description: "Границы интервала. По умолчанию — последние 365 дней до сегодня." },
            { name: "color", type: "string", default: "var(--accent)", description: "Базовый цвет: уровни — это он с растущей непрозрачностью." },
            { name: "levels", type: "number", default: "4", description: "Сколько уровней цвета, не считая пустого." },
            { name: "cellSize", type: "number", default: "12", description: "Сторона клетки в пикселях." },
            { name: "weekStart", type: "number", default: "1", description: "С какого дня начинается неделя: 1 — понедельник." },
            { name: "legend", type: "boolean", default: "false", description: "Легенда «меньше → больше» под сеткой." },
            { name: "summary", type: "boolean", default: "false", description: "Сводка: всего, активных дней, лучшая серия." },
            { name: "onSelectDay", type: "(cell) => void", description: "Клик по клетке." },
          ]}
        />
      </Section>

      <Section title="Уровни по квантилям" id="levels">
        <Callout tone="why" title="Один выброс не должен сплющивать карту">
          Пороги уровней считаются по квантилям ненулевых значений, а не равными
          долями от нуля до максимума. Иначе один день с сотней событий на фоне
          единиц перекрасил бы всю карту в самый бледный уровень. Квантили дают
          картину распределения, а не одного пика.
        </Callout>
        <p>
          День с любым ненулевым значением получает как минимум первый уровень:
          день, в котором что-то было, не выглядит пустым.
        </p>
      </Section>

      <Section title="Сетка отдельно" id="logic">
        <CodeBlock
          code={`import {
  buildHeatmap,        // недели, месяцы, пороги, сводка
  quantileThresholds,  // пороги уровней по квантилям
  activityStreaks,     // текущая и самая длинная серия
  trailingRange,       // «последние N дней, включая сегодня»
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
