import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "responsive", title: "Адаптивность" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Оболочка приложения: на широком экране статичный сайдбар, на узком —
        выезжающий drawer с шапкой и гамбургером.
      </p>

      <Section title="Пример" id="example">
        <CodeBlock
          title="src/app/(app)/layout.tsx"
          code={`import { AppShell } from "@toimetdev/pathlogs-core";

export default function AppLayout({ children }) {
  return (
    <AppShell
      brand={
        <span className="flex items-center gap-2">
          <Logo />
          <span className="text-sm font-bold">PathLogs</span>
        </span>
      }
      menuLabel="Открыть меню"
      sidebar={<Navigation />}
    >
      {children}
    </AppShell>
  );
}`}
        />
        <p>
          Содержимое сайдбара приходит пропом целиком — оболочка не диктует,
          как выглядит навигация.
        </p>
      </Section>

      <Section title="Адаптивность" id="responsive">
        <p>Точка перелома — 1024 px. Ниже неё появляются шапка и гамбургер.</p>
        <Callout tone="why" title="Точка перелома живёт в CSS, а не в JS">
          Медиазапрос отрабатывает до первой отрисовки. Проверка ширины окна
          в эффекте дала бы кадр со свёрнутым сайдбаром на десктопе — заметное
          мигание при каждой загрузке страницы.
        </Callout>
        <p>Ещё две мелочи, которые обычно забывают:</p>
        <ul>
          <li>
            клик по любой ссылке внутри сайдбара закрывает drawer — переход
            на мобильном всегда означает, что меню больше не нужно;
          </li>
          <li>
            пока drawer открыт, прокрутка страницы под ним заблокирована.
          </li>
        </ul>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "sidebar", type: "ReactNode", required: true, description: "Содержимое бокового меню." },
            { name: "children", type: "ReactNode", required: true, description: "Содержимое страницы." },
            {
              name: "brand",
              type: "ReactNode",
              description: "Что показать в мобильной шапке рядом с гамбургером: логотип, название.",
            },
            {
              name: "menuLabel",
              type: "string",
              default: '"Open menu"',
              description: "Доступное имя кнопки-гамбургера.",
            },
          ]}
        />
        <p>
          Ширина сайдбара — 15 rem. Если нужна другая, переопределите{" "}
          <code>.pl-shell__sidebar</code> и отступ у <code>.pl-shell__main</code>:
          оба значения лежат рядом в <code>components.css</code>.
        </p>
      </Section>
    </>
  );
}
