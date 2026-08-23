import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { ButtonDemo, ButtonSizesDemo } from "@/demos/basics";

export const toc = [
  { id: "variants", title: "Варианты" },
  { id: "sizes", title: "Размеры" },
  { id: "loading", title: "Загрузка" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Кнопка с вариантами оформления, размерами, иконкой и состоянием загрузки.
        Всё остальное — обычные атрибуты <code>&lt;button&gt;</code>.
      </p>

      <Section title="Варианты" id="variants">
        <Example
          code={`import { Button } from "@toimetdev/pathlogs-core";

<Button variant="primary">Основная</Button>
<Button variant="secondary">Вторичная</Button>
<Button variant="ghost">Призрачная</Button>
<Button variant="danger">Удалить</Button>
<Button variant="gradient">Градиент</Button>`}
        >
          <ButtonDemo />
        </Example>
        <Callout tone="note" title="type=&quot;button&quot; по умолчанию">
          Кнопка внутри формы, которая неожиданно её отправляет, — источник самых
          обидных багов. Осознанный <code>type=&quot;submit&quot;</code> всегда можно
          указать явно.
        </Callout>
      </Section>

      <Section title="Размеры" id="sizes">
        <Example
          code={`<Button size="sm">Маленькая</Button>
<Button size="md">Средняя</Button>
<Button size="lg">Большая</Button>`}
        >
          <ButtonSizesDemo />
        </Example>
      </Section>

      <Section title="Загрузка" id="loading">
        <p>
          <code>loading</code> показывает крутилку, блокирует кнопку и проставляет{" "}
          <code>aria-busy</code>. Подпись при этом лучше менять на глагол
          несовершенного вида — «Сохраняем» вместо «Сохранить»:
        </p>
        <Example
          code={`<Button variant="primary" loading={pending}>
  {pending ? "Сохраняем" : "Сохранить"}
</Button>`}
        >
          <ButtonDemo />
        </Example>
        <p>
          Крутилка наследует цвет текста, поэтому одинаково читается на всех
          вариантах — своего цвета ей не нужно.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "variant",
              type: '"primary" | "secondary" | "ghost" | "danger" | "gradient"',
              default: '"secondary"',
              description: "Оформление.",
            },
            { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Размер." },
            {
              name: "loading",
              type: "boolean",
              default: "false",
              description: "Крутилка вместо иконки, кнопка заблокирована.",
            },
            { name: "icon", type: "ReactNode", description: "Иконка слева от подписи." },
            { name: "block", type: "boolean", default: "false", description: "Занять всю ширину контейнера." },
            {
              name: "…",
              type: "ButtonHTMLAttributes",
              description: "Всё остальное уходит на <button>: onClick, disabled, form, aria-*.",
            },
          ]}
        />
        <p>
          Компонент пробрасывает <code>ref</code> — его можно сфокусировать
          программно или передать в свою логику позиционирования.
        </p>
      </Section>
    </>
  );
}
