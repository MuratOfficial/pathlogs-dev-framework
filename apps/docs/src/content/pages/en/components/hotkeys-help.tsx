import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "example", title: "Example" },
  { id: "single-source", title: "One list" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        A keyboard shortcuts help screen, opened with «?». Assembled from the very same array
        that was handed to the handler.
      </p>

      <Section title="Example" id="example">
        <CodeBlock
          code={`import { HotkeysHelp } from "@toimetdev/pathlogs-core";

const hotkeys = [
  { keys: "g d", label: "Projects", group: "Navigation", handler: () => router.push("/dashboard") },
  { keys: "g m", label: "My tasks", group: "Navigation", handler: () => router.push("/my") },
  { keys: "d", label: "Mark as done", group: "Board", handler: markDone },
  { keys: "mod+k", label: "Search", allowInInput: true, handler: openPalette },
];

<HotkeysHelp hotkeys={hotkeys} hint="«g» is the leader: press g, then a second key." />`}
        />
        <p>
          There is no need to call <code>useHotkeys</code> separately — the component does it
          itself and adds the help shortcut to the list.
        </p>
      </Section>

      <Section title="One list" id="single-source">
        <Callout tone="why" title="Why the help is not a separate table">
          A «key → description» table written next to the handlers survives exactly until the
          first change. Someone reassigns a key, forgets to update the help — and now it lies,
          with nobody to notice: people rarely look at the help.
          <br />
          <br />
          Here there is one source. A shortcut gains a <code>label</code> and it is in the
          help immediately. It disappears, and it is gone from there too.
        </Callout>
        <p>
          Only entries with a caption make it into the help. Shortcuts without a{" "}
          <code>label</code> are treated as internal — close the window, confirm — and would
          be noise in the list.
        </p>
        <p>
          Sections appear in order of first use rather than alphabetically: that way the
          author's intent is visible, whereas the alphabet would shuffle related groups apart.
        </p>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "hotkeys",
              type: "Hotkey[]",
              required: true,
              description: "The same list you would hand to useHotkeys.",
            },
            {
              name: "hotkey",
              type: "string",
              default: '"?"',
              description: "The shortcut that opens the help.",
            },
            {
              name: "title",
              type: "string",
              default: '"Keyboard shortcuts"',
              description: "The window heading.",
            },
            {
              name: "hint",
              type: "string",
              description: "A note at the bottom — about the leader key, for instance.",
            },
          ]}
        />
        <p>
          Entries such as <code>mod</code>, <code>arrowup</code> and <code>escape</code> are
          shown as ⌘/Ctrl, ↑ and Esc: the event name reads worse than the symbol itself.
        </p>
      </Section>
    </>
  );
}
