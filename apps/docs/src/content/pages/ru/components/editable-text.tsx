import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { EditableTextDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "behaviour", title: "Поведение" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Текст, который правится по клику прямо на месте: название задачи, описание,
        заметка. Без отдельной формы и без режима редактирования у всей страницы.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { EditableText } from "@toimetdev/pathlogs-core";

<EditableText
  value={task.title}
  onSave={(next) => updateTask(task.id, { title: next })}
  big
  tip="Нажмите, чтобы переименовать"
/>

<EditableText
  value={task.description}
  onSave={(next) => updateTask(task.id, { description: next })}
  multiline
  markdown
  placeholder="Добавить описание…"
/>`}
        >
          <EditableTextDemo />
        </Example>
      </Section>

      <Section title="Поведение" id="behaviour">
        <ul>
          <li>
            <strong>Сохранение</strong> — по потере фокуса и по Enter в однострочном
            поле. В многострочном Enter переносит строку, как и положено.
          </li>
          <li>
            <strong>Escape</strong> отменяет правку и возвращает исходное значение.
          </li>
          <li>
            <strong>Клавиатура</strong> открывает правку так же, как мышь: Enter
            или пробел на сфокусированном тексте.
          </li>
          <li>
            <strong>Пока идёт сохранение</strong> текст приглушён — видно, что
            изменение ещё не доехало.
          </li>
        </ul>
        <Callout tone="why" title="Значение без изменений не сохраняется">
          Клик по тексту и клик мимо — обычное дело: так листают страницу
          и снимают фокус. Если бы каждый такой клик отправлял запрос, история
          изменений задачи за неделю распухла бы от записей «изменил название
          на то же самое». Поэтому черновик сравнивается с исходником по обрезанному
          значению, и совпадение просто ничего не делает.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "value", type: "string", required: true, description: "Текущее значение." },
            {
              name: "onSave",
              type: "(next: string) => void | Promise<void>",
              required: true,
              description: "Сохранение. Пока промис не разрешится, текст показан приглушённо.",
            },
            {
              name: "multiline",
              type: "boolean",
              default: "false",
              description: "Многострочное поле вместо однострочного.",
            },
            {
              name: "markdown",
              type: "boolean",
              default: "false",
              description: "Показывать значение как ограниченный Markdown в режиме просмотра. Работает вместе с multiline.",
            },
            { name: "big", type: "boolean", default: "false", description: "Крупный кегль — для заголовков." },
            { name: "placeholder", type: "string", default: '"—"', description: "Что показать вместо пустого значения." },
            { name: "tip", type: "string", description: "Подсказка при наведении на текст." },
            { name: "rows", type: "number", default: "5", description: "Высота многострочного поля." },
            { name: "disabled", type: "boolean", default: "false", description: "Правка запрещена — например, нет прав." },
          ]}
        />
      </Section>
    </>
  );
}
