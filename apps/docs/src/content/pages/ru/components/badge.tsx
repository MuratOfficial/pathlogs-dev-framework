import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { BadgeDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "color", title: "Цвет от пользователя" },
  { id: "level", title: "Шкала уровня" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Метка-«пилюля» для типа, статуса и тега — и шкала уровня для порядковых
        величин вроде приоритета.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { Badge, LevelMeter } from "@toimetdev/pathlogs-core";

<Badge color="#6366f1">Фича</Badge>
<Badge color="#ef4444">Баг</Badge>
<Badge color="#eab308" solid>Плотный</Badge>
<Badge>Без цвета</Badge>

<LevelMeter level={3} color="#f97316" label="Приоритет: высокий" />`}
        >
          <BadgeDemo />
        </Example>
      </Section>

      <Section title="Цвет от пользователя" id="color">
        <p>
          Цвет метки задаёт человек, а не дизайн-система. Из одного значения
          выводятся и заливка, и текст:
        </p>
        <CodeBlock
          code={`// обычный вариант: заливка полупрозрачная, цвет идёт в текст
backgroundColor: alpha(color, 0.15)
color: color

// solid: заливка сплошная, цвет текста считается по контрасту
backgroundColor: color
color: readableTextOn(color)   // чёрный или белый — что читаемее`}
        />
        <Callout tone="why" title="Почему полупрозрачная заливка по умолчанию">
          Так одна и та же метка читается и в тёмной теме, и в светлой, не заводя
          двух палитр и не требуя от пользователя выбирать цвет дважды. Плотный
          вариант нужен там, где метка должна кричать, — и там цвет текста считается
          по яркости фона, потому что белым по жёлтому не читается ничего.
        </Callout>
      </Section>

      <Section title="Шкала уровня" id="level">
        <p>
          <code>LevelMeter</code> рисует возрастающие столбики, заполненные
          до текущего значения.
        </p>
        <Callout tone="why" title="Почему шкала, а не цветная точка">
          Точка передаёт только «какой», шкала — ещё и «насколько». И, что важнее,
          она не полагается на один лишь цвет: уровень виден по числу закрашенных
          столбиков, поэтому приоритет различим и при дальтонизме,
          и в чёрно-белой печати отчёта.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "children", type: "ReactNode", required: true, description: "Содержимое метки." },
            { name: "color", type: "string", description: "Цвет в #rrggbb. Без него метка нейтральная." },
            { name: "solid", type: "boolean", default: "false", description: "Плотный вариант: цвет заливкой." },
            { name: "size", type: '"sm" | "md"', default: '"sm"', description: "Размер." },
            { name: "tip", type: "string", description: "Подсказка при наведении." },
          ]}
        />
        <p>
          <code>LevelMeter</code>: <code>level</code> (с 1), <code>levels</code>{" "}
          (всего столбиков, по умолчанию 4), <code>color</code> и{" "}
          <code>label</code> — подпись идёт и в подсказку, и в{" "}
          <code>aria-label</code>.
        </p>
      </Section>
    </>
  );
}
