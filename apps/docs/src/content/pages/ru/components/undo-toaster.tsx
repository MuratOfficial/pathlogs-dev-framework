import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { UndoToasterDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "merge", title: "Слияние серий" },
  { id: "logic", title: "Стек отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        «Отменить» с видимым таймером вместо диалога подтверждения. Действие
        выполняется сразу, а рядом на несколько секунд появляется отмена
        с тающим кольцом.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`<UndoToaster onUndo={(a) => restore(a.payload)}>
  {({ notify }) => (
    <button onClick={() => {
      remove(item);
      notify({ label: "Удалено", mergeKey: "delete", payload: item });
    }}>Удалить</button>
  )}
</UndoToaster>`}
        >
          <UndoToasterDemo />
        </Example>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "onUndo", type: "(action) => void", required: true, description: "Что сделать при нажатии «Отменить»." },
            { name: "children", type: "(controller) => ReactNode", required: true, description: "Даёт notify — его зовут из обработчиков действий." },
            { name: "ttlMs", type: "number", default: "5000", description: "Сколько живёт предложение по умолчанию." },
            { name: "placement", type: '"bottom" | "bottom-left" | "bottom-right"', default: '"bottom"', description: "Куда прижать." },
          ]}
        />
      </Section>

      <Section title="Слияние серий" id="merge">
        <Callout tone="why" title="Три удаления подряд — одно предложение">
          Действия с одним <code>mergeKey</code>, идущие подряд в пределах окна,
          складываются в одну запись с счётчиком: «Удалено ×3». Без этого удаление
          трёх задач давало бы три всплывающих панели, а отменить можно было бы
          только последнюю. Слияние продлевает жизнь записи от последнего
          действия, а не от первого.
        </Callout>
      </Section>

      <Section title="Стек отдельно" id="logic">
        <CodeBlock
          code={`import {
  pushUndo,      // положить действие (со слиянием серий)
  expireUndo,    // разделить на живые и истёкшие
  undoProgress,  // доля прожитого времени — для кольца
  undoLabel,     // подпись с счётчиком серии
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
