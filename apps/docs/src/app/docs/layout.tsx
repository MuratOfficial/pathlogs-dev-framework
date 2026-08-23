import { Sidebar } from "@/components/Sidebar";

/**
 * Раскладка раздела документации: навигация слева, контент справа.
 *
 * Навигация липкая и прокручивается сама: список разделов длиннее экрана,
 * и без собственной прокрутки нижние пункты было бы не достать.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
      <div className="docs-shell py-10">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 pr-2">
            <Sidebar />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
