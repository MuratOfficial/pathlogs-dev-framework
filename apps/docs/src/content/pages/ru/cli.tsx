import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "why", title: "Почему копированием" },
  { id: "init", title: "init" },
  { id: "add", title: "add" },
  { id: "list", title: "list" },
  { id: "config", title: "pathlogs.json" },
  { id: "update", title: "Обновление" },
  { id: "own", title: "Свой виджет" },
];

export default function Page() {
  return (
    <>
      <p>
        Тяжёлые виджеты не ставятся пакетом — они копируются в код проекта одной
        командой и дальше живут как обычные ваши файлы.
      </p>

      <Section title="Почему копированием" id="why">
        <p>
          Доска и диаграмма почти всегда требуют правок под конкретный домен:
          другое тело карточки, другие права, другой набор действий. Компонент,
          который нельзя открыть и поправить, обрастает пропсами —{" "}
          <code>renderCardHeader</code>, <code>hideAssignees</code>,{" "}
          <code>cardClassName</code> — и через полгода его API больше него самого.
        </p>
        <Callout tone="why" title="Где проходит граница">
          В пакетах — то, у чего API стабилен и правки редки: токены, хуки, диалоги.
          В реестре — то, что каждый проект переписывает под себя. Если компонент
          хочется «чуть-чуть подправить» чаще раза в квартал, ему место в реестре.
        </Callout>
      </Section>

      <Section title="init" id="init">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui init" />
        <p>Команда создаёт настройки, каталог для виджетов и дописывает импорты стилей:</p>
        <CodeBlock
          lang="bash"
          code={`Настройка PathLogs UI

  каталог виджетов  src/components/ui
  алиас импорта     @/components/ui
  файл стилей       src/app/globals.css
  Tailwind          да

  + pathlogs.json
  + src/components/ui/
  ~ src/app/globals.css (добавлены импорты стилей)`}
        />
        <p>
          Импорты вставляются <strong>после</strong> <code>@import &quot;tailwindcss&quot;</code>,
          если он есть: порядок в CSS значим. Повторный запуск ничего не дублирует.
          Если файла стилей нет, команда не выдумывает чужую структуру, а просто
          показывает, что вставить.
        </p>
      </Section>

      <Section title="add" id="add">
        <CodeBlock
          lang="bash"
          code={`npx @toimetdev/pathlogs-ui add kanban
npx @toimetdev/pathlogs-ui add gantt filter-bar
npx @toimetdev/pathlogs-ui add kanban --dry-run`}
        />
        <p>
          Файлы копируются в каталог из настроек, а импорты между ними переписываются
          под ваш алиас:
        </p>
        <CodeBlock
          code={`// в реестре
import { columnItems } from "./kanbanOrder";

// у вас в проекте
import { columnItems } from "@/components/ui/kanban/kanbanOrder";`}
        />
        <Callout tone="note" title="Существующие файлы не перезаписываются">
          Виджеты копируются в проект именно затем, чтобы их правили. Молча затереть
          чужую правку — худшее, что может сделать такая команда, поэтому она
          пропускает уже существующие файлы и говорит об этом. Перезаписать
          намеренно: <code>--force</code>.
        </Callout>
        <p>
          В конце команда печатает, какие пакеты нужны виджету — их список зашит
          в его метаданных, а не угадывается.
        </p>
      </Section>

      <Section title="list" id="list">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui list" />
        <p>Показывает, что вообще есть в реестре, с описанием каждого виджета.</p>
      </Section>

      <Section title="pathlogs.json" id="config">
        <CodeBlock
          lang="json"
          title="pathlogs.json"
          code={`{
  "componentsDir": "src/components/ui",
  "alias": "@/components/ui",
  "css": "src/app/globals.css",
  "tailwind": true
}`}
        />
        <PropsTable
          rows={[
            {
              name: "componentsDir",
              type: "string",
              default: '"src/components/ui"',
              description: "Куда класть виджеты, относительно корня проекта.",
            },
            {
              name: "alias",
              type: "string",
              default: '"@/components/ui"',
              description:
                "Алиас, которым виджеты импортируют друг друга. Пустая строка — оставить относительные пути.",
            },
            {
              name: "css",
              type: "string",
              default: '"src/app/globals.css"',
              description: "Файл, в который init дописывает импорты стилей.",
            },
            {
              name: "tailwind",
              type: "boolean",
              default: "true",
              description:
                "Есть ли в проекте Tailwind. Если нет, add предупредит, что виджеты приедут без стилей.",
            },
          ]}
        />
        <p>
          Значения можно задать сразу при настройке:{" "}
          <code>init --dir src/ui --alias @/ui --no-tailwind</code>.
        </p>
      </Section>

      <Section title="Обновление" id="update">
        <p>
          Обновлений «на месте» у виджетов нет, и это осознанно: файл в вашем проекте
          уже может отличаться от исходного, а автоматическое слияние чужих правок —
          источник тихих поломок.
        </p>
        <p>Если хочется подтянуть свежую версию:</p>
        <CodeBlock
          lang="bash"
          code={`# посмотреть, что изменится
npx @toimetdev/pathlogs-ui add kanban --dry-run

# перезаписать и разобрать конфликты в git
npx @toimetdev/pathlogs-ui add kanban --force
git diff`}
        />
        <p>
          Поэтому виджеты стоит коммитить сразу после копирования — тогда{" "}
          <code>git diff</code> покажет ровно ваши правки поверх исходника.
        </p>
      </Section>

      <Section title="Свой виджет" id="own">
        <p>Реестр — это каталог с файлами и описанием. Добавить свой:</p>
        <CodeBlock
          lang="json"
          title="registry/widgets/my-widget/meta.json"
          code={`{
  "name": "my-widget",
  "title": "Мой виджет",
  "description": "Что делает и чем полезен",
  "type": "widget",
  "dependencies": ["@xyflow/react"],
  "registryDependencies": ["filter-bar"],
  "packageDependencies": ["@toimetdev/pathlogs-core"],
  "tailwind": true,
  "files": [
    { "path": "MyWidget.tsx", "target": "my-widget/MyWidget.tsx" }
  ]
}`}
        />
        <ul>
          <li>
            <code>dependencies</code> — сторонние npm-пакеты;
          </li>
          <li>
            <code>registryDependencies</code> — другие виджеты реестра, они установятся
            первыми;
          </li>
          <li>
            <code>packageDependencies</code> — пакеты самого фреймворка.
          </li>
        </ul>
        <p>
          CLI раскрывает зависимости в порядке установки и печатает единую команду{" "}
          <code>npm install</code> для всего, чего не хватает.
        </p>
      </Section>
    </>
  );
}
