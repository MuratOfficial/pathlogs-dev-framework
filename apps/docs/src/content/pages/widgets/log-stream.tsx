import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { LogStreamDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "virtual", title: "Виртуализация" },
  { id: "logic", title: "Разбор отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Поток логов: ANSI-цвета, фильтр по уровню и подстроке, подсветка
        совпадений и прилипание к концу. Фреймворк называется pathlogs — а вывода
        логов в нём не было.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add log-stream" />
      </Section>

      <Section title="Пример" id="example">
        <Example plain code={`<LogStream lines={lines} follow height={320} />`}>
          <LogStreamDemo />
        </Example>
        <p>
          Пощёлкайте уровни в панели — фильтр складывается из выбранных. Поиск
          подсвечивает совпадения прямо в строках.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "lines", type: "LogLine[]", required: true, description: "Строки: seq, text, level?, at?, source?." },
            { name: "follow", type: "boolean", default: "true", description: "Прилипать к концу при новых строках." },
            { name: "toolbar", type: "boolean", default: "true", description: "Панель поиска и уровней." },
            { name: "lineNumbers", type: "boolean", default: "true", description: "Номера строк слева." },
            { name: "wrap", type: "boolean", default: "false", description: "Переносить длинные строки вместо горизонтальной прокрутки." },
            { name: "onSelectLine", type: "(line) => void", description: "Клик по строке." },
            { name: "height", type: "number | string", default: "420", description: "Высота области прокрутки." },
          ]}
        />
      </Section>

      <Section title="Виртуализация" id="virtual">
        <Callout tone="why" title="Уровень определяется один раз на строку">
          Строки виртуализированы через <a href="/docs/components/virtual-list">useVirtual</a>:
          CI-лог на десятки тысяч строк рисуется только видимой частью. Уровень
          строки распознаётся при добавлении в буфер, а не при отрисовке — иначе
          разбор текста повторялся бы на каждом кадре прокрутки.
        </Callout>
      </Section>

      <Section title="Разбор отдельно" id="logic">
        <CodeBlock
          code={`import { parseAnsi, stripAnsi } from "@/components/ui/log-stream/ansi";
import {
  appendLines,   // дописать в буфер, вытесняя старое сверх предела
  filterLines,   // отбор по уровню, источнику и подстроке
  matchRanges,   // отрезки совпадений для подсветки
} from "@/components/ui/log-stream/logBuffer";`}
        />
      </Section>
    </>
  );
}
