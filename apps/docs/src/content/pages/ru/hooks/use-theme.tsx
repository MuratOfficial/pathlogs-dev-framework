import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { ThemeDemo } from "@/demos/hooks";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "api", title: "Что возвращает" },
  { id: "fouc", title: "Мигание при загрузке" },
  { id: "dom", title: "Без React" },
];

export default function Page() {
  return (
    <>
      <p>
        Текущая тема как внешнее состояние DOM. Хук не хранит тему у себя — он
        читает атрибут <code>data-theme</code> на <code>&lt;html&gt;</code>,
        поэтому смена темы из любого места приложения доходит до всех сразу.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { useTheme } from "@toimetdev/pathlogs-hooks";

function Toggle() {
  const { preference, resolved, setTheme, toggle } = useTheme();

  return (
    <button onClick={toggle}>
      {resolved === "dark" ? "Светлая" : "Тёмная"}
    </button>
  );
}`}
        >
          <ThemeDemo />
        </Example>
        <p>
          Готовый переключатель уже есть — <code>ThemeToggle</code> из{" "}
          <code>@toimetdev/pathlogs-core</code>. Хук нужен, когда переключатель
          свой или тема влияет на логику: например, на цвет графика.
        </p>
      </Section>

      <Section title="Что возвращает" id="api">
        <PropsTable
          rows={[
            {
              name: "preference",
              type: '"light" | "dark" | "system"',
              description: "Что выбрал пользователь.",
            },
            {
              name: "resolved",
              type: '"light" | "dark"',
              description: '«system» уже развёрнут в то, что видно на экране.',
            },
            {
              name: "setTheme",
              type: "(theme: ThemePreference) => void",
              description: "Применяет тему и запоминает выбор.",
            },
            {
              name: "toggle",
              type: "() => void",
              description: "Переключает светлую и тёмную. «system» разворачивается в противоположность текущей.",
            },
          ]}
        />
        <p>
          Единственный аргумент — ключ в <code>localStorage</code> (по умолчанию{" "}
          <code>&quot;theme&quot;</code>). Он должен совпадать с ключом, переданным
          в <code>themeScript()</code>.
        </p>
      </Section>

      <Section title="Мигание при загрузке" id="fouc">
        <p>
          Тему нужно применить <em>до</em> первой отрисовки, иначе страница мигнёт.
          Для этого в <code>&lt;head&gt;</code> ставится крошечный синхронный скрипт:
        </p>
        <CodeBlock
          code={`import { themeScript } from "@toimetdev/pathlogs-tokens";

<html lang="ru" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
  </head>
</html>`}
        />
        <Callout tone="why" title="Почему useSyncExternalStore, а не useState + эффект">
          Атрибут уже стоит к моменту гидратации. Компонент, хранящий тему в состоянии,
          отрисовал бы первый кадр с темой по умолчанию и получил бы предупреждение
          о рассинхроне. <code>useSyncExternalStore</code> честно говорит серверу
          «тема по умолчанию», а клиенту сразу отдаёт настоящую.
        </Callout>
        <p>
          Подписка слушает и атрибут, и системную настройку: последняя важна,
          только пока выбран <code>system</code>.
        </p>
      </Section>

      <Section title="Без React" id="dom">
        <p>
          Те же операции доступны как обычные функции — их зовёт и инлайн-скрипт,
          и тесты:
        </p>
        <CodeBlock
          code={`import {
  getThemePreference,
  getResolvedTheme,
  setThemePreference,
  toggleTheme,
  subscribeTheme,
  themeScript,
} from "@toimetdev/pathlogs-tokens";`}
        />
        <p>
          Запись в <code>localStorage</code> может упасть (приватный режим,
          отключённые куки) — это не роняет переключатель: тема всё равно уже
          применена, просто не переживёт перезагрузку.
        </p>
      </Section>
    </>
  );
}
