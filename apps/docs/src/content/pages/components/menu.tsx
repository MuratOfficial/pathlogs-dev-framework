import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { MenuDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "dialogs", title: "Диалоги внутри меню" },
  { id: "trigger", title: "Своя кнопка" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Складка для второстепенных действий: кнопка «Ещё» и выпадающая панель.
        Внутрь кладут готовые кнопки как есть — им не нужно ничего знать про меню.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { Menu, MenuItem } from "@toimetdev/pathlogs-core";

<Menu label="Ещё" count={3} tip="Остальные действия">
  <MenuItem onClick={exportExcel}>Экспортировать в Excel</MenuItem>
  <MenuItem href="/projects/1/templates">Шаблоны задач</MenuItem>
  <MenuItem tone="danger" onClick={archive}>Архивировать проект</MenuItem>
</Menu>`}
        >
          <MenuDemo />
        </Example>
        <p>
          Пункт с <code>href</code> рендерится ссылкой, а не кнопкой, — чтобы работали
          Ctrl+клик и открытие в новой вкладке.
        </p>
      </Section>

      <Section title="Диалоги внутри меню" id="dialogs">
        <p>
          Самый частый сценарий: пункт меню открывает модальное окно. Наивная
          реализация здесь ломается.
        </p>
        <CodeBlock
          code={`<Menu>
  <MenuItem onClick={() => setOpen(true)}>Удалить проект</MenuItem>
  <ConfirmDialog open={open} onConfirm={remove} onCancel={() => setOpen(false)} />
</Menu>`}
        />
        <Callout tone="why" title="Почему меню не закрывается, пока открыт диалог">
          Диалог объявлен внутри панели меню. Закройся меню от клика — панель
          размонтируется, а вместе с ней уйдёт и диалог, не успев появиться:
          со стороны это выглядит как «кнопка не работает».
          <br />
          <br />
          Поэтому <code>useDismiss</code> пропускает закрытие, пока в документе есть{" "}
          <code>[data-pl-overlay]</code> — метка открытого модального окна. Оно
          и так перекрывает меню собой, так что видимой разницы нет.
        </Callout>
      </Section>

      <Section title="Своя кнопка" id="trigger">
        <p>
          Стандартная кнопка — три точки с подписью. Если нужна другая, передайте{" "}
          <code>trigger</code>: он получает состояние открытости и переключатель.
        </p>
        <CodeBlock
          code={`<Menu
  trigger={({ open, toggle }) => (
    <Button variant={open ? "primary" : "secondary"} onClick={toggle}>
      Действия {open ? "▲" : "▼"}
    </Button>
  )}
>
  <MenuItem onClick={…}>…</MenuItem>
</Menu>`}
        />
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "children", type: "ReactNode", required: true, description: "Содержимое панели." },
            {
              name: "label",
              type: "string",
              default: '"More"',
              description: "Подпись кнопки. На узком экране скрывается, остаётся иконка.",
            },
            {
              name: "trigger",
              type: "(props: { open, toggle }) => ReactNode",
              description: "Своя кнопка вместо стандартной.",
            },
            { name: "count", type: "number", description: "Сколько действий спрятано — числом на кнопке." },
            {
              name: "align",
              type: '"start" | "end"',
              default: '"end"',
              description: "С какой стороны выпадает панель.",
            },
            { name: "tip", type: "string", description: "Подсказка на кнопке." },
          ]}
        />
        <p>
          <code>MenuItem</code> принимает <code>onClick</code> или <code>href</code>,{" "}
          <code>icon</code>, <code>tone</code> (<code>default</code> либо{" "}
          <code>danger</code>) и <code>disabled</code>.
        </p>
      </Section>
    </>
  );
}
