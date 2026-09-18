import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "options", title: "Параметры" },
  { id: "rules", title: "Правила подсветки" },
];

export default function Page() {
  return (
    <>
      <p>
        Подсветка активного раздела при прокрутке — и плавный переход к нему
        по клику. Оглавление справа на этой странице работает на нём же.
      </p>

      <Section title="Пример" id="example">
        <CodeBlock
          code={`import { useActiveSection } from "@toimetdev/pathlogs-hooks";

function Toc({ entries }) {
  const { active, scrollTo } = useActiveSection(
    entries.map((e) => e.id),
    { offset: 80 }        // высота липкой шапки
  );

  return (
    <ul>
      {entries.map((e) => (
        <li key={e.id}>
          <button
            onClick={() => scrollTo(e.id)}
            aria-current={active === e.id ? "true" : undefined}
          >
            {e.title}
          </button>
        </li>
      ))}
    </ul>
  );
}`}
        />
        <p>
          Разделы находятся по <code>document.getElementById</code>, так что на самой
          странице достаточно проставить <code>id</code> заголовкам.
        </p>
      </Section>

      <Section title="Параметры" id="options">
        <PropsTable
          rows={[
            {
              name: "ids",
              type: "string[]",
              required: true,
              description: "Идентификаторы разделов в порядке их следования на странице.",
            },
            {
              name: "offset",
              type: "number | (() => number)",
              default: "0",
              description: (
                <>
                  Отступ сверху, ниже которого раздел считается «доскроллили» — обычно
                  высота липкой панели. Функцией, если высота зависит от ширины экрана.
                </>
              ),
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Выключить слежение.",
            },
          ]}
        />
        <p>
          Возвращает <code>{"{ active, scrollTo }"}</code>. Плавность прокрутки
          отключается при <code>prefers-reduced-motion</code>.
        </p>
        <Callout tone="note" title="Отступ лучше передавать функцией">
          Липкая панель на узком экране прижимается под шапку, а на широком — к верху
          окна. Жёсткое число промахнётся в одном из случаев; функция вычислит
          отступ в момент проверки.
        </Callout>
      </Section>

      <Section title="Правила подсветки" id="rules">
        <p>
          Активен последний раздел, чья верхняя граница уже прошла линию отступа.
          Два исключения:
        </p>
        <ul>
          <li>
            <strong>Пока не доскроллили ни до одного</strong> — активен первый.
            Иначе в начале страницы не подсвечивалось бы ничего.
          </li>
          <li>
            <strong>У самого низа страницы</strong> — активен последний. Короткие
            разделы в конце физически не могут подняться к линии, и без этого
            правила они никогда бы не подсветились.
          </li>
        </ul>
        <Callout tone="why" title="Почему пересчёт привязан к кадру">
          Событие прокрутки приходит чаще, чем браузер рисует кадры. Считать позиции
          на каждое — впустую дёргать layout десятки раз в секунду. Поэтому пересчёт
          откладывается до <code>requestAnimationFrame</code>.
        </Callout>
        <p>
          Сама арифметика вынесена в <code>activeSectionId(positions, line, atBottom)</code> —
          чистую функцию без DOM, покрытую тестами.
        </p>
      </Section>
    </>
  );
}
