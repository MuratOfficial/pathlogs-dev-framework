import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "behaviour", title: "Поведение" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Липкая навигация по разделам длинной страницы: клик прокручивает к блоку,
        активный пункт подсвечивается по мере чтения.
      </p>

      <Section title="Пример" id="example">
        <CodeBlock
          code={`import { SectionNav } from "@toimetdev/pathlogs-core";

<SectionNav
  aria-label="Разделы задачи"
  sections={[
    { id: "overview", label: "Обзор" },
    { id: "checklist", label: "Чек-лист", count: 7 },
    { id: "comments", label: "Комментарии", count: 12 },
    { id: "history", label: "История" },
  ]}
/>

{/* дальше на странице */}
<section id="overview">…</section>
<section id="checklist">…</section>`}
        />
        <p>
          Разделы находятся по <code>id</code>, поэтому от самой страницы ничего,
          кроме проставленных идентификаторов, не требуется.
        </p>
      </Section>

      <Section title="Поведение" id="behaviour">
        <ul>
          <li>
            <strong>Отступ прокрутки</strong> берётся у самой панели: её{" "}
            <code>top</code> из CSS плюс высота. Панель липнет под шапкой на узком
            экране и к верху окна на широком — жёсткое число промахнулось бы
            в одном из случаев.
          </li>
          <li>
            <strong>Ряд разделов листается протяжкой</strong> на узком экране,
            и клик при этом продолжает работать: протяжка включается только после
            порога сдвига.
          </li>
          <li>
            <strong>Плавность отключается</strong> при{" "}
            <code>prefers-reduced-motion</code>.
          </li>
        </ul>
        <Callout tone="note" title="Компонент — обёртка над useActiveSection">
          Если нужна своя разметка навигации (вертикальный список, оглавление
          справа — как на этой странице), возьмите{" "}
          <code>useActiveSection</code> напрямую.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "sections",
              type: "{ id: string; label: string; count?: number }[]",
              required: true,
              description: "Разделы в порядке их следования на странице. count рисуется бейджем справа.",
            },
            {
              name: "aria-label",
              type: "string",
              description: "Доступное имя навигации: «Разделы задачи».",
            },
            { name: "className", type: "string", description: "Дополнительные классы контейнера." },
          ]}
        />
      </Section>
    </>
  );
}
