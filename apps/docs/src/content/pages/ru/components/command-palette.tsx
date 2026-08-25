import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "try", title: "Попробовать" },
  { id: "items", title: "Локальные пункты" },
  { id: "search", title: "Поиск на сервере" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Палитра команд по ⌘K: переход к разделам, поиск по данным и запуск действий
        одним полем ввода.
      </p>

      <Section title="Попробовать" id="try">
        <Callout tone="note" title="Она уже работает на этом сайте">
          Нажмите <kbd className="pl-kbd">⌘</kbd>
          <kbd className="pl-kbd">K</kbd> (или{" "}
          <kbd className="pl-kbd">Ctrl</kbd>
          <kbd className="pl-kbd">K</kbd>) — откроется поиск по документации.
          Это тот самый компонент, а не его копия: страницы сайта переданы
          в него как <code>items</code>.
        </Callout>
        <p>
          Стрелками список листается, Enter открывает, Escape закрывает. Наведение
          мышью двигает тот же курсор, что и клавиатура, — они не спорят за выбор.
        </p>
      </Section>

      <Section title="Локальные пункты" id="items">
        <p>
          Разделы приложения и команды не требуют запроса — они фильтруются на месте
          по заголовку и скрытым ключевым словам:
        </p>
        <CodeBlock
          code={`import { CommandPalette } from "@toimetdev/pathlogs-core";

<CommandPalette
  items={[
    { id: "dashboard", group: "Навигация", title: "Проекты", hint: "g d",
      onSelect: () => router.push("/dashboard") },
    { id: "new", group: "Действия", title: "Новая задача",
      keywords: "создать добавить task",
      onSelect: () => setNewTaskOpen(true) },
  ]}
  labels={{ placeholder: "Поиск проектов, задач, разделов…", empty: "Ничего не найдено" }}
/>`}
        />
        <p>
          Горячая клавиша по умолчанию — <code>mod+k</code>. Палитра вешает её сама;
          передайте <code>hotkey={"{null}"}</code>, если управляете открытием снаружи.
        </p>
      </Section>

      <Section title="Поиск на сервере" id="search">
        <p>
          Всё, чего нет на клиенте, отдаёт функция <code>search</code>. Она вызывается
          с задержкой после ввода — пока пользователь печатает, промежуточные
          подстроки никому не нужны:
        </p>
        <CodeBlock
          code={`<CommandPalette
  items={navItems}
  search={async (query) => {
    const { projects, tasks } = await searchAction(query);
    return [
      ...projects.map((p) => ({
        id: \`p:\${p.id}\`, group: "Проекты", title: p.name, badge: p.key,
        onSelect: () => router.push(\`/projects/\${p.id}\`),
      })),
      ...tasks.map((t) => ({
        id: \`t:\${t.id}\`, group: "Задачи", title: t.title,
        badge: \`\${t.projectKey}-\${t.number}\`,
        onSelect: () => router.push(\`/tasks/\${t.id}\`),
      })),
    ];
  }}
/>`}
        />
        <Callout tone="why" title="Почему источник данных снаружи">
          Палитре нечего знать о вашей базе. Так один компонент обслуживает
          и статичное меню команд, и полнотекстовый поиск, и подсказки из внешнего
          сервиса — а ошибка запроса просто оставляет локальные пункты на месте,
          вместо того чтобы ронять окно.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "items",
              type: "CommandItem[]",
              default: "[]",
              description: "Пункты, доступные без запроса. Фильтруются по title и keywords.",
            },
            {
              name: "search",
              type: "(query: string) => Promise<CommandItem[]>",
              description: "Источник результатов с сервера.",
            },
            { name: "debounce", type: "number", default: "150", description: "Задержка перед запросом, мс." },
            {
              name: "hotkey",
              type: "string | null",
              default: '"mod+k"',
              description: "Клавиша открытия. null — только внешнее управление.",
            },
            {
              name: "open / onOpenChange",
              type: "boolean / (open: boolean) => void",
              description: "Внешнее управление. Без них палитра держит состояние сама.",
            },
            {
              name: "labels",
              type: "{ placeholder, empty, navigate, select }",
              description: "Подписи. По умолчанию английские.",
            },
          ]}
        />
        <p>Пункт списка:</p>
        <CodeBlock
          code={`interface CommandItem {
  id: string;
  title: string;
  group?: string;     // заголовок раздела; пункты группируются в порядке следования
  badge?: string;     // короткая метка слева: ключ проекта, номер задачи
  hint?: string;      // подсказка справа: горячая клавиша пункта
  icon?: ReactNode;
  keywords?: string;  // дополнительный текст для поиска, не показывается
  onSelect: () => void;
}`}
        />
      </Section>
    </>
  );
}
