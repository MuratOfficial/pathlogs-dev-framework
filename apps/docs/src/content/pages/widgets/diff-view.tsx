import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { DiffViewDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "words", title: "Дифф по словам" },
  { id: "logic", title: "Алгоритм отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Дифф двух текстов: построчно и в две колонки, с внутристрочной подсветкой
        по словам. Изменения собираются в куски с контекстом, а не показываются
        на фоне всего файла.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add diff-view" />
      </Section>

      <Section title="Пример" id="example">
        <Example plain code={`<DiffView before={before} after={after} mode="unified" filename="greet.ts" />`}>
          <DiffViewDemo />
        </Example>
        <p>Переключите «Две колонки» — изменённые строки встанут напротив друг друга.</p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "before / after", type: "string", required: true, description: "Исходный и изменённый текст." },
            { name: "mode", type: '"unified" | "split"', default: '"unified"', description: "Построчно или в две колонки." },
            { name: "inline", type: "boolean", default: "true", description: "Подсвечивать изменения внутри строки по словам." },
            { name: "collapse", type: "boolean", default: "true", description: "Сворачивать неизменённое, оставляя контекст (unified)." },
            { name: "context", type: "number", default: "3", description: "Сколько строк контекста вокруг изменений." },
            { name: "filename", type: "string", description: "Заголовок над диффом." },
          ]}
        />
      </Section>

      <Section title="Дифф по словам" id="words">
        <Callout tone="why" title="По словам, а не по символам">
          Внутристрочный дифф режет строку на слова, пробелы и знаки. Посимвольный
          дифф на переименовании переменной даёт кашу из отдельных букв — а по
          словам видно ровно то, что изменилось. Токенизатор Unicode-осознанный:
          кириллица и любой не-латинский алфавит не рассыпаются на буквы.
        </Callout>
      </Section>

      <Section title="Алгоритм отдельно" id="logic">
        <CodeBlock
          code={`import {
  diffLines,   // построчный дифф (LCS с отсечением общих краёв)
  diffWords,   // внутристрочный дифф по словам
  buildHunks,  // сборка изменений в куски с контекстом
  pairRows,    // раскладка в две колонки
} from "@/components/ui/diff-view/diffModel";`}
        />
        <Callout tone="note" title="Защита от гигантских файлов">
          Полная матрица LCS считается до предела примерно в 2000×2000 строк.
          Дальше алгоритм честно отдаёт «блок заменён целиком»: заморозить вкладку
          на пол-гигабайта памяти было бы хуже, чем показать файл грубо.
        </Callout>
      </Section>
    </>
  );
}
