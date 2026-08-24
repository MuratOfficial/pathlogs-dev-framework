import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { QueryInputDemo } from "@/demos/inputs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "syntax", title: "Синтаксис" },
  { id: "props", title: "Пропсы" },
  { id: "logic", title: "Разбор отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Структурный поиск: <code>is:open author:me due:&lt;now+7d</code>. То же,
        что <a href="/docs/widgets/filter-bar">FilterBar</a> даёт кликам по полям,
        здесь даётся набором с клавиатуры — и на той же модели условий. Условия
        рисуются чипами, ключи и значения дополняются по каретке.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`<QueryInput
  value={query}
  onChange={setQuery}
  fields={fields}
  onParsed={(parsed) => setResults(tasks.filter((t) => matchesQuery(t, parsed, fields)))}
/>`}
        >
          <QueryInputDemo />
        </Example>
      </Section>

      <Section title="Синтаксис" id="syntax">
        <CodeBlock
          lang="text"
          code={`status:open           поле равно значению
label:bug,ui          любое из значений (ИЛИ внутри условия)
label:bug label:ui    оба значения (И между условиями)
-status:done          отрицание
priority:>=3          сравнение чисел
due:<now+7d           сравнение дат в синтаксисе TimeRangePicker
падает                свободное слово — по тексту`}
        />
        <Callout tone="why" title="Неизвестный ключ не совпадает ни с чем">
          Опечатка в <code>assigne:me</code> не превращается тихо в «вообще без
          фильтра» — такое условие не проходит ни один элемент, а поле подсвечивает
          незнакомый ключ. Показать полный список так, будто фильтр применён, —
          хуже, чем показать пустой.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "value", type: "string", required: true, description: "Строка запроса." },
            { name: "onChange", type: "(value: string) => void", required: true, description: "Изменение строки." },
            { name: "fields", type: "QueryField<T>[]", required: true, description: "Поля поиска: ключ, тип, варианты значений, доступ к значению элемента." },
            { name: "onParsed", type: "(parsed) => void", description: "Разобранный запрос — обычно для немедленной фильтрации." },
            { name: "onSubmit", type: "(value: string) => void", description: "Enter вне подсказок." },
            { name: "placeholder", type: "string", description: "Подсказка в пустом поле." },
          ]}
        />
      </Section>

      <Section title="Разбор отдельно" id="logic">
        <CodeBlock
          code={`import {
  parseQuery,     // строка → условия + свободный текст
  matchesQuery,   // проверка элемента на соответствие
  suggestAt,      // что подсказать при данной позиции каретки
  stringifyQuery, // условия → строка (для ссылок и пресетов)
} from "@toimetdev/pathlogs-core";`}
        />
        <p>
          Значения дат сравниваются тем же разбором, что и в{" "}
          <a href="/docs/components/time-range">TimeRangePicker</a>: <code>due:&lt;now+7d</code> работает
          из коробки.
        </p>
      </Section>
    </>
  );
}
