import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { BadgeDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Example" },
  { id: "color", title: "A colour chosen by the user" },
  { id: "level", title: "The level meter" },
  { id: "props", title: "Props" },
];

export default function Page() {
  return (
    <>
      <p>
        A pill-shaped label for a type, a status or a tag — and a level meter for ordinal
        values such as priority.
      </p>

      <Section title="Example" id="example">
        <Example
          code={`import { Badge, LevelMeter } from "@toimetdev/pathlogs-core";

<Badge color="#6366f1">Feature</Badge>
<Badge color="#ef4444">Bug</Badge>
<Badge color="#eab308" solid>Solid</Badge>
<Badge>No colour</Badge>

<LevelMeter level={3} color="#f97316" label="Priority: high" />`}
        >
          <BadgeDemo />
        </Example>
      </Section>

      <Section title="A colour chosen by the user" id="color">
        <p>
          A label's colour is set by a person, not by the design system. Both the fill and the
          text are derived from that single value:
        </p>
        <CodeBlock
          code={`// the usual variant: translucent fill, the colour goes into the text
backgroundColor: alpha(color, 0.15)
color: color

// solid: an opaque fill, the text colour computed from contrast
backgroundColor: color
color: readableTextOn(color)   // black or white — whichever reads better`}
        />
        <Callout tone="why" title="Why the fill is translucent by default">
          It means one and the same label reads well in both the dark and the light theme,
          without keeping two palettes or asking the user to pick a colour twice. The solid
          variant is for where a label has to shout — and there the text colour is computed
          from the background's luminance, because white on yellow reads as nothing at all.
        </Callout>
      </Section>

      <Section title="The level meter" id="level">
        <p>
          <code>LevelMeter</code> draws rising bars, filled up to the current value.
        </p>
        <Callout tone="why" title="Why a meter and not a coloured dot">
          A dot conveys only «which one»; a meter also conveys «how much». And, more
          importantly, it does not rely on colour alone: the level is visible from the number
          of filled bars, so priority stays legible with colour blindness and in a
          black-and-white printout of a report.
        </Callout>
      </Section>

      <Section title="Props" id="props">
        <PropsTable
          rows={[
            { name: "children", type: "ReactNode", required: true, description: "The label's contents." },
            { name: "color", type: "string", description: "A colour in #rrggbb. Without it the label is neutral." },
            { name: "solid", type: "boolean", default: "false", description: "The solid variant: colour as the fill." },
            { name: "size", type: '"sm" | "md"', default: '"sm"', description: "The size." },
            { name: "tip", type: "string", description: "A tooltip on hover." },
          ]}
        />
        <p>
          <code>LevelMeter</code>: <code>level</code> (from 1), <code>levels</code> (total
          number of bars, 4 by default), <code>color</code> and <code>label</code> — the
          caption goes both into the tooltip and into <code>aria-label</code>.
        </p>
      </Section>
    </>
  );
}
