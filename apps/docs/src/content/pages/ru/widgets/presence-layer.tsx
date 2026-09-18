import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { PresenceLayerDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "smoothing", title: "Сглаживание и устаревание" },
  { id: "logic", title: "Состояние отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Курсоры соучастников поверх поверхности — как в Figma и мультиплеере.
        Питается тем же потоком событий, что и{" "}
        <a href="/ru/docs/hooks/use-event-stream">useEventStream</a>.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add presence-layer" />
      </Section>

      <Section title="Пример" id="example">
        <Example plain code={`<div className="relative">
  <Board />
  <PresenceLayer events={presenceEvents} selfId={me.id} />
</div>`}>
          <PresenceLayerDemo />
        </Example>
        <p>Три курсора ходят по кругу — поток «доигрывается» по кадрам, чтобы показать сглаживание.</p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "events", type: "PresenceEvent[]", required: true, description: "Поток событий присутствия: actorId, name, cursor, selection, at." },
            { name: "selfId", type: "string", description: "Свой актор — его курсор не рисуется." },
            { name: "ttlMs", type: "number", default: "15000", description: "Через сколько молчания убирать курсор." },
            { name: "smoothing", type: "number", default: "0.2", description: "Плавность догона (0..1): меньше — плавнее и медленнее." },
            { name: "children", type: "ReactNode", description: "Поверхность под слоем." },
          ]}
        />
      </Section>

      <Section title="Сглаживание и устаревание" id="smoothing">
        <Callout tone="why" title="События приходят рывками">
          По сети присутствие приходит неровно: то три события за кадр, то тишина
          секунду. Показывать их как есть — значит получить дёргающиеся курсоры.
          Нарисованный курсор догоняет присланную позицию экспоненциальным
          сглаживанием, привязанным к времени кадра, — поэтому едет плавно
          при любой частоте событий.
        </Callout>
        <Callout tone="why" title="Ушедших убирает TTL, а не событие «ушёл»">
          Вкладку закрывают, связь рвётся — и прощального события просто не
          приходит. Без истечения по TTL такие «призраки» копились бы на экране
          навсегда. Цвет участника выводится хешем из его id — один и тот же
          человек узнаётся по цвету и после переподключения.
        </Callout>
      </Section>

      <Section title="Состояние отдельно" id="logic">
        <CodeBlock
          code={`import {
  applyPresence,   // внести событие (устаревшие игнорируются)
  interpolate,     // подвинуть курсоры к целям на один кадр
  pruneStale,      // убрать давно молчавших
  colorFor,        // устойчивый цвет по id
} from "@/components/ui/presence-layer/presence";`}
        />
      </Section>
    </>
  );
}
