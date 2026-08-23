import Link from "next/link";
import { CodeBlock } from "@/components/docs";
import { KanbanDemo } from "@/demos/widgets";

const FEATURES = [
  {
    title: "Протяжка, которая не ломает клик",
    text: "Прокрутка мышью включается только после порога сдвига, уступает нативному drag&drop и сама подкручивает ленту у края. Инерция, растворение краёв, клавиатура.",
    href: "/docs/hooks/use-drag-scroll",
  },
  {
    title: "Доска с честным оптимизмом",
    text: "Карточка встаёт ровно туда, где показан слот. Свежие данные с сервера не перезатирают более позднее локальное изменение — быстрые переносы подряд не откатываются.",
    href: "/docs/widgets/kanban",
  },
  {
    title: "Markdown без сырого HTML",
    text: "Разбор даёт дерево, из дерева строятся React-элементы. Чужой тег станет текстом, а javascript:-ссылка не станет ссылкой — по построению, а не по санитайзеру.",
    href: "/docs/components/markdown",
  },
  {
    title: "Клавиши с последовательностями",
    text: "«g», затем «d». Два независимых матчера: набранная в поле ввода буква не оставляет приложение в ожидании второй клавиши.",
    href: "/docs/hooks/use-hotkeys",
  },
  {
    title: "Тултип, который не обрезается",
    text: "Один слой на всё приложение и атрибут data-tip на любом элементе. Портал с fixed — колонки и ленты с overflow ему не помеха.",
    href: "/docs/components/tooltip",
  },
  {
    title: "Темы на CSS-переменных",
    text: "Светлая, тёмная и системная. Скрипт в head ставит тему до первой отрисовки, поэтому страница не мигает. Своя палитра — переопределением переменных.",
    href: "/docs/theming",
  },
];

export default function Home() {
  return (
    <main>
      {/* ── Заголовок ── */}
      <section className="relative overflow-hidden border-b border-edge">
        <div className="docs-glow" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center lg:py-32">
          <p className="pl-animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-edge bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            0.1.0 — первый публичный выпуск
          </p>

          <h1 className="pl-animate-fade-up pl-delay-1 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Компоненты, выросшие
            <br />
            из <span className="pl-gradient-text">настоящего продукта</span>
          </h1>

          <p className="pl-animate-fade-up pl-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Дизайн-система, поведенческие хуки и тяжёлые виджеты — канбан, диаграмма
            Ганта, панель фильтров. Примитивы ставятся из npm, виджеты копируются
            в проект и правятся как свой код.
          </p>

          <div className="pl-animate-fade-up pl-delay-3 mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs/introduction"
              className="docs-plain pl-btn pl-btn-gradient pl-btn--lg"
            >
              Начать
            </Link>
            <Link
              href="/docs/widgets/kanban"
              className="docs-plain pl-btn pl-btn--secondary pl-btn--lg"
            >
              Посмотреть виджеты
            </Link>
          </div>

          <div className="pl-animate-fade-up pl-delay-4 mx-auto mt-10 max-w-xl text-left">
            <CodeBlock
              lang="bash"
              code="npm install @toimetdev/pathlogs-core @toimetdev/pathlogs-hooks @toimetdev/pathlogs-tokens"
            />
          </div>
        </div>
      </section>

      {/* ── Живая доска ── */}
      <section className="border-b border-edge">
        <div className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Не скриншот</h2>
              <p className="mt-1 text-sm text-muted">
                Это настоящий виджет из реестра. Перетащите карточку, переставьте
                колонку, откройте её настройки.
              </p>
            </div>
            <Link
              href="/docs/widgets/kanban"
              className="docs-plain text-sm font-medium text-accent-hover hover:underline"
            >
              Документация доски →
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-edge bg-surface/40 p-4">
            <KanbanDemo />
          </div>
        </div>
      </section>

      {/* ── Возможности ── */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Мелочи, которые обычно пишут заново
        </h2>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted">
          Каждая из них стоила отладки в настоящем продукте. Рядом с кодом лежит
          комментарий, объясняющий, что было бы иначе.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="docs-plain pl-hover-lift group rounded-xl border border-edge bg-surface p-5"
            >
              <h3 className="mb-2 font-semibold transition group-hover:text-accent-hover">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{feature.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Два способа доставки ── */}
      <section className="border-t border-edge bg-surface/30">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-16 md:grid-cols-2 lg:px-8">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Пакеты — из npm</h3>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              Токены, хуки и примитивы правят редко, а обновлять их хочется одной
              командой.
            </p>
            <CodeBlock
              lang="tsx"
              code={`import { Dialog, Button } from "@toimetdev/pathlogs-core";
import { useHotkeys } from "@toimetdev/pathlogs-hooks";`}
            />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Виджеты — копированием</h3>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              Доска и Гант почти всегда требуют правок под домен. В вашем проекте
              это обычные файлы.
            </p>
            <CodeBlock
              lang="bash"
              code={`npx @toimetdev/pathlogs-ui init
npx @toimetdev/pathlogs-ui add kanban gantt`}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-edge">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted lg:px-8">
          <p>
            MIT · сделано на основе{" "}
            <a
              href="https://github.com/MuratOfficial/pathlogs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-hover hover:underline"
            >
              pathlogs
            </a>
          </p>
          <div className="flex gap-4">
            <Link href="/docs/introduction" className="docs-plain hover:text-foreground">
              Документация
            </Link>
            <a
              href="https://www.npmjs.com/org/toimetdev"
              target="_blank"
              rel="noopener noreferrer"
              className="docs-plain hover:text-foreground"
            >
              npm
            </a>
            <a
              href="https://github.com/MuratOfficial/pathlogs-dev-framework"
              target="_blank"
              rel="noopener noreferrer"
              className="docs-plain hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
