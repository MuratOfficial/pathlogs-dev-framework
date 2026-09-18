import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DismissDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "options", title: "Параметры" },
  { id: "blocked", title: "Диалог поверх меню" },
];

export default function Page() {
  return (
    <>
      <p>
        Закрытие всплывающего слоя по клику мимо и по Escape. Небольшой хук,
        но с одной оговоркой, ради которой он и существует.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { useRef, useState } from "react";
import { useDismiss } from "@toimetdev/pathlogs-hooks";

function Popover() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useDismiss(box, { enabled: open, onDismiss: () => setOpen(false) });

  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((v) => !v)}>Открыть</button>
      {open && <div className="absolute">…</div>}
    </div>
  );
}`}
        >
          <DismissDemo />
        </Example>
        <Callout tone="why" title="Почему mousedown, а не click">
          Клик по кнопке снаружи успевал бы отработать до закрытия — и открыл бы
          слой заново, отчего он казался бы «незакрывающимся».
        </Callout>
      </Section>

      <Section title="Параметры" id="options">
        <PropsTable
          rows={[
            {
              name: "enabled",
              type: "boolean",
              required: true,
              description: "Пока false, слушатели не вешаются вовсе.",
            },
            {
              name: "onDismiss",
              type: "() => void",
              required: true,
              description: "Что сделать. Читается в момент события.",
            },
            {
              name: "escape",
              type: "boolean",
              default: "true",
              description: "Закрывать по Escape.",
            },
            {
              name: "outsideClick",
              type: "boolean",
              default: "true",
              description: "Закрывать по клику мимо.",
            },
            {
              name: "blockedBy",
              type: "string",
              default: '"[data-pl-overlay]"',
              description: (
                <>
                  Селектор «поверх меня открыто что-то ещё». Пока такой элемент есть
                  в документе, закрытие пропускается.
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section title="Диалог поверх меню" id="blocked">
        <p>
          Вот ради чего нужен <code>blockedBy</code>. Типичная разметка: триггер
          диалога лежит <em>внутри</em> выпадающего меню, а сам диалог рендерится
          порталом в <code>body</code>.
        </p>
        <CodeBlock
          code={`<Menu>
  <MenuItem onClick={() => setConfirmOpen(true)}>Удалить проект</MenuItem>
  <ConfirmDialog open={confirmOpen} … />   {/* портал в body */}
</Menu>`}
        />
        <p>
          Клик по пункту меню открывает диалог. Если бы меню закрылось от этого же
          клика, оно размонтировало бы триггер — а вместе с ним и диалог, который
          в нём объявлен. Окно не успело бы появиться: пользователь увидел бы,
          что «кнопка не работает».
        </p>
        <Callout tone="note" title="Как это устроено">
          <code>Dialog</code> ставит на своё затемнение атрибут{" "}
          <code>data-pl-overlay</code>. Пока такой элемент есть в документе,{" "}
          <code>useDismiss</code> пропускает и клик, и Escape: они адресованы окну,
          которое и так перекрывает меню собой.
        </Callout>
        <p>
          Если у вас свои модальные окна, укажите их селектор:{" "}
          <code>{'blockedBy: ".my-modal-backdrop"'}</code>. Пустая строка отключает
          проверку.
        </p>
      </Section>
    </>
  );
}
