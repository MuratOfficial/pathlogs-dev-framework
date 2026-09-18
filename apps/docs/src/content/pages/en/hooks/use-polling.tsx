import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { PollingDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Example" },
  { id: "options", title: "Options" },
  { id: "when", title: "Polling versus streaming" },
];

export default function Page() {
  return (
    <>
      <p>
        Periodic polling — for values not worth holding a permanent connection open for: an
        unread counter, the status of a background job, the number of people online.
      </p>

      <Section title="Example" id="example">
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
          The initial value comes from the server, so the counter shows the truth from the
          very first frame instead of flashing a zero until the first request lands.
        </p>
      </Section>

      <Section title="Options" id="options">
        <PropsTable
          rows={[
            {
              name: "fetcher",
              type: "() => Promise<T>",
              required: true,
              description: "What to request. Errors are swallowed — we will try again next time.",
            },
            {
              name: "initial",
              type: "T",
              required: true,
              description:
                "The value before the first successful request. Usually comes from the server.",
            },
            {
              name: "interval",
              type: "number",
              default: "30000",
              description: "The polling period in milliseconds.",
            },
            {
              name: "pauseWhenHidden",
              type: "boolean",
              default: "true",
              description:
                "Do not poll while the tab is in the background. Nobody reads a value in a tab they cannot see.",
            },
            {
              name: "immediate",
              type: "boolean",
              default: "false",
              description: "Poll right on mount instead of waiting out the first interval.",
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Disable polling without removing the hook.",
            },
          ]}
        />
        <p>
          Returns <code>{"{ data, refresh }"}</code>. <code>refresh</code> goes down the same
          path as the timer — one entry point, one policy.
        </p>
        <Callout tone="note" title="Polling also happens when focus returns">
          Not only on the timer: coming back to a tab after an hour, the user expects a fresh
          value immediately, not in another thirty seconds. The hook listens for{" "}
          <code>visibilitychange</code> and <code>focus</code>.
        </Callout>
      </Section>

      <Section title="Polling versus streaming" id="when">
        <ul>
          <li>
            <strong>Polling</strong> — when the value is small, changes rarely, and a delay of
            tens of seconds upsets nobody. It asks nothing of the server beyond an ordinary
            endpoint.
          </li>
          <li>
            <strong>Streaming</strong> (<code>useEventStream</code>) — when a change must
            arrive within seconds and several people see it at once: a board, comments,
            collaborative editing.
          </li>
        </ul>
        <p>
          Holding a connection open for a number in the corner of the screen is a bad trade:
          you get as many connections as there are tabs, for a penny's worth of benefit.
        </p>
      </Section>
    </>
  );
}
