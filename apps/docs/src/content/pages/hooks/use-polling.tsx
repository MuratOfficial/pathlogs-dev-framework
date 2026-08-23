import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { PollingDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "options", title: "Параметры" },
  { id: "when", title: "Когда опрос, а когда поток" },
];

export default function Page() {
  return (
    <>
      <p>
        Периодический опрос — для значений, ради которых не стоит держать постоянное
        соединение: счётчик непрочитанных, статус фоновой задачи, число участников
        онлайн.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { usePolling } from "@toimetdev/pathlogs-hooks";

const { data: count, refresh } = usePolling(
  async () => {
    const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
    const json = await res.json();
    return json.count as number;
  },
  { initial: unreadFromServer, interval: 30_000 }
);`}
        >
          <PollingDemo />
        </Example>
        <p>
          Начальное значение приходит с сервера, поэтому счётчик показывает правду
          с первого кадра, а не мигает нулём до первого запроса.
        </p>
      </Section>

      <Section title="Параметры" id="options">
        <PropsTable
          rows={[
            {
              name: "fetcher",
              type: "() => Promise<T>",
              required: true,
              description: "Что запрашивать. Ошибки проглатываются — попробуем в следующий раз.",
            },
            {
              name: "initial",
              type: "T",
              required: true,
              description: "Значение до первого успешного запроса. Обычно приходит с сервера.",
            },
            {
              name: "interval",
              type: "number",
              default: "30000",
              description: "Период опроса в миллисекундах.",
            },
            {
              name: "pauseWhenHidden",
              type: "boolean",
              default: "true",
              description: "Не опрашивать, пока вкладка в фоне. Значение в невидимой вкладке никто не читает.",
            },
            {
              name: "immediate",
              type: "boolean",
              default: "false",
              description: "Опросить сразу при монтировании, не дожидаясь первого интервала.",
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Выключить опрос, не снимая хук.",
            },
          ]}
        />
        <p>
          Возвращает <code>{"{ data, refresh }"}</code>. <code>refresh</code> дёргает
          тот же путь, что и таймер, — одна точка входа, одна политика.
        </p>
        <Callout tone="note" title="Опрос идёт и по возврату фокуса">
          Не только по таймеру: вернувшись на вкладку через час, пользователь ждёт
          свежее значение сразу, а не через тридцать секунд. Хук слушает{" "}
          <code>visibilitychange</code> и <code>focus</code>.
        </Callout>
      </Section>

      <Section title="Когда опрос, а когда поток" id="when">
        <ul>
          <li>
            <strong>Опрос</strong> — когда значение маленькое, меняется редко
            и задержка в десятки секунд никого не расстроит. Не требует ничего
            от сервера, кроме обычного эндпоинта.
          </li>
          <li>
            <strong>Поток</strong> (<code>useEventStream</code>) — когда изменение
            должно долетать за секунды и его видят несколько человек сразу: доска,
            комментарии, совместное редактирование.
          </li>
        </ul>
        <p>
          Держать открытое соединение ради числа в углу экрана — плохая сделка:
          соединений столько же, сколько вкладок, а пользы на копейку.
        </p>
      </Section>
    </>
  );
}
