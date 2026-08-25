import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { PresenceLayerDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Installation" },
  { id: "example", title: "Example" },
  { id: "props", title: "Props" },
  { id: "smoothing", title: "Smoothing and expiry" },
  { id: "logic", title: "The state, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        Collaborator cursors over a shared surface — as in Figma and multiplayer apps. Fed by
        the same event stream as <a href="/docs/hooks/use-event-stream">useEventStream</a>.
      </p>

      <Section title="Installation" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add presence-layer" />
      </Section>

      <Section title="Example" id="example">
        <Example
          plain
          code={`<div className="relative">
  <Board />
  <PresenceLayer events={presenceEvents} selfId={me.id} />
</div>`}
        >
          <PresenceLayerDemo />
        </Example>
        <p>
          Three cursors circle around — the stream is «replayed» frame by frame to show the
          smoothing at work.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "events",
              type: "PresenceEvent[]",
              required: true,
              description: "The stream of presence events: actorId, name, cursor, selection, at.",
            },
            { name: "selfId", type: "string", description: "Your own actor — their cursor is not drawn." },
            {
              name: "ttlMs",
              type: "number",
              default: "15000",
              description: "How long a silence before a cursor is removed.",
            },
            {
              name: "smoothing",
              type: "number",
              default: "0.2",
              description: "Catch-up smoothness (0..1): lower is smoother and slower.",
            },
            { name: "children", type: "ReactNode", description: "The surface beneath the layer." },
          ]}
        />
      </Section>

      <Section title="Smoothing and expiry" id="smoothing">
        <Callout tone="why" title="Events arrive in bursts">
          Presence arrives unevenly over the network: three events in one frame, then a second
          of silence. Showing them as they come means juddering cursors. The drawn cursor
          chases the reported position with exponential smoothing tied to frame time — so it
          travels smoothly at any event rate.
        </Callout>
        <Callout tone="why" title="TTL removes the departed, not a «left» event">
          Tabs get closed and connections drop, and no farewell event ever arrives. Without
          expiry by TTL, such ghosts would pile up on screen forever. A participant's colour is
          derived by hashing their id — the same person is recognisable by colour even after
          reconnecting.
        </Callout>
      </Section>

      <Section title="The state, separately" id="logic">
        <CodeBlock
          code={`import {
  applyPresence,   // apply an event (stale ones are ignored)
  interpolate,     // advance cursors towards their targets by one frame
  pruneStale,      // remove those long silent
  colorFor,        // a stable colour from an id
} from "@/components/ui/presence-layer/presence";`}
        />
      </Section>
    </>
  );
}
