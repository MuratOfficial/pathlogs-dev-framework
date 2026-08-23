import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { ConfirmDialogDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "tone", title: "Тон" },
  { id: "wrapper", title: "Своя обёртка" },
];

export default function Page() {
  return (
    <>
      <p>
        Подтверждение действия вместо <code>window.confirm</code>: то же назначение,
        но в стиле приложения, с состоянием «выполняется» и без блокировки потока.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { ConfirmDialog } from "@toimetdev/pathlogs-core";

const [open, setOpen] = useState(false);
const [pending, startTransition] = useTransition();

<ConfirmDialog
  open={open}
  pending={pending}
  title="Удалить колонку?"
  message="Карточки переедут в первую оставшуюся колонку."
  confirmLabel="Удалить"
  cancelLabel="Отмена"
  pendingLabel="Удаляем…"
  onConfirm={() => startTransition(() => deleteColumn(id))}
  onCancel={() => setOpen(false)}
/>`}
        >
          <ConfirmDialogDemo />
        </Example>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "open", type: "boolean", required: true, description: "Показано ли окно." },
            { name: "title", type: "string", required: true, description: "Вопрос — коротко и по делу." },
            {
              name: "message",
              type: "string",
              description: "Последствия действия: что именно произойдёт и что нельзя будет отменить.",
            },
            {
              name: "onConfirm",
              type: "() => void",
              required: true,
              description: "Подтверждение. Окно само не закрывается — закройте его, когда действие завершится.",
            },
            { name: "onCancel", type: "() => void", required: true, description: "Отказ." },
            {
              name: "pending",
              type: "boolean",
              default: "false",
              description: "Действие выполняется: кнопки заблокированы, окно не закрыть.",
            },
            {
              name: "tone",
              type: '"danger" | "accent"',
              default: '"danger"',
              description: "Разрушающее действие или обычный вопрос.",
            },
            { name: "confirmLabel", type: "string", default: '"Confirm"', description: "Подпись кнопки подтверждения." },
            { name: "cancelLabel", type: "string", default: '"Cancel"', description: "Подпись кнопки отказа." },
            { name: "pendingLabel", type: "string", default: '"Working…"', description: "Подпись во время выполнения." },
          ]}
        />
      </Section>

      <Section title="Тон" id="tone">
        <p>
          <code>danger</code> — восклицательный знак в треугольнике и красная кнопка:
          для удаления и всего необратимого. <code>accent</code> — вопросительный
          знак в круге: для обычных «вы уверены?».
        </p>
        <Callout tone="why" title="Почему окно не закрывается само">
          Действие почти всегда асинхронное. Закройся окно сразу — пользователь
          увидел бы список, в котором элемент ещё на месте, и нажал бы «удалить»
          второй раз. Поэтому окно живёт до тех пор, пока вызывающий код не решит,
          что всё готово.
        </Callout>
      </Section>

      <Section title="Своя обёртка" id="wrapper">
        <p>
          Подписи по умолчанию английские. Чтобы не повторять русские в каждом
          вызове, заведите в приложении тонкую обёртку:
        </p>
        <CodeBlock
          title="src/components/Confirm.tsx"
          code={`import { ConfirmDialog, type ConfirmDialogProps } from "@toimetdev/pathlogs-core";

export function Confirm(props: ConfirmDialogProps) {
  return (
    <ConfirmDialog
      confirmLabel="Подтвердить"
      cancelLabel="Отмена"
      pendingLabel="Выполняем…"
      {...props}
    />
  );
}`}
        />
        <p>
          Фреймворк на такие обёртки не претендует: набор подписей зависит от тона
          продукта, а не от компонента.
        </p>
      </Section>
    </>
  );
}
