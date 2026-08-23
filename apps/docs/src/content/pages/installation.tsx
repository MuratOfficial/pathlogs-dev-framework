import { Callout, CodeBlock, Example, Section } from "@/components/docs";
import { ButtonDemo } from "@/demos/basics";

export const toc = [
  { id: "packages", title: "Пакеты" },
  { id: "styles", title: "Стили" },
  { id: "theme", title: "Скрипт темы" },
  { id: "check", title: "Проверка" },
  { id: "without-tailwind", title: "Без Tailwind" },
];

export default function Page() {
  return (
    <>
      <Section title="Пакеты" id="packages">
        <CodeBlock
          lang="bash"
          code="npm install @toimetdev/pathlogs-core @toimetdev/pathlogs-hooks @toimetdev/pathlogs-tokens"
        />
        <p>
          <code>core</code> зависит от двух остальных, так что формально хватило бы
          одного пакета. Ставить все три всё же удобнее: тогда{" "}
          <code>@toimetdev/pathlogs-hooks</code> и <code>@toimetdev/pathlogs-tokens</code>{" "}
          видны в <code>package.json</code> как прямые зависимости, а не как подробность
          чужого дерева.
        </p>
        <p>
          React 18 или новее — в peer-зависимостях. Ничего другого пакеты не тянут:
          ни clsx, ни radix, ни утилит для дат.
        </p>
      </Section>

      <Section title="Стили" id="styles">
        <p>Три импорта в главный CSS-файл — обычно это `globals.css`:</p>
        <CodeBlock
          lang="css"
          title="src/app/globals.css"
          code={`@import "tailwindcss";

@import "@toimetdev/pathlogs-tokens/styles/index.css";
@import "@toimetdev/pathlogs-core/styles/components.css";
@import "@toimetdev/pathlogs-tokens/styles/tailwind.css";`}
        />
        <p>Что делает каждая строка:</p>
        <ul>
          <li>
            <code>tokens/styles/index.css</code> — переменные, базовые стили, анимации
            и стили лент с протяжкой;
          </li>
          <li>
            <code>core/styles/components.css</code> — оформление компонентов пакета;
          </li>
          <li>
            <code>tokens/styles/tailwind.css</code> — мост к Tailwind v4: превращает
            токены в утилиты <code>bg-surface</code>, <code>text-muted</code>,{" "}
            <code>border-edge</code>.
          </li>
        </ul>

        <Callout tone="warn" title="Порядок важен">
          Мост к Tailwind идёт <strong>последним</strong>. Он объявляет{" "}
          <code>@theme inline</code>, который ссылается на переменные — если токенов
          ещё нет, утилиты соберутся с пустыми значениями и молча ничего не покрасят.
        </Callout>
      </Section>

      <Section title="Скрипт темы" id="theme">
        <p>
          Тема хранится в <code>localStorage</code> и в атрибуте{" "}
          <code>data-theme</code> на <code>&lt;html&gt;</code>. Чтобы страница не мигнула
          чужой темой до гидратации, атрибут ставит крошечный синхронный скрипт
          в <code>&lt;head&gt;</code>:
        </p>
        <CodeBlock
          title="src/app/layout.tsx"
          code={`import { themeScript } from "@toimetdev/pathlogs-tokens";

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}`}
        />
        <Callout tone="why" title="Почему синхронный скрипт, а не эффект">
          Эффект выполняется после первой отрисовки — то есть кадр с неправильной темой
          пользователь уже увидит. Этот скрипт намеренно блокирует рендер: он занимает
          доли миллисекунды и снимает мигание целиком. <code>suppressHydrationWarning</code>{" "}
          нужен потому, что атрибут на <code>&lt;html&gt;</code> появляется до гидратации
          и не совпадает с серверной разметкой.
        </Callout>
      </Section>

      <Section title="Проверка" id="check">
        <p>Если всё подключено, кнопки выглядят так и реагируют на смену темы:</p>
        <Example
          code={`import { Button } from "@toimetdev/pathlogs-core";

<Button variant="primary">Основная</Button>
<Button variant="secondary">Вторичная</Button>
<Button variant="gradient">Градиент</Button>`}
        >
          <ButtonDemo />
        </Example>
        <p>
          Не покрасилось — почти всегда дело в порядке импортов или в том, что CSS
          подключён не в тот файл. Компоненты не полагаются на Tailwind, поэтому
          отсутствие стилей означает, что <code>components.css</code> просто не доехал.
        </p>
      </Section>

      <Section title="Без Tailwind" id="without-tailwind">
        <p>
          Компоненты <code>core</code> размечены собственными классами{" "}
          <code>pl-*</code> и работают в проекте с любым CSS-фреймворком или вовсе
          без него. Тогда достаточно двух импортов:
        </p>
        <CodeBlock
          lang="css"
          code={`@import "@toimetdev/pathlogs-tokens/styles/index.css";
@import "@toimetdev/pathlogs-core/styles/components.css";`}
        />
        <p>
          Виджеты реестра — другое дело: они размечены Tailwind. Если Tailwind
          в проекте нет, укажите это при настройке CLI (<code>--no-tailwind</code>),
          и он предупредит, что виджеты приедут без стилей.
        </p>
      </Section>
    </>
  );
}
