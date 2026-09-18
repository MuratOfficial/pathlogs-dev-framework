import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { TagInputDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "logic", title: "Разбор отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Многозначный ввод: значения-чипы вместо строки через запятую. Метки,
        адреса, идентификаторы. Enter и запятая добавляют, Backspace в пустом
        поле убирает последний чип.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`<TagInput
  value={tags}
  onChange={setTags}
  max={6}
  onReject={(v, reason) => toast(reason === "duplicate" ? "уже есть" : "…")}
/>`}
        >
          <TagInputDemo />
        </Example>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "value / onChange", type: "string[] / (tags) => void", required: true, description: "Список значений." },
            { name: "max", type: "number", description: "Предел количества." },
            { name: "caseInsensitive", type: "boolean", default: "true", description: "«Bug» и «bug» — одно значение." },
            { name: "validate", type: "(value) => boolean", description: "Проверка: false отклоняет значение." },
            { name: "separators", type: "string[]", description: "Разделители при разборе вставки. По умолчанию — запятая, ; и перенос строки." },
            { name: "onReject", type: "(value, reason) => void", description: "Отклонённое значение: duplicate | invalid | limit." },
            { name: "name", type: "string", description: "Скрытое поле — чтобы отправить теги обычной формой." },
          ]}
        />
      </Section>

      <Section title="Разбор отдельно" id="logic">
        <Callout tone="why" title="Главный случай — вставка из буфера">
          <code>a, b;c</code> из письма или таблицы разбирается на отдельные чипы
          с отсевом повторов и пустот. Пробел в разделители не входит: значения
          бывают из двух слов («Мурат Тоймет», «in progress»).
        </Callout>
        <CodeBlock
          code={`import {
  addTags,       // добавить с отсевом повторов, пустот и сверх лимита
  splitTags,     // разбить вставленную строку по разделителям
  normalizeTag,  // срезать пробелы и обрамляющие кавычки
} from "@toimetdev/pathlogs-core";`}
        />
      </Section>
    </>
  );
}
