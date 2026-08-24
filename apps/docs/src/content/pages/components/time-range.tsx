import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { TimeRangeDemo } from "@/demos/dataviz";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "syntax", title: "Синтаксис" },
  { id: "props", title: "Пропсы" },
  { id: "logic", title: "Разбор отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Выбор интервала времени в синтаксисе <code>now-15m</code> — как в Grafana
        и Kibana. Готовые интервалы, ввод своих выражений и листание стрелками
        на длину интервала.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`const [range, setRange] = useState({ from: "now-24h", to: "now" });

<TimeRangePicker value={range} onChange={setRange} locale="ru-RU" />`}
        >
          <TimeRangeDemo />
        </Example>
      </Section>

      <Section title="Синтаксис" id="syntax">
        <p>Выражение — это <code>now</code> со сдвигом и округлением:</p>
        <CodeBlock
          lang="text"
          code={`now              сейчас
now-15m          пятнадцать минут назад
now-1h           час назад
now/d            начало сегодняшнего дня (слева) / конец (справа)
now-1d/d         весь вчерашний день
now/w            эта неделя (с понедельника)
2026-02-14       конкретная дата`}
        />
        <Callout tone="why" title="Запись остаётся относительной">
          <code>now-1h</code> хранится в URL как есть и через сутки покажет
          последний час, а не тот же час вчера. Пара timestamp-ов так не умеет —
          поэтому выражение, а не два числа. Перевести в абсолютные даты можно
          в любой момент функцией <code>toAbsolute</code>.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "value", type: "{ from, to }", required: true, description: "Интервал как пара выражений." },
            { name: "onChange", type: "(range) => void", required: true, description: "Новый интервал." },
            { name: "presets", type: "TimePreset[]", description: "Свой набор готовых интервалов вместо стандартного." },
            { name: "now", type: "Date", description: "Момент отсчёта выражений. По умолчанию — сейчас." },
            { name: "nudge", type: "boolean", default: "true", description: "Стрелки «раньше/позже» — листание на длину интервала." },
            { name: "custom", type: "boolean", default: "true", description: "Разрешить ввод своих выражений." },
            { name: "locale", type: "string", default: "ru-RU", description: "Локаль подписей." },
          ]}
        />
      </Section>

      <Section title="Разбор отдельно" id="logic">
        <CodeBlock
          code={`import {
  resolveRange,      // { from, to } выражений → пара Date
  parseTimeExpr,     // одно выражение → Date (null, если непонятно)
  shiftRange,        // листать на собственную длину
  toAbsolute,        // перевести в абсолютные даты
  TIME_PRESETS,      // стандартные интервалы
} from "@toimetdev/pathlogs-core";`}
        />
        <Callout tone="note" title="Непонятное выражение — это null">
          Разбор не подставляет молча «последний час» вместо непонятной записи:
          интервал, тихо подменённый на другой, — худший вид ошибки в отчёте,
          потому что цифры выглядят настоящими.
        </Callout>
      </Section>
    </>
  );
}
