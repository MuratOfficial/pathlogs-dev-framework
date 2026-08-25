import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { HotkeysDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Example" },
  { id: "syntax", title: "Key notation" },
  { id: "options", title: "Options" },
  { id: "input", title: "Text inputs" },
  { id: "help", title: "The help screen" },
  { id: "matcher", title: "The matcher, separately" },
];

export default function Page() {
  return (
    <>
      <p>
        Global keyboard shortcuts with support for sequences: press «g», then «d» — and you
        are on the dashboard.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { useHotkeys } from "@toimetdev/pathlogs-hooks";

useHotkeys([
  { keys: "g d", label: "Dashboard", handler: () => router.push("/dashboard") },
  { keys: "g m", label: "My tasks", handler: () => router.push("/my") },
  { keys: "d", label: "Mark as done", handler: markDone },
  { keys: "mod+k", label: "Search", allowInInput: true, handler: openPalette },
]);`}
        >
          <HotkeysDemo />
        </Example>
        <Callout tone="note" title="The array can be written inline">
          Handlers are read at press time, not at bind time, so a fresh closure needs no
          stable reference — there is no need to wrap the array in <code>useMemo</code>.
        </Callout>
      </Section>

      <Section title="Key notation" id="syntax">
        <p>Chords are separated by spaces; modifiers inside a chord, by a plus:</p>
        <CodeBlock
          code={`"k"            // a plain key
"g d"          // a sequence: g, then d
"mod+k"        // Ctrl on Windows/Linux, ⌘ on macOS
"mod+shift+p"  // several modifiers
"?"            // shift is implied
"escape"       // esc, up, down, left, right, enter, space, delete`}
        />
        <PropsTable
          rows={[
            {
              name: "mod",
              type: "modifier",
              description:
                "Ctrl and ⌘ in one notation. Telling ctrl and cmd apart is rarely needed — what an app almost always means is «the system modifier».",
            },
            {
              name: "shift",
              type: "modifier",
              description: (
                <>
                  Required only when written explicitly. «?» is typed with shift on most
                  layouts, and demanding <code>shift: false</code> would break that notation.
                </>
              ),
            },
            {
              name: "alt",
              type: "modifier",
              description: "Also known as option on macOS.",
            },
          ]}
        />
        <Callout tone="warn" title="A typo in a modifier fails the parse">
          <code>parseHotkey(&quot;crtl+k&quot;)</code> throws rather than creating a dead
          entry. A shortcut that silently never fires is the nastiest kind of breakage —
          it gets noticed months later.
        </Callout>
      </Section>

      <Section title="Options" id="options">
        <PropsTable
          rows={[
            {
              name: "keys",
              type: "string",
              required: true,
              description: "The key notation.",
            },
            {
              name: "handler",
              type: "(e: KeyboardEvent) => void",
              required: true,
              description: "What to do. preventDefault is called for you.",
            },
            {
              name: "label",
              type: "string",
              description: (
                <>
                  The caption for the help screen. Entries without one are treated as internal
                  and stay out of the help.
                </>
              ),
            },
            {
              name: "group",
              type: "string",
              description: "A section in the help: «Navigation», «Board».",
            },
            {
              name: "allowInInput",
              type: "boolean",
              default: "false",
              description: "Also fires while focus is in a text field. For mod+k and escape.",
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Temporarily disable an entry without removing it from the list.",
            },
          ]}
        />
        <p>
          The hook's second argument holds shared options: <code>enabled</code> switches off
          the whole set, <code>timeout</code> sets the window for the second key (1200ms by
          default), and <code>target</code> lets you listen on a specific element rather than{" "}
          <code>window</code>.
        </p>
      </Section>

      <Section title="Text inputs" id="input">
        <p>
          Ordinary keys inside a text field belong to the field, not to the application.
          Entries with <code>allowInInput</code> are the exception.
        </p>
        <Callout tone="why" title="Why there are two independent matchers inside">
          If sequence state were shared, a «g» typed into a field would leave the app waiting
          for a second key. The next genuine «d» — now outside the field — would fire as
          «go to dashboard», even though the user was merely typing the word «good». So
          anything typed in a field goes to a separate matcher that only knows about{" "}
          <code>allowInInput</code>.
        </Callout>
      </Section>

      <Section title="The help screen" id="help">
        <p>
          The same array is handed to the <code>HotkeysHelp</code> component — it shows the
          help screen on «?» and calls <code>useHotkeys</code> itself:
        </p>
        <CodeBlock
          code={`import { HotkeysHelp } from "@toimetdev/pathlogs-core";

const hotkeys = [
  { keys: "g d", label: "Dashboard", group: "Navigation", handler: goDashboard },
];

// no separate useHotkeys call needed — HotkeysHelp does it for you
<HotkeysHelp hotkeys={hotkeys} hint="«g» is the leader: press g, then a second key." />`}
        />
        <p>One list for both handling and help — there is nothing to drift apart.</p>
      </Section>

      <Section title="The matcher, separately" id="matcher">
        <p>Parsing and matching know nothing about the DOM and are covered by tests:</p>
        <CodeBlock
          code={`import {
  parseHotkey,        // "g d" → [{ key: "g" }, { key: "d" }]
  chordFromEvent,     // KeyboardEvent → a chord
  chordMatches,       // do two chords match
  createHotkeyMatcher // the state machine for sequences
} from "@toimetdev/pathlogs-hooks";`}
        />
        <p>
          The matcher stores no buffer of presses, only an index inside an unfinished
          sequence: a buffer would have to be cleared on a timer, while an index need only be
          compared against the time of the last press. That is why a «g» pressed a minute ago
          does not turn a stray «d» into a navigation.
        </p>
      </Section>
    </>
  );
}
