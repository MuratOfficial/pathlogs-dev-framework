import Link from "next/link";
import { Callout, CodeBlock, Section } from "@/components/docs";

export const toc = [
  { id: "why", title: "Why" },
  { id: "split", title: "Two ways to ship" },
  { id: "parts", title: "What's inside" },
  { id: "principles", title: "Principles" },
];

export default function Page() {
  return (
    <>
      <p>
        PathLogs UI grew out of an issue tracker: the board, the Gantt chart, the command
        palette and a dozen primitives were written for one specific product — and then it
        turned out half of them were needed in every project after it. The framework is that
        half, lifted out of the application and stripped of its domain.
      </p>

      <Section title="Why" id="why">
        <p>
          There is no shortage of component libraries, and the world does not need another
          button. The value here is elsewhere — in the things people rewrite in every project
          and trip over the same way every time:
        </p>
        <ul>
          <li>
            drag-to-scroll that <strong>does not break clicks</strong> and yields to native
            drag&amp;drop;
          </li>
          <li>
            a kanban board whose optimistic state <strong>does not snap back</strong> during
            quick successive moves;
          </li>
          <li>
            a dropdown menu that <strong>does not take the dialog with it</strong> when that
            dialog was opened from the menu itself;
          </li>
          <li>
            user-supplied Markdown in which raw HTML and a <code>javascript:</code> link are{" "}
            <strong>impossible</strong>.
          </li>
        </ul>
        <p>
          Every one of these small things cost real debugging, and next to each of them in the
          code sits a comment explaining what the alternative would have been.
        </p>
      </Section>

      <Section title="Two ways to ship" id="split">
        <p>
          The framework is delivered two different ways. That is not a compromise — it is a
          split along the grain of the code.
        </p>

        <div className="not-prose my-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-edge bg-surface p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-hover">
              npm packages
            </p>
            <p className="mb-3 text-sm font-medium">Tokens, hooks, primitives</p>
            <p className="text-sm leading-relaxed text-muted">
              These change rarely, and you want to update them with a single command.
              Versioning genuinely helps here.
            </p>
          </div>
          <div className="rounded-xl border border-edge bg-surface p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-hover">
              CLI registry
            </p>
            <p className="mb-3 text-sm font-medium">Board, Gantt, filters</p>
            <p className="text-sm leading-relaxed text-muted">
              Heavyweight widgets almost always need edits for a particular domain. Keeping
              them behind a versioning wall just forces you to tunnel through it with props.
            </p>
          </div>
        </div>

        <Callout tone="why" title="Why widgets are copied rather than installed">
          A board you cannot edit grows props instead: <code>renderCardHeader</code>,{" "}
          <code>hideAssignees</code>, <code>cardClassName</code> — and six months later its API
          is larger than the component. A copy inside your project removes the problem
          entirely: if you need different behaviour, open the file and write it.
        </Callout>
      </Section>

      <Section title="What's inside" id="parts">
        <CodeBlock
          lang="bash"
          code={`@toimetdev/pathlogs-tokens   CSS variables, themes, colour utilities
@toimetdev/pathlogs-hooks    drag-scroll, hotkeys, SSE, polling, theme
@toimetdev/pathlogs-core     dialogs, menus, tooltips, palette, Markdown
@toimetdev/pathlogs-ui       CLI: copies widgets into your project`}
        />
        <p>
          The component packages carry <strong>their own CSS</strong> and do not require
          Tailwind. Registry widgets are the opposite — they are marked up with Tailwind,
          because they land in your project, where it is already configured.
        </p>
      </Section>

      <Section title="Principles" id="principles">
        <ul>
          <li>
            <strong>A component knows nothing about your domain.</strong> What to show is
            decided by <code>renderCard</code>; what to do, by a callback. The same board
            serves tasks, support tickets and job candidates.
          </li>
          <li>
            <strong>Logic is separated from markup.</strong> Everything that can be checked
            without a DOM lives in its own module and is covered by tests: card ordering,
            the critical path, Markdown parsing, the maths of momentum.
          </li>
          <li>
            <strong>Colour is never the only carrier of meaning.</strong> A status always has
            text beside it; a priority has a meter, not just a hue.
          </li>
          <li>
            <strong>Comments explain the «why».</strong> Where a decision is not obvious,
            the note next to it says what the alternative would have been.
          </li>
        </ul>

        <p>
          Next up — <Link href="/docs/installation">installation</Link>: packages, styles and
          the theme script.
        </p>
      </Section>
    </>
  );
}
