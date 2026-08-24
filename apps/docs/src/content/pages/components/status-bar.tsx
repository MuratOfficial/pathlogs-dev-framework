import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { StatusBarDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "fit", title: "Приоритеты при нехватке места" },
  { id: "logic", title: "Раскладка отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Нижняя полоса как в редакторах кода: сегменты, живые счётчики, состояние
        соединения. Достраивает <a href="/docs/components/app-shell">AppShell</a> снизу.
      </p>

      <Section title="Пример" id="example">
        <Example
          plain
          code={`<StatusBar
  segments={[
    { id: "branch", content: <>main</>, priority: 5 },
    { id: "conn", content: <LiveIndicator status="live" />, pinned: true, align: "right" },
    { id: "pos", content: <>Стр 42, Кол 8</>, priority: 1, align: "right" },
  ]}
/>`}
        >
          <StatusBarDemo />
        </Example>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "segments", type: "StatusBarSegment[]", required: true, description: "Сегменты: content, priority, pinned, align, onClick, tip." },
            { name: "gap", type: "number", default: "12", description: "Зазор между сегментами (должен совпадать с CSS)." },
          ]}
        />
      </Section>

      <Section title="Приоритеты при нехватке места" id="fit">
        <Callout tone="why" title="Обрезать по краю нельзя">
          На узком экране полоса не влезает целиком. <code>overflow: hidden</code>{" "}
          убрал бы то, что оказалось справа, а не наименее важное. Поэтому сегменты
          уходят в меню «ещё» по возрастанию приоритета, а <code>pinned</code> —
          обычно статус соединения — не убирается никогда: показать «нет связи»
          важнее, чем уложиться в ширину.
        </Callout>
      </Section>

      <Section title="Раскладка отдельно" id="logic">
        <CodeBlock code={`import { fitSegments, estimateWidth } from "@toimetdev/pathlogs-core";`} />
      </Section>
    </>
  );
}
