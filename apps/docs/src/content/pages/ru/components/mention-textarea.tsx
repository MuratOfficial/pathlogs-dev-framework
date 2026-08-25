import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { MentionDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "ids", title: "Почему id, а не текст" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Поле ввода с автодополнением <code>@упоминаний</code>. Меню открывается
        на «@» и закрывается на пробеле; Enter и Tab вставляют первый вариант.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { MentionTextarea } from "@toimetdev/pathlogs-core";

<form action={addComment}>
  <MentionTextarea
    name="body"
    people={project.members}
    rows={3}
    placeholder="Наберите @ и начните вводить имя…"
  />
  <button type="submit">Отправить</button>
</form>`}
        >
          <MentionDemo />
        </Example>
        <p>
          Вставка идёт мимо <code>onChange</code>, поэтому курсор возвращается
          сразу за вставленное имя, а не прыгает в конец текста.
        </p>
      </Section>

      <Section title="Почему id, а не текст" id="ids">
        <p>
          Рядом с полем компонент держит скрытый input со списком идентификаторов
          упомянутых:
        </p>
        <CodeBlock lang="html" code={`<input type="hidden" name="mentions" value="u1,u3" />`} />
        <Callout tone="why" title="Уведомления не должны зависеть от текста">
          Разбирать «@Иван Петров» обратно в пользователя — гиблое дело: человека
          могли переименовать, в проекте бывают тёзки, а сам текст пользователь
          волен отредактировать как угодно. Идентификатор, записанный в момент
          выбора из меню, переживает всё это.
          <br />
          <br />
          Текст при этом остаётся человекочитаемым, а подсветить упоминания
          при показе умеет <code>Markdown</code> — ему достаточно списка имён.
        </Callout>
        <p>
          Имя скрытого поля меняется пропом <code>mentionsName</code>, если{" "}
          <code>mentions</code> у вас занято.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "name", type: "string", required: true, description: "Имя поля в форме." },
            {
              name: "people",
              type: "{ id, name, image? }[]",
              required: true,
              description: "Кого можно упомянуть. Фильтруются по подстроке в имени.",
            },
            {
              name: "mentionsName",
              type: "string",
              default: '"mentions"',
              description: "Имя скрытого поля со списком id через запятую.",
            },
            { name: "limit", type: "number", default: "6", description: "Сколько вариантов показывать." },
            {
              name: "value / onValueChange",
              type: "string / (value: string) => void",
              description: "Внешнее управление значением. Без них компонент держит его сам.",
            },
            { name: "rows", type: "number", default: "2", description: "Высота поля." },
            { name: "placeholder", type: "string", description: "Подсказка в пустом поле." },
            { name: "autoFocus", type: "boolean", description: "Курсор сразу в поле — для формы ответа, открытой по клику." },
          ]}
        />
      </Section>
    </>
  );
}
