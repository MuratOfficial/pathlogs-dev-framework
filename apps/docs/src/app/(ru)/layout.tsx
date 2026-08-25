import { RootShell, rootMetadata } from "@/views/RootShell";
import "../globals.css";

/**
 * Корневой макет русской версии — она живёт под префиксом /ru.
 *
 * Парный к `(en)/layout.tsx`: см. пояснение там о том, зачем корневых
 * макетов два.
 */

export const metadata = rootMetadata("ru");
export { viewport } from "@/views/RootShell";

export default function RuRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="ru">{children}</RootShell>;
}
