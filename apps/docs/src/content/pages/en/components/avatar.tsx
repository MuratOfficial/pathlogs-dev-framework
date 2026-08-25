import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { AvatarDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "stack", title: "The stack" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        An avatar: a photo, or initials on an accent background when there is none. Plus an
        overlapping stack for a list of members.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { Avatar, AvatarStack, initials } from "@toimetdev/pathlogs-core";

<Avatar person={user} size="md" />
<AvatarStack people={task.assignees} max={3} />

initials("Murat Toimet"); // "MT"`}
        >
          <AvatarDemo />
        </Example>
      </Section>

      <Section title="The stack" id="stack">
        <p>
          Shows the first <code>max</code> avatars and folds the rest into a «+N». A ring in
          the background colour separates neighbouring avatars from one another.
        </p>
        <Callout tone="why" title="The remainder shows names, not just a number">
          «+3» on its own does not answer the single question people look at it to answer:
          which three. So the counter carries a tooltip with their names.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            {
              name: "person",
              type: "{ id: string; name: string; image?: string | null }",
              required: true,
              description: "Who to show. Without an image, initials are drawn.",
            },
            {
              name: "size",
              type: '"xs" | "sm" | "md"',
              default: '"sm"',
              description: "Size: 20 / 24 / 32 px.",
            },
            {
              name: "tip",
              type: "boolean",
              default: "true",
              description: "Show the name as a tooltip on hover.",
            },
          ]}
        />
        <p>
          <code>AvatarStack</code> takes <code>people</code>, <code>max</code> (3 by default)
          and <code>size</code>.
        </p>
      </Section>
    </>
  );
}
