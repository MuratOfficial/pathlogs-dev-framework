"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LANG, dict, type Dictionary, type Lang } from "@/content/locale";

/**
 * Язык страницы для тех мест, куда его неудобно передавать пропсом.
 *
 * Врезки и таблицы пропсов стоят внутри текста почти каждой страницы,
 * и добавить им `lang={lang}` значило бы править сотню файлов при каждой
 * такой мелочи. Верхние же элементы оболочки — сайдбар, оглавление, шапка —
 * получают язык обычным пропсом: он там ровно один на страницу.
 *
 * Контекст клиентский, поэтому им пользуются только клиентские компоненты.
 * Серверные (`CodeBlock` с подсветкой, `Example`) языка и не требуют.
 */

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

/** Словарь текущего языка — то, что нужно почти всем потребителям. */
export function useDict(): Dictionary {
  return dict(useContext(LangContext));
}
