import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { PageHintDemo } from "@/demos/basics";
import { DragScrollDemo } from "@/demos/hooks";

export const toc = [
  { id: "portal", title: "Portal" },
  { id: "drag-scroll", title: "DragScroll" },
  { id: "page-hint", title: "PageHint" },
  { id: "backdrop", title: "Backdrop" },
];

export default function Page() {
  return (
    <>
      <p>
        Четыре компонента, каждому из которых хватает одного экрана.
      </p>

      <Section title="Portal" id="portal">
        <p>
          Рендер в <code>body</code> мимо текущего поддерева. Нужен всем всплывающим
          слоям: элемент, отрисованный внутри контейнера с{" "}
          <code>overflow: hidden</code>, обрезается его границами, а{" "}
          <code>z-index</code> внутри чужого stacking context не спасает.
        </p>
        <CodeBlock
          code={`import { Portal } from "@toimetdev/pathlogs-core";

<Portal>
  <div style={{ position: "fixed", inset: 0 }}>…</div>
</Portal>`}
        />
        <Callout tone="note" title="До монтирования ничего не рендерит">
          На сервере <code>document</code> нет, а разметка, которой не было
          в серверном ответе, не должна появляться в первом кадре гидратации.
          Поэтому портал ждёт монтирования.
        </Callout>
        <PropsTable
          rows={[
            { name: "children", type: "ReactNode", required: true, description: "Что отрисовать." },
            {
              name: "container",
              type: "Element | null",
              default: "document.body",
              description: "Куда отрисовать.",
            },
          ]}
        />
      </Section>

      <Section title="DragScroll" id="drag-scroll">
        <p>
          Контейнер с прокруткой протяжкой — для мест, где своего клиентского
          компонента нет: серверные страницы, ряды вкладок, широкие таблицы.
        </p>
        <Example
          code={`import { DragScroll } from "@toimetdev/pathlogs-core";

<DragScroll axis="x" keyboard className="flex gap-3 overflow-x-auto">
  {tabs.map((t) => <Tab key={t.id} {...t} />)}
</DragScroll>`}
        >
          <DragScrollDemo />
        </Example>
        <p>
          Принимает те же настройки, что и{" "}
          <a href="/ru/docs/hooks/use-drag-scroll">useDragScroll</a>:{" "}
          <code>axis</code>, <code>momentum</code>, <code>keyboard</code>,{" "}
          <code>enabled</code>. Классы прокрутки задаёт вызывающий код — компонент
          отвечает за поведение, а не за раскладку.
        </p>
      </Section>

      <Section title="PageHint" id="page-hint">
        <p>Подсказка-субтитул под заголовком страницы.</p>
        <Example
          code={`import { PageHint } from "@toimetdev/pathlogs-core";

<h1>Доска проекта</h1>
<PageHint>Перетащите карточку к краю доски — она подкрутится сама.</PageHint>`}
        >
          <PageHintDemo />
        </Example>
        <Callout tone="why" title="Почему отдельный блок, а не обычный абзац">
          Пояснение, набранное тем же кеглем, читается как продолжение текста
          страницы и теряется. Акцентная полоса, иконка и приглушённый цвет сразу
          говорят «это пояснение, а не содержание».
        </Callout>
      </Section>

      <Section title="Backdrop" id="backdrop">
        <p>
          Цветная подложка страницы: мягкое пятно вверху или градиент во всю ширину.
          В трекере это персональный фон проекта — у каждого участника свой.
        </p>
        <CodeBlock
          code={`import { Backdrop } from "@toimetdev/pathlogs-core";

<Backdrop backdrop={{ color: "#6366f1", colorTo: "#ec4899", angle: 135 }} />

// однотонная — радиальное пятно вверху слева
<Backdrop backdrop={{ color: "#10b981" }} />`}
        />
        <p>
          Рисуется <code>fixed</code> за контентом и не перехватывает указатель —
          по тексту над ней можно кликать и выделять его. Цвета полупрозрачные,
          поэтому одна и та же подложка работает в обеих темах.
        </p>
        <p>
          CSS-строку можно получить и отдельно — <code>backdropCss(bg)</code>{" "}
          из <code>@toimetdev/pathlogs-tokens</code>. Одна функция на саму подложку
          и на превью в настройках: разъехаться им негде.
        </p>
      </Section>
    </>
  );
}
