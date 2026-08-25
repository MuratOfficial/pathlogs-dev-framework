import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DialogDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "a11y", title: "Фокус и клавиатура" },
  { id: "label", title: "Окно без заголовка" },
];

export default function Page() {
  return (
    <>
      <p>
        Модальное окно: портал в <code>body</code>, затемнение, ловушка фокуса,
        Escape и блокировка прокрутки страницы под ним.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { Dialog, Button, Field, Input } from "@toimetdev/pathlogs-core";

const [open, setOpen] = useState(false);

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Новый проект"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
      <Button variant="primary" onClick={submit}>Создать</Button>
    </>
  }
>
  <Field label="Название" required>
    {(props) => <Input {...props} />}
  </Field>
</Dialog>`}
        >
          <DialogDemo />
        </Example>
        <p>
          Состояние живёт снаружи. Так одно и то же окно обслуживает и создание,
          и редактирование, не заводя себе внутреннего режима.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "open", type: "boolean", required: true, description: "Показано ли окно." },
            {
              name: "onClose",
              type: "() => void",
              required: true,
              description: "Вызывается по Escape, клику по затемнению и крестику.",
            },
            { name: "title", type: "string", description: "Видимый заголовок окна." },
            {
              name: "header",
              type: "ReactNode",
              description: "Свой заголовок вместо строки title — например, с иконкой и счётчиком.",
            },
            {
              name: "label",
              type: "string",
              description:
                "Доступное имя, когда видимого заголовка нет: окно рисует его само, но скринридеру имя всё равно нужно.",
            },
            { name: "footer", type: "ReactNode", description: "Полоса действий внизу окна." },
            {
              name: "size",
              type: '"sm" | "md" | "lg" | "xl"',
              default: '"md"',
              description: "Предельная ширина: 24 / 32 / 42 / 56 rem.",
            },
            {
              name: "align",
              type: '"center" | "top"',
              default: '"center"',
              description: "Прижать окно к верху — так стоит командная палитра.",
            },
            {
              name: "busy",
              type: "boolean",
              default: "false",
              description: "Идёт сохранение: закрытие заблокировано, чтобы не потерять результат.",
            },
            {
              name: "dismissOnBackdrop",
              type: "boolean",
              default: "true",
              description: "Закрывать по клику на затемнение.",
            },
            {
              name: "dismissOnEscape",
              type: "boolean",
              default: "true",
              description: "Закрывать по Escape.",
            },
          ]}
        />
      </Section>

      <Section title="Фокус и клавиатура" id="a11y">
        <ul>
          <li>
            При открытии фокус уходит на первый интерактивный элемент, а если его
            нет — на саму панель. Без этого клавиатура осталась бы на странице
            под затемнением.
          </li>
          <li>
            Tab с последнего элемента возвращается на первый: за пределы окна фокус
            не уходит.
          </li>
          <li>
            При закрытии фокус возвращается туда, откуда окно открыли, — иначе после
            Escape клавиатура оказывалась бы в начале страницы.
          </li>
          <li>
            Прокрутка страницы под окном блокируется: колесо над затемнением иначе
            уезжает по контенту, и, закрыв окно, пользователь оказывается не там,
            где был.
          </li>
        </ul>
        <Callout tone="why" title="Атрибут data-pl-overlay на затемнении">
          Это метка «поверх всего открыто окно». По ней <code>useDismiss</code>{" "}
          не закрывает выпадающие меню: клик и Escape адресованы окну, а закрытие
          меню унесло бы с собой сам диалог, объявленный внутри него.
        </Callout>
      </Section>

      <Section title="Окно без заголовка" id="label">
        <p>
          Если окно рисует заголовок само (подтверждение, палитра), передайте{" "}
          <code>label</code> вместо <code>title</code>: шапка не появится,
          а доступное имя останется.
        </p>
        <CodeBlock
          code={`<Dialog open={open} onClose={close} label="Удалить проект?" size="sm">
  {/* собственная разметка с иконкой и заголовком */}
</Dialog>`}
        />
      </Section>
    </>
  );
}
