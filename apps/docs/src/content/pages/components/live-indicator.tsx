import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { LiveIndicatorDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "a11y", title: "Не только цвет" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Состояние живого соединения точкой и подписью. Обычно стоит рядом
        с заголовком экрана, который обновляется сам.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { useEventStream } from "@toimetdev/pathlogs-hooks";
import { LiveIndicator } from "@toimetdev/pathlogs-core";

const { status, updatedAt } = useEventStream(\`/api/projects/\${id}/stream\`, {
  events: ["change"],
  onEvent: () => router.refresh(),
});

<LiveIndicator
  status={status}
  updatedAt={updatedAt}
  locale="ru-RU"
  labels={{
    updated: "обновлено в {time}",
    connecting: "подключаемся…",
    offline: "нет связи — обновления приостановлены",
  }}
/>`}
        >
          <LiveIndicatorDemo />
        </Example>
      </Section>

      <Section title="Не только цвет" id="a11y">
        <Callout tone="why" title="Рядом с точкой всегда есть текст">
          Зелёная и красная точки различаются только оттенком — а при самом
          распространённом типе дальтонизма это ровно та пара, которую не различить.
          Подпись рядом делает индикатор читаемым для всех, а заодно сообщает
          то, чего цвет сказать не может: когда именно данные обновились.
        </Callout>
        <p>
          Поэтому <code>offline</code> подписывается не просто «нет связи»,
          а «обновления приостановлены»: пользователю важно понимать последствие,
          а не диагноз.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "status",
              type: '"connecting" | "live" | "offline"',
              required: true,
              description: "Состояние соединения. Приходит из useEventStream.",
            },
            {
              name: "updatedAt",
              type: "Date | null",
              description: "Когда в последний раз применили изменение.",
            },
            {
              name: "locale",
              type: "string",
              description: "Локаль для времени. По умолчанию — локаль браузера.",
            },
            {
              name: "labels",
              type: "{ live?, connecting?, offline?, updated?, tipLive?, tipOffline? }",
              description: (
                <>
                  Подписи. В <code>updated</code> подставляется <code>{"{time}"}</code>.
                </>
              ),
            },
          ]}
        />
        <CodeBlock
          code={`labels={{ updated: "обновлено в {time}" }}
// → «обновлено в 14:32»`}
        />
      </Section>
    </>
  );
}
