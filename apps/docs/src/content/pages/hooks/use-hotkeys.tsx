import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { HotkeysDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "syntax", title: "Запись клавиш" },
  { id: "options", title: "Параметры" },
  { id: "input", title: "Поля ввода" },
  { id: "help", title: "Справка" },
  { id: "matcher", title: "Матчер отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Глобальные горячие клавиши с поддержкой последовательностей: нажали «g»,
        затем «d» — перешли на дашборд.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { useHotkeys } from "@toimetdev/pathlogs-hooks";

useHotkeys([
  { keys: "g d", label: "Дашборд", handler: () => router.push("/dashboard") },
  { keys: "g m", label: "Мои задачи", handler: () => router.push("/my") },
  { keys: "d", label: "Отметить готовой", handler: markDone },
  { keys: "mod+k", label: "Поиск", allowInInput: true, handler: openPalette },
]);`}
        >
          <HotkeysDemo />
        </Example>
        <Callout tone="note" title="Массив можно писать литералом">
          Обработчики читаются в момент нажатия, а не привязки, поэтому свежее
          замыкание не требует стабильной ссылки — <code>useMemo</code> вокруг
          массива не нужен.
        </Callout>
      </Section>

      <Section title="Запись клавиш" id="syntax">
        <p>
          Аккорды разделяются пробелом, модификаторы внутри аккорда — плюсом:
        </p>
        <CodeBlock
          code={`"k"            // просто клавиша
"g d"          // последовательность: g, затем d
"mod+k"        // Ctrl на Windows/Linux, ⌘ на macOS
"mod+shift+p"  // несколько модификаторов
"?"            // shift подставляется сам
"escape"       // esc, up, down, left, right, enter, space, delete`}
        />
        <PropsTable
          rows={[
            {
              name: "mod",
              type: "модификатор",
              description:
                "Ctrl и ⌘ одной записью. Отдельно ctrl и cmd различать не нужно — приложению почти всегда важно «системный модификатор».",
            },
            {
              name: "shift",
              type: "модификатор",
              description: (
                <>
                  Требуется, только если написан явно. «?» набирается с shift
                  на большинстве раскладок, и требование <code>shift: false</code>{" "}
                  ломало бы такую запись.
                </>
              ),
            },
            {
              name: "alt",
              type: "модификатор",
              description: "Он же option на macOS.",
            },
          ]}
        />
        <Callout tone="warn" title="Опечатка в модификаторе роняет разбор">
          <code>parseHotkey(&quot;crtl+k&quot;)</code> бросает ошибку, а не создаёт
          мёртвую запись. Клавиша, которая молча не срабатывает, — самый неприятный
          вид поломки: её замечают спустя месяцы.
        </Callout>
      </Section>

      <Section title="Параметры" id="options">
        <PropsTable
          rows={[
            {
              name: "keys",
              type: "string",
              required: true,
              description: "Запись клавиш.",
            },
            {
              name: "handler",
              type: "(e: KeyboardEvent) => void",
              required: true,
              description: "Что сделать. preventDefault вызывается за вас.",
            },
            {
              name: "label",
              type: "string",
              description: (
                <>
                  Подпись для экрана справки. Записи без неё считаются служебными
                  и в справку не попадают.
                </>
              ),
            },
            {
              name: "group",
              type: "string",
              description: "Раздел в справке: «Навигация», «Доска».",
            },
            {
              name: "allowInInput",
              type: "boolean",
              default: "false",
              description: "Сработает и когда фокус в поле ввода. Для mod+k и escape.",
            },
            {
              name: "enabled",
              type: "boolean",
              default: "true",
              description: "Временно выключить запись, не убирая её из списка.",
            },
          ]}
        />
        <p>
          Второй аргумент хука — общие настройки: <code>enabled</code> выключает весь
          набор, <code>timeout</code> задаёт окно ожидания второй клавиши (по умолчанию
          1200 мс), <code>target</code> позволяет слушать не <code>window</code>,
          а конкретный элемент.
        </p>
      </Section>

      <Section title="Поля ввода" id="input">
        <p>
          Обычные клавиши в поле ввода принадлежат полю, а не приложению. Записи
          с <code>allowInInput</code> — исключение.
        </p>
        <Callout tone="why" title="Почему внутри два независимых матчера">
          Если бы состояние последовательностей было общим, набранная в поле «g»
          оставила бы приложение в ожидании второй клавиши. Следующая настоящая «d» —
          уже вне поля — сработала бы как переход на дашборд, хотя пользователь
          просто печатал слово «где». Поэтому набранное в поле идёт в отдельный
          матчер, который знает только про <code>allowInInput</code>.
        </Callout>
      </Section>

      <Section title="Справка" id="help">
        <p>
          Тот же массив отдаётся компоненту <code>HotkeysHelp</code> — он показывает
          экран справки по «?» и сам вызывает <code>useHotkeys</code>:
        </p>
        <CodeBlock
          code={`import { HotkeysHelp } from "@toimetdev/pathlogs-core";

const hotkeys = [
  { keys: "g d", label: "Дашборд", group: "Навигация", handler: goDashboard },
];

// useHotkeys вызывать отдельно не нужно — HotkeysHelp сделает это сам
<HotkeysHelp hotkeys={hotkeys} hint="«g» — лидер: нажмите g, затем вторую клавишу." />`}
        />
        <p>
          Один список на обработку и на справку — разъехаться им негде.
        </p>
      </Section>

      <Section title="Матчер отдельно" id="matcher">
        <p>Разбор и сопоставление не знают про DOM и покрыты тестами:</p>
        <CodeBlock
          code={`import {
  parseHotkey,        // "g d" → [{ key: "g" }, { key: "d" }]
  chordFromEvent,     // KeyboardEvent → аккорд
  chordMatches,       // совпадают ли аккорды
  createHotkeyMatcher // машина состояний для последовательностей
} from "@toimetdev/pathlogs-hooks";`}
        />
        <p>
          Матчер хранит не буфер нажатий, а индекс внутри незавершённой
          последовательности: буфер пришлось бы чистить по таймеру, а индекс
          достаточно сравнить со временем последнего нажатия. Поэтому «g»,
          нажатая минуту назад, не превращает случайную «d» в переход.
        </p>
      </Section>
    </>
  );
}
