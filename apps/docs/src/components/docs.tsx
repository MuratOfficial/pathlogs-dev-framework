import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";
import { ExampleTabs } from "./ExampleTabs";

/**
 * Примитивы страниц документации.
 *
 * Страницы пишутся на TSX, а не на MDX: почти в каждой есть живой пример,
 * который всё равно пришлось бы импортировать как компонент, — а так
 * пример и текст лежат рядом и проверяются типами вместе со всем остальным.
 *
 * Часть примитивов живёт в `Prose.tsx` и помечена «use client»: подписи
 * они берут из языка страницы. Страницы импортируют всё отсюда и о делении
 * знать не обязаны.
 */

/** Заголовок секции. `id` служит якорем и попадает в оглавление справа. */
export function Section({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return <h3 id={id}>{children}</h3>;
}

/** Живой пример: превью сверху, исходник под вкладкой. */
export async function Example({
  children,
  code,
  lang = "tsx",
  defaultTab,
  plain,
}: {
  children: ReactNode;
  code: string;
  lang?: string;
  defaultTab?: "preview" | "code";
  plain?: boolean;
}) {
  return (
    <ExampleTabs
      preview={children}
      code={<CodeBlock code={code} lang={lang} bare />}
      {...(defaultTab ? { defaultTab } : {})}
      {...(plain ? { plain } : {})}
    />
  );
}

export { CodeBlock };
export { Callout, PropsTable, type CalloutTone, type PropRow } from "./Prose";
