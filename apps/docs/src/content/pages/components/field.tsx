import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { FieldDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "render-prop", title: "Почему функция, а не дети" },
  { id: "props", title: "Пропсы" },
  { id: "inputs", title: "Поля отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Обёртка поля: подпись, пояснение и ошибка — и связка их с самим полем через{" "}
        <code>id</code> и <code>aria-describedby</code>.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { Field, Input, Select, Textarea } from "@toimetdev/pathlogs-core";

<Field label="Название проекта" required hint="Видно всем участникам">
  {(props) => <Input {...props} defaultValue="Личный кабинет" />}
</Field>

<Field label="Почта" error={invalid ? "Похоже, это не адрес почты" : undefined}>
  {(props) => <Input {...props} value={email} onChange={onChange} />}
</Field>`}
        >
          <FieldDemo />
        </Example>
        <p>
          Пока задана ошибка, пояснение скрывается: два сообщения под одним полем
          спорят друг с другом, а важнее сейчас ошибка.
        </p>
      </Section>

      <Section title="Почему функция, а не дети" id="render-prop">
        <Callout tone="why" title="Обёртке нужно передать полю сгенерированный id">
          Подпись связывается с полем через <code>htmlFor</code>, а пояснение
          и ошибка — через <code>aria-describedby</code>. Всем троим нужен один
          и тот же уникальный идентификатор.
          <br />
          <br />
          Если бы поле приходило обычными детьми, вызывающий код должен был бы
          выдумывать <code>id</code> руками и не забывать его нигде. Функция
          получает готовый набор атрибутов — и забыть уже нечего.
        </Callout>
        <CodeBlock
          code={`// приходит в функцию
{
  id: ":r3:",
  "aria-describedby": ":r3:-error",   // если есть ошибка или пояснение
  "aria-invalid": true,               // если есть ошибка
}`}
        />
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "label", type: "ReactNode", description: "Подпись над полем." },
            { name: "hint", type: "ReactNode", description: "Пояснение под полем. Скрывается, когда показана ошибка." },
            {
              name: "error",
              type: "ReactNode",
              description: (
                <>
                  Текст ошибки. Пока задан, поле помечено <code>aria-invalid</code>,
                  а сообщение читается как <code>role=&quot;alert&quot;</code>.
                </>
              ),
            },
            { name: "required", type: "boolean", description: "Звёздочка рядом с подписью." },
            {
              name: "children",
              type: "(props) => ReactNode",
              required: true,
              description: "Само поле. Получает id и aria-атрибуты.",
            },
          ]}
        />
      </Section>

      <Section title="Поля отдельно" id="inputs">
        <p>
          <code>Input</code>, <code>Textarea</code> и <code>Select</code> — тонкие
          обёртки над нативными элементами с общим оформлением и кольцом фокуса.
          Работают и без <code>Field</code>:
        </p>
        <CodeBlock
          code={`<Input placeholder="Поиск…" />
<Textarea rows={4} />
<Select defaultValue="MANAGER">
  <option value="ADMIN">Администратор</option>
  <option value="MANAGER">Менеджер</option>
</Select>`}
        />
        <p>
          Все трое пробрасывают <code>ref</code> и принимают любые нативные атрибуты.
          Невалидное состояние оформляется по <code>aria-invalid</code>, а не по
          отдельному пропу — так стиль следует за доступностью, а не живёт рядом с ней.
        </p>
      </Section>
    </>
  );
}
