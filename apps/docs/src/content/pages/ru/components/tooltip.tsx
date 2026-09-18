import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { TooltipDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "why", title: "Почему слой, а не обёртка" },
  { id: "a11y", title: "Доступность" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Один тултип на всё приложение. Ставится один раз в корне, дальше подсказку
        получает любой элемент с атрибутом <code>data-tip</code> — оборачивать
        и импортировать ничего не нужно.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { TooltipLayer } from "@toimetdev/pathlogs-core";

// один раз в корне приложения
<TooltipLayer />

// где угодно дальше
<button data-tip="Архивировать проект">…</button>
<span data-tip="Задача заблокирована UI-12">🔒</span>`}
        >
          <TooltipDemo />
        </Example>
        <p>
          Подсказка показывается над элементом, а если сверху мало места —
          под ним, и всегда удерживается в пределах окна по горизонтали.
        </p>
      </Section>

      <Section title="Почему слой, а не обёртка" id="why">
        <Callout tone="why" title="Обрезание в контейнерах с overflow">
          Компонент-обёртка рисует бабл внутри того же поддерева — а значит, внутри
          колонки доски, прокручиваемого списка или ленты с <code>overflow: hidden</code>.
          Там он обрезается, и <code>z-index</code> не спасает: внутри чужого stacking
          context он бессилен.
          <br />
          <br />
          Глобальный слой рендерит бабл порталом в <code>body</code> с{" "}
          <code>position: fixed</code>. Обрезать его нечему.
        </Callout>
        <p>Побочные выгоды такого решения:</p>
        <ul>
          <li>подсказку можно повесить на серверный компонент — атрибут не требует JS;</li>
          <li>в DOM живёт один бабл, а не сотня скрытых;</li>
          <li>ничего не нужно импортировать в месте использования.</li>
        </ul>
        <p>
          Плата — координаты <code>fixed</code> устаревают при прокрутке, поэтому
          при скролле подсказка просто прячется.
        </p>
      </Section>

      <Section title="Доступность" id="a11y">
        <p>
          Нативный <code>title</code> читают скринридеры, а свой атрибут — нет.
          Поэтому слой сам проставляет <code>aria-label</code> элементам,
          у которых нет видимого текста и своего <code>aria-label</code>:
        </p>
        <CodeBlock
          lang="html"
          code={`<!-- было -->
<button data-tip="Настроить колонку"><svg …/></button>

<!-- стало -->
<button data-tip="Настроить колонку" aria-label="Настроить колонку"><svg …/></button>`}
        />
        <p>
          Элементы с текстом не трогаются: их доступным именем уже служит видимый
          текст, и дублировать его подсказкой значило бы читать одно и то же дважды.
          За появляющимися элементами слой следит через <code>MutationObserver</code>.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "attribute",
              type: "string",
              default: '"data-tip"',
              description: "Атрибут-якорь. Поменяйте, если data-tip уже занят чем-то своим.",
            },
            { name: "maxWidth", type: "number", default: "220", description: "Предельная ширина бабла, px." },
            { name: "gap", type: "number", default: "8", description: "Зазор между элементом и баблом, px." },
          ]}
        />
      </Section>
    </>
  );
}
