import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { EventStreamDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Example" },
  { id: "options", title: "Options" },
  { id: "hidden", title: "Hidden tabs" },
  { id: "server", title: "The server side" },
];

export default function Page() {
  return (
    <>
      <p>
        Subscribing to a server event stream (SSE). The typical use is a «live» screen: the
        server says «something changed» and the page pulls fresh data itself, with no reload
        and no loss of scroll position.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { useEventStream } from "@toimetdev/pathlogs-hooks";
import { LiveIndicator } from "@toimetdev/pathlogs-core";

const { status, updatedAt } = useEventStream(\`/api/projects/\${id}/stream\`, {
  events: ["change"],
  onEvent: () => router.refresh(),
});

<LiveIndicator status={status} updatedAt={updatedAt} locale="en-US" />`}
        >
          <EventStreamDemo />
        </Example>
        <p>
          Reconnection is not our concern: <code>EventSource</code> handles it. Our job is to
          be honest about the fact that the connection is currently down.
        </p>
      </Section>

      <Section title="Options" id="options">
        <PropsTable
          rows={[
            {
              name: "url",
              type: "string | null",
              required: true,
              description:
                "The stream address. null disables the subscription — handy while the id is not known yet.",
            },
            {
              name: "onEvent",
              type: "(event: MessageEvent) => void",
              description:
                "What to do on an event. Read at event time, so no stable reference is needed.",
            },
            {
              name: "events",
              type: "string[]",
              default: '["message"]',
              description: "The SSE event names to react to.",
            },
            {
              name: "deferWhenHidden",
              type: "boolean",
              default: "true",
              description:
                "Defer handling while the tab is hidden, then run it once on return.",
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Disable the subscription without removing the hook.",
            },
            {
              name: "withCredentials",
              type: "boolean",
              default: "false",
              description:
                "Send cookies — needed for authenticated streams on another domain.",
            },
          ]}
        />
        <p>
          Returns <code>{"{ status, updatedAt }"}</code>, where the status is{" "}
          <code>connecting</code>, <code>live</code> or <code>offline</code>.
        </p>
      </Section>

      <Section title="Hidden tabs" id="hidden">
        <Callout tone="why" title="Why refreshes are deferred">
          There is no point refreshing a screen nobody is looking at: it means extra requests
          to the server and extra work in a background tab. But a change must not be lost
          either — on returning, the user has to see the current state immediately. So an
          event that arrives in a hidden tab is remembered and applied on return.
        </Callout>
        <p>
          Only the last event is kept: the screen re-reads its whole state anyway, so there is
          nothing to gain from accumulating a queue.
        </p>
      </Section>

      <Section title="The server side" id="server">
        <p>
          The hook assumes nothing about the server beyond the SSE format. A minimal handler
          in Next.js:
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

      // We close the connection ourselves rather than waiting for the platform
      // limit: the browser reconnects, so the stream is not cut off by a
      // hosting timeout
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
        <Callout tone="note" title="A fingerprint, not a dump">
          <code>projectVersion</code> computes a cheap aggregate — the number of records and
          the time of the last change. The count is needed separately from the time: deleting
          a record does not move the last-changed timestamp.
        </Callout>
      </Section>
    </>
  );
}
