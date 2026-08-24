import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { SlashTextareaDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "logic", title: "Детект триггера отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Поле ввода с меню команд по «/» — как в Notion, Linear и Slack. Родня{" "}
        <a href="/docs/components/mention-textarea">MentionTextarea</a>, но «/»
        запускает действие или вставляет шаблон, а не имя.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`<SlashTextarea
  value={value}
  onValueChange={setValue}
  commands={commands}
  onCommand={(cmd) => {
    if (cmd.id === "date") return new Date().toLocaleDateString(); // вставится
    createTask();                                                  // или действие
  }}
/>`}
        >
          <SlashTextareaDemo />
        </Example>
        <p>Наберите «/» в поле — появится меню. Стрелки и Enter выбирают команду.</p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "value / onValueChange", type: "string / (v) => void", required: true, description: "Текст поля." },
            { name: "commands", type: "SlashCommand[]", required: true, description: "Команды: id, label, hint, icon, keywords." },
            { name: "onCommand", type: "(cmd) => string | void", required: true, description: "Строка вставится вместо «/…»; void — команда-действие." },
            { name: "trigger", type: "string", default: '"/"', description: "Символ-триггер." },
            { name: "rows", type: "number", default: "4", description: "Высота поля." },
          ]}
        />
      </Section>

      <Section title="Детект триггера отдельно" id="logic">
        <Callout tone="why" title="Путь не открывает меню">
          Триггер срабатывает только в начале строки или после пробела: <code>/dep</code> —
          команда, а <code>src/index.ts</code> — нет. Та же механика ловит «@» для
          упоминаний и «#» для меток.
        </Callout>
        <CodeBlock
          code={`import {
  triggerAt,       // активный триггер у каретки (null — меню закрыто)
  replaceTrigger,  // заменить «/…» на текст и вернуть новую каретку
  filterByQuery,   // отбор вариантов по набранному запросу
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
