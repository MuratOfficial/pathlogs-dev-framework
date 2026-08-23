import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DragScrollAxisDemo, DragScrollDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "options", title: "Настройки" },
  { id: "axis", title: "Обе оси" },
  { id: "how", title: "Как это работает" },
  { id: "styles", title: "Стили" },
  { id: "math", title: "Математика отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Зажали ленту, потянули — она едет за курсором и по инерции доезжает после
        отпускания. Как панорамирование в графе, только для обычного контейнера
        с прокруткой.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { useDragScroll } from "@toimetdev/pathlogs-hooks";

function Board() {
  const ref = useDragScroll<HTMLDivElement>({ axis: "x", keyboard: true });

  return (
    <div ref={ref} className="flex gap-3 overflow-x-auto">
      {columns.map((c) => <Column key={c.id} {...c} />)}
    </div>
  );
}`}
        >
          <DragScrollDemo />
        </Example>
        <p>
          Хук возвращает ref-колбэк — его достаточно повесить на контейнер. Классы
          прокрутки (<code>overflow-x-auto</code> и прочее) задаёте вы: хук отвечает
          за поведение, а не за раскладку.
        </p>
      </Section>

      <Section title="Настройки" id="options">
        <PropsTable
          rows={[
            {
              name: "axis",
              type: '"x" | "y" | "both"',
              default: '"x"',
              description:
                "Ось прокрутки. Клавиши поперёк оси не перехватываются — их ждёт страница.",
            },
            {
              name: "momentum",
              type: "boolean",
              default: "true",
              description: (
                <>
                  Инерция после броска. Автоматически выключается при{" "}
                  <code>prefers-reduced-motion</code>.
                </>
              ),
            },
            {
              name: "keyboard",
              type: "boolean",
              default: "false",
              description:
                "Лента встаёт в порядок табуляции и слушает стрелки, Page и Home/End — но только когда фокус на ней самой, а не на элементе внутри.",
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Временно выключить протяжку, не снимая хук.",
            },
          ]}
        />
        <Callout tone="note" title="Настройки читаются в момент события">
          Менять <code>axis</code> или <code>enabled</code> можно на лету: хук читает
          их при каждом событии, а не при привязке, поэтому переподписки слушателей
          не происходит и ref-колбэк остаётся стабильным.
        </Callout>
      </Section>

      <Section title="Обе оси" id="axis">
        <p>
          С <code>axis: &quot;both&quot;</code> полотно тянется в любую сторону —
          так листается диаграмма Ганта:
        </p>
        <Example
          code={`const ref = useDragScroll<HTMLDivElement>({ axis: "both", momentum: false });

<div ref={ref} className="h-56 overflow-auto">
  <div className="w-[48rem]">…</div>
</div>`}
        >
          <DragScrollAxisDemo />
        </Example>
      </Section>

      <Section title="Как это работает" id="how">
        <p>
          Здесь много неочевидного, и почти каждое решение — ответ на конкретную
          поломку:
        </p>
        <ul>
          <li>
            <strong>Клик не ломается.</strong> Протяжка включается только после порога
            сдвига в 5 px, а «пойманный» ею клик гасится на фазе захвата. Без этого
            дрожание руки при клике по карточке открывало бы её вместо прокрутки —
            или наоборот.
          </li>
          <li>
            <strong>Нативный drag&amp;drop важнее.</strong> На <code>dragstart</code>{" "}
            протяжка отменяется, а лента у края начинает крутиться сама. Иначе
            карточку было бы нечем донести до колонки за пределами экрана:
            во время переноса указатель принадлежит браузеру.
          </li>
          <li>
            <strong>Тач не трогаем.</strong> Там прокрутка пальцем и так родная,
            и перехват только испортил бы её.
          </li>
          <li>
            <strong>Курсор и края — по факту.</strong> «Рука» и растворение краёв
            появляются, только когда ленте действительно есть куда ехать.
          </li>
          <li>
            <strong>Инерция гаснет о край.</strong> Упёрлись — скорость обнуляется,
            лента не «дрожит» у границы. Долгий кадр (вкладка была в фоне)
            не телепортирует ленту: шаг ограничен 50 мс.
          </li>
        </ul>
        <Callout tone="why" title="Почему бросок гаснет, если «довёл и подержал»">
          Скорость считается за окно в 90 мс перед <em>отпусканием</em>, а не перед
          последней точкой трека. Поэтому пауза в конце жеста попадает в знаменатель:
          подержали — инерции нет, и лента остаётся ровно там, куда её привели.
        </Callout>
      </Section>

      <Section title="Стили" id="styles">
        <p>
          Визуальная часть живёт в <code>@toimetdev/pathlogs-tokens/styles/scroll.css</code>{" "}
          и цепляется за data-атрибуты, которые ставит хук:
        </p>
        <CodeBlock
          lang="html"
          code={`<div data-pl-drag-scroll="true"      <!-- есть куда прокручивать: курсор «рука» -->
     data-pl-scroll-edge="both"     <!-- контент спрятан слева и справа -->
     data-pl-scroll-edge-y="end"    <!-- и снизу -->
     data-pl-scroll-keys="true">    <!-- слушает клавиши -->`}
        />
        <Callout tone="why" title="Почему края растворяются маской, а не градиентом-накладкой">
          Накладке нужен лишний элемент-обёртка и знание того, что лежит под лентой:
          цветные колонки, картинка, другая тема. Маска работает по самому элементу
          и не зависит ни от фона, ни от темы. Слои по X и Y пересекаются, поэтому
          один контейнер растворяет и бока, и верх с низом одновременно.
        </Callout>
      </Section>

      <Section title="Математика отдельно" id="math">
        <p>
          Вся арифметика вынесена из хука и не знает про DOM — поэтому она покрыта
          тестами, а не проверяется руками:
        </p>
        <CodeBlock
          code={`import {
  isDragIntent,     // сдвиг превысил порог — это протяжка, а не клик
  flingVelocity,    // скорость броска по треку указателя
  decayVelocity,    // затухание инерции за кадр
  edgeScrollSpeed,  // скорость автопрокрутки у края при drag&drop
  hiddenEdges,      // какой край «продолжается» за экран
  keyboardScroll,   // что сделать по нажатой клавише
} from "@toimetdev/pathlogs-hooks";`}
        />
        <p>
          Там же лежит <code>attachDragScroll(el, getOptions)</code> — привязка
          к элементу без React, если поведение нужно вне React-дерева.
        </p>
      </Section>
    </>
  );
}
