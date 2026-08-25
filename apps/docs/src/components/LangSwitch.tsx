"use client";

import { usePathname } from "next/navigation";
import { LANGS, LANG_LABEL, dict, langPrefix, type Lang } from "@/content/locale";

/**
 * Переключатель языка: тот же раздел на другом языке, а не главная.
 *
 * Уводить на главную было бы проще, но это ровно та мелочь, из-за которой
 * переключателем перестают пользоваться: человек читает про `useHotkeys`,
 * жмёт «English» и теряет место. Поэтому текущий путь разбирается и
 * пересобирается с другим префиксом.
 *
 * Ссылка обычная, а не `next/link`: у языков разные корневые макеты, и
 * переход между ними всё равно перезагружает документ целиком. Честный
 * `<a>` не обещает мгновенного перехода, которого здесь не будет.
 */
export function LangSwitch({ lang }: { lang: Lang }) {
  const pathname = usePathname() || "/";
  const other = LANGS.find((l) => l !== lang) ?? lang;

  return (
    <a
      href={swapLang(pathname, other)}
      hrefLang={other}
      data-tip={dict(lang).switchLanguage}
      className="docs-plain flex h-9 items-center rounded-lg px-2 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-foreground"
    >
      {LANG_LABEL[other]}
    </a>
  );
}

/**
 * Тот же путь на другом языке.
 *
 * Сначала снимаем префикс любого известного языка, потом ставим нужный.
 * Снимать «/ru» строкой напрямую нельзя: раздел `/ruby` начинается так же,
 * поэтому сравнение идёт по границе сегмента.
 */
export function swapLang(pathname: string, to: Lang): string {
  let rest = pathname;

  for (const l of LANGS) {
    const prefix = langPrefix(l);
    if (prefix && (rest === prefix || rest.startsWith(`${prefix}/`))) {
      rest = rest.slice(prefix.length);
      break;
    }
  }

  // Голый «/» — это главная, и приклеивать его к префиксу нельзя: получится
  // «/ru/» с хвостовым слэшем, за которым следует лишний редирект
  if (rest === "/") rest = "";

  return `${langPrefix(to)}${rest}` || "/";
}
