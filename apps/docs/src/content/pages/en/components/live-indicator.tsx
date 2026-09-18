import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { LiveIndicatorDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "a11y", title: "Not colour alone" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        Live connection state as a dot and a caption. It usually sits next to the heading of a
        screen that refreshes itself.
      </p>

      <Section title="Example" id="example">
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
  locale="en-US"
  labels={{
    updated: "updated at {time}",
    connecting: "connecting…",
    offline: "no connection — updates are paused",
  }}
/>`}
        >
          <LiveIndicatorDemo />
        </Example>
      </Section>

      <Section title="Not colour alone" id="a11y">
        <Callout tone="why" title="There is always text beside the dot">
          A green dot and a red one differ only in hue — and with the most common form of
          colour blindness that is exactly the pair that cannot be told apart. A caption next
          to it makes the indicator legible for everyone, and at the same time conveys what
          colour never could: when the data was actually refreshed.
        </Callout>
        <p>
          This is why <code>offline</code> is captioned not simply «no connection» but
          «updates are paused»: what matters to the user is the consequence, not the
          diagnosis.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "status",
              type: '"connecting" | "live" | "offline"',
              required: true,
              description: "The connection state. Comes from useEventStream.",
            },
            {
              name: "updatedAt",
              type: "Date | null",
              description: "When a change was last applied.",
            },
            {
              name: "locale",
              type: "string",
              description: "The locale for the time. Defaults to the browser's locale.",
            },
            {
              name: "labels",
              type: "{ live?, connecting?, offline?, updated?, tipLive?, tipOffline? }",
              description: (
                <>
                  Captions. <code>{"{time}"}</code> is substituted inside <code>updated</code>.
                </>
              ),
            },
          ]}
        />
        <CodeBlock
          code={`labels={{ updated: "updated at {time}" }}
// → «updated at 2:32 PM»`}
        />
      </Section>
    </>
  );
}
