import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { ThemeDemo } from "@/demos/hooks";

export const toc = [
  { id: "tokens", title: "Токены" },
  { id: "themes", title: "Светлая и тёмная" },
  { id: "custom", title: "Своя палитра" },
  { id: "tailwind", title: "Утилиты Tailwind" },
  { id: "color", title: "Работа с цветом" },
  { id: "layers", title: "Слои" },
];

const TOKENS = [
  ["--background", "Фон страницы"],
  ["--surface", "Карточки, панели, диалоги"],
  ["--surface-2", "Поля ввода, вложенные поверхности"],
  ["--border", "Границы (утилита называется border-edge)"],
  ["--foreground", "Основной текст"],
  ["--muted", "Второстепенный текст"],
  ["--accent", "Акцент: кнопки, ссылки, фокус"],
  ["--accent-hover", "Акцент при наведении"],
  ["--accent-2, --accent-3, --accent-pink", "Дополнительные акценты для градиентов"],
  ["--accent-foreground", "Текст на акцентной заливке"],
  ["--danger, --success, --warning, --info", "Семантика состояний"],
];

export default function Page() {
  return (
    <>
      <p>
        Вся тема — это плоский набор CSS-переменных. Компоненты читают только{" "}
        <code>var()</code> и собственных цветов не содержат, поэтому перекрасить
        их можно, не трогая ни строчки в пакете.
      </p>

      <Section title="Токены" id="tokens">
        <div className="not-prose my-5 overflow-hidden rounded-xl border border-edge">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {TOKENS.map(([name, description]) => (
                <tr key={name} className="border-b border-edge/60 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <code className="font-mono text-[12px] text-accent-hover">{name}</code>
                  </td>
                  <td className="px-4 py-2.5 text-foreground/85">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Кроме цветов есть радиусы (<code>--radius-sm</code> … <code>--radius-2xl</code>),
          тени (<code>--shadow</code> … <code>--shadow-2xl</code>), тайминги
          (<code>--duration</code>, <code>--ease-out-expo</code>) и шкала слоёв.
        </p>
      </Section>

      <Section title="Светлая и тёмная" id="themes">
        <p>
          Тёмная тема — значение по умолчанию на <code>:root</code>. Светлая включается
          атрибутом на <code>&lt;html&gt;</code>:
        </p>
        <CodeBlock lang="html" code={`<html data-theme="light">`} />
        <p>
          Значение <code>system</code> отдаёт решение медиазапросу{" "}
          <code>prefers-color-scheme</code>. Всё это делает <code>useTheme</code>:
        </p>
        <Example
          code={`import { useTheme } from "@toimetdev/pathlogs-hooks";

const { preference, resolved, setTheme, toggle } = useTheme();

// preference — что выбрал пользователь: light | dark | system
// resolved   — что видно на экране: light | dark`}
        >
          <ThemeDemo />
        </Example>
        <Callout tone="why" title="Почему источник правды — атрибут, а не состояние React">
          Тему ставит инлайн-скрипт ещё до гидратации. Если бы компоненты хранили её
          в <code>useState</code>, первый кадр отрисовался бы с темой по умолчанию,
          а React пожаловался бы на рассинхрон разметки. Чтение атрибута через{" "}
          <code>useSyncExternalStore</code> снимает обе проблемы разом.
        </Callout>
      </Section>

      <Section title="Своя палитра" id="custom">
        <p>
          Переопределите переменные после импорта токенов — каскад сделает остальное.
          Ни один компонент об этом знать не должен:
        </p>
        <CodeBlock
          lang="css"
          code={`@import "@toimetdev/pathlogs-tokens/styles/index.css";

:root {
  --accent: #0ea5e9;
  --accent-hover: #38bdf8;
  --accent-2: #06b6d4;
  --radius: 0.25rem;
}

[data-theme="light"] {
  --accent-hover: #0284c7;
}`}
        />
        <Callout tone="warn" title="Не переопределяйте токен только внутри медиазапроса">
          Значение, объявленное лишь под <code>prefers-color-scheme</code>, исчезает,
          когда пользователь выбрал тему вручную. Объявляйте базовое значение
          на <code>:root</code>, а в теме — только отличия.
        </Callout>
      </Section>

      <Section title="Утилиты Tailwind" id="tailwind">
        <p>
          Мост <code>tokens/styles/tailwind.css</code> объявляет{" "}
          <code>@theme inline</code>, поэтому утилиты ссылаются на переменные,
          а не на значения — смена темы каскадирует в них без пересборки:
        </p>
        <CodeBlock
          code={`<div className="rounded-xl border border-edge bg-surface p-4 text-foreground">
  <p className="text-muted">Второстепенный текст</p>
  <button className="bg-accent text-accent-foreground hover:bg-accent-hover">
    Кнопка
  </button>
</div>`}
        />
        <p>
          Граница называется <code>border-edge</code>, а не <code>border-border</code>:
          вторая утилита читалась бы как заикание.
        </p>
      </Section>

      <Section title="Работа с цветом" id="color">
        <p>
          Цвета меток и колонок задаёт пользователь, поэтому пакет умеет считать
          читаемость и прозрачность:
        </p>
        <CodeBlock
          code={`import { alpha, readableTextOn, luminance, backdropCss } from "@toimetdev/pathlogs-tokens";

alpha("#6366f1", 0.3);       // "#6366f14d" — восьмизначный hex, годится для градиентов
readableTextOn("#ffff00");   // "#000000" — белый текст на жёлтом не читается
luminance("#1b2233");        // относительная яркость по WCAG 2.1

backdropCss({ color: "#6366f1", colorTo: "#ec4899", angle: 45 });`}
        />
        <PropsTable
          rows={[
            {
              name: "alpha",
              type: "(hex: string, opacity: number) => string",
              description:
                "Прозрачность восьмизначным hex, а не rgba(): такую строку можно склеивать в градиенты и класть в CSS-переменные без разбора.",
            },
            {
              name: "readableTextOn",
              type: '(hex: string) => "#000000" | "#ffffff"',
              description:
                "Чёрный или белый — тот, что контрастнее на этом фоне. Считается по яркости, а не по «на глаз тёмный».",
            },
            {
              name: "backdropCss",
              type: "(bg: SurfaceBackdrop) => string",
              description:
                "Полупрозрачная подложка: одно пятно или градиент. Одна функция на саму подложку и на превью в настройках — они не разъедутся.",
            },
            {
              name: "BOARD_PALETTE",
              type: "readonly string[]",
              description: "Приглушённая палитра для карточек, колонок и меток.",
            },
            {
              name: "SURFACE_PALETTE",
              type: "readonly string[]",
              description:
                "Яркая палитра для подложек: фон полупрозрачный, приглушённые оттенки на нём не видны.",
            },
          ]}
        />
      </Section>

      <Section title="Слои" id="layers">
        <p>
          Общая шкала <code>z-index</code> важнее, чем кажется: без неё портал одного
          компонента перекрывает портал другого в случайном порядке.
        </p>
        <CodeBlock
          lang="css"
          code={`--z-sticky: 20;    /* липкие панели */
--z-header: 30;    /* шапка, затемнение drawer */
--z-drawer: 40;    /* выезжающий сайдбар */
--z-dropdown: 50;  /* выпадающие панели, меню упоминаний */
--z-modal: 60;     /* диалоги и командная палитра */
--z-toast: 80;
--z-tooltip: 90;   /* подсказки — поверх всего */`}
        />
      </Section>
    </>
  );
}
