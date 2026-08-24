import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { ActivityTimelineDemo } from "@/demos/dataviz";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "bursts", title: "Свёртка серий" },
  { id: "logic", title: "Группировка отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Хронология событий: сгруппирована по дням, а подряд идущие однотипные
        события свёрнуты в одну запись. Лента остаётся читаемой, а не тонет
        в семи одинаковых строках «сменил статус».
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`<ActivityTimeline
  events={feed}
  renderEvent={(e) => <span><b>{e.actor}</b> {e.text}</span>}
  renderBurst={(events) => <span><b>{events[0].actor}</b> обновил статусы</span>}
  renderIcon={(e) => <span>{ICONS[e.kind]}</span>}
/>`}
        >
          <ActivityTimelineDemo />
        </Example>
        <p>Разверните свёрнутую серию, чтобы увидеть отдельные события внутри.</p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "events", type: "E[]", required: true, description: "События. Нужны id, at (время) и kind (тип)." },
            { name: "renderEvent", type: "(event: E) => ReactNode", required: true, description: "Отрисовка одиночного события." },
            { name: "renderBurst", type: "(events: E[]) => ReactNode", description: "Заголовок свёрнутой серии." },
            { name: "renderIcon", type: "(event: E) => ReactNode", description: "Маркер слева на линии времени." },
            { name: "now", type: "Date", description: "Точка отсчёта относительного времени. По умолчанию — сейчас." },
            { name: "order", type: '"desc" | "asc"', default: '"desc"', description: "Новые сверху или снизу." },
            { name: "burstThreshold", type: "number", default: "3", description: "С какого числа однотипных подряд сворачивать." },
            { name: "expandable", type: "boolean", default: "true", description: "Раскрывать серию по клику." },
          ]}
        />
      </Section>

      <Section title="Свёртка серий" id="bursts">
        <Callout tone="why" title="Серия не пересекает границу дня">
          События сначала режутся по календарным дням, и только потом внутри
          каждого дня сворачиваются серии. Иначе «×7» могло бы означать «шесть
          вчера и одно сегодня» — и заголовок дня перестал бы что-либо значить.
        </Callout>
        <p>
          Разрыв внутри серии считается между соседними событиями, а не от её
          начала: десять правок по одной в двадцать минут — это одна работа,
          а не пять отдельных серий.
        </p>
      </Section>

      <Section title="Группировка отдельно" id="logic">
        <CodeBlock
          code={`import {
  groupActivity,   // события → дни со свёрнутыми сериями
  collapseBursts,  // свёртка подряд идущих однотипных
  relativeTime,    // «5 минут назад» с заданной локалью
  dayLabel,        // «Сегодня» / «Вчера» / дата
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
