import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { EventStreamDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "options", title: "Параметры" },
  { id: "hidden", title: "Скрытая вкладка" },
  { id: "server", title: "Сторона сервера" },
];

export default function Page() {
  return (
    <>
      <p>
        Подписка на серверный поток событий (SSE). Типичное применение — «живой»
        экран: сервер сообщает «что-то изменилось», а страница сама подтягивает
        свежие данные без перезагрузки и без потери прокрутки.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { useEventStream } from "@toimetdev/pathlogs-hooks";
import { LiveIndicator } from "@toimetdev/pathlogs-core";

const { status, updatedAt } = useEventStream(\`/api/projects/\${id}/stream\`, {
  events: ["change"],
  onEvent: () => router.refresh(),
});

<LiveIndicator status={status} updatedAt={updatedAt} locale="ru-RU" />`}
        >
          <EventStreamDemo />
        </Example>
        <p>
          Переподключение — не наша забота: <code>EventSource</code> делает это сам.
          Наше дело — честно показать, что связи сейчас нет.
        </p>
      </Section>

      <Section title="Параметры" id="options">
        <PropsTable
          rows={[
            {
              name: "url",
              type: "string | null",
              required: true,
              description: "Адрес потока. null отключает подписку — удобно, пока id ещё не известен.",
            },
            {
              name: "onEvent",
              type: "(event: MessageEvent) => void",
              description: "Что делать при событии. Читается в момент события, стабильная ссылка не нужна.",
            },
            {
              name: "events",
              type: "string[]",
              default: '["message"]',
              description: "Имена событий SSE, на которые реагировать.",
            },
            {
              name: "deferWhenHidden",
              type: "boolean",
              default: "true",
              description: "Откладывать обработку, пока вкладка скрыта, и выполнить один раз при возврате.",
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Выключить подписку, не снимая хук.",
            },
            {
              name: "withCredentials",
              type: "boolean",
              default: "false",
              description: "Передавать куки — нужно для авторизованных потоков на другом домене.",
            },
          ]}
        />
        <p>
          Возвращает <code>{"{ status, updatedAt }"}</code>, где статус —{" "}
          <code>connecting</code>, <code>live</code> или <code>offline</code>.
        </p>
      </Section>

      <Section title="Скрытая вкладка" id="hidden">
        <Callout tone="why" title="Почему обновление откладывается">
          Обновлять невидимый экран незачем: это лишние запросы к серверу и лишняя
          работа браузера в фоновой вкладке. Но и потерять изменение нельзя — вернувшись,
          пользователь должен увидеть свежее состояние сразу. Поэтому событие,
          пришедшее в скрытую вкладку, запоминается и применяется при возврате.
        </Callout>
        <p>
          Хранится только последнее событие: экран всё равно перечитывает состояние
          целиком, и накапливать очередь незачем.
        </p>
      </Section>

      <Section title="Сторона сервера" id="server">
        <p>
          Хук ничего не предполагает о сервере, кроме формата SSE. Минимальный
          обработчик в Next.js:
        </p>
        <CodeBlock
          title="app/api/projects/[id]/stream/route.ts"
          code={`export async function GET(req: Request, { params }) {
  const encoder = new TextEncoder();
  let version = await projectVersion(params.id);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: string) =>
        controller.enqueue(encoder.encode(\`event: \${event}\\ndata: \${data}\\n\\n\`));

      send("sync", version);

      const timer = setInterval(async () => {
        const next = await projectVersion(params.id);
        if (next !== version) {
          version = next;
          send("change", next);
        }
      }, 4000);

      // Соединение закрываем сами, не дожидаясь лимита платформы:
      // браузер переподключится, и поток не оборвётся по таймауту хостинга
      setTimeout(() => {
        clearInterval(timer);
        controller.close();
      }, 45_000);
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store" },
  });
}`}
        />
        <Callout tone="note" title="Отпечаток вместо выгрузки">
          <code>projectVersion</code> считает дешёвый агрегат — количество записей
          и время последнего изменения. Количество нужно отдельно от времени:
          удаление записи время последнего изменения не двигает.
        </Callout>
      </Section>
    </>
  );
}
