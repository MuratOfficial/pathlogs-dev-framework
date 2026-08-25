import { RootShell, rootMetadata } from "@/views/RootShell";
import "../globals.css";

/**
 * Корневой макет английской версии — она живёт в корне сайта.
 *
 * Корневых макетов два, по одному на язык: атрибут `lang` у `<html>`
 * задаётся только здесь, а из вложенного макета его уже не переопределить.
 * Группы маршрутов `(en)` и `(ru)` на адреса не влияют.
 */

export const metadata = rootMetadata("en");
export { viewport } from "@/views/RootShell";

export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
