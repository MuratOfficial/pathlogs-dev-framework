import Link from "next/link";
import { CodeBlock } from "@/components/docs";
import { Logo } from "@/components/Logo";
import { KanbanDemo } from "@/demos/widgets";
import { LANDING } from "@/content/landing";
import { docsHref, type Lang } from "@/content/locale";

/**
 * Главная страница. Вёрстка одна на оба языка, тексты приходят из
 * `content/landing.ts` — держать две копии этой разметки значило бы
 * чинить каждую правку дважды.
 */
export function Landing({ lang }: { lang: Lang }) {
  const c = LANDING[lang];

  return (
    <main>
      {/* ── Заголовок ── */}
      <section className="relative overflow-hidden border-b border-edge">
        <div className="docs-glow" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center lg:py-32">
          <p className="pl-animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-edge bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {c.release}
          </p>

          <h1 className="pl-animate-fade-up pl-delay-1 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            {c.headline.lead}
            <br />
            <span className="pl-gradient-text">{c.headline.accent}</span>
          </h1>

          <p className="pl-animate-fade-up pl-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {c.lede}
          </p>

          <div className="pl-animate-fade-up pl-delay-3 mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={docsHref(lang, "introduction")}
              className="docs-plain pl-btn pl-btn-gradient pl-btn--lg"
            >
              {c.ctaStart}
            </Link>
            <Link
              href={docsHref(lang, "widgets/kanban")}
              className="docs-plain pl-btn pl-btn--secondary pl-btn--lg"
            >
              {c.ctaWidgets}
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
              <h2 className="text-2xl font-bold tracking-tight">{c.liveTitle}</h2>
              <p className="mt-1 text-sm text-muted">{c.liveText}</p>
            </div>
            <Link
              href={docsHref(lang, "widgets/kanban")}
              className="docs-plain text-sm font-medium text-accent-hover hover:underline"
            >
              {c.liveLink}
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-edge bg-surface/40 p-4">
            <KanbanDemo />
          </div>
        </div>
      </section>

      {/* ── Возможности ── */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">{c.featuresTitle}</h2>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted">{c.featuresLede}</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.features.map((feature) => (
            <Link
              key={feature.slug}
              href={docsHref(lang, feature.slug)}
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
            <h3 className="mb-2 text-lg font-semibold">{c.packagesTitle}</h3>
            <p className="mb-4 text-sm leading-relaxed text-muted">{c.packagesText}</p>
            <CodeBlock
              lang="tsx"
              code={`import { Dialog, Button } from "@toimetdev/pathlogs-core";
import { useHotkeys } from "@toimetdev/pathlogs-hooks";`}
            />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">{c.widgetsTitle}</h3>
            <p className="mb-4 text-sm leading-relaxed text-muted">{c.widgetsText}</p>
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
          <p className="flex items-center gap-2">
            <Logo withText={false} />
            {c.footerMade}{" "}
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
            <Link
              href={docsHref(lang, "introduction")}
              className="docs-plain hover:text-foreground"
            >
              {c.footerDocs}
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
