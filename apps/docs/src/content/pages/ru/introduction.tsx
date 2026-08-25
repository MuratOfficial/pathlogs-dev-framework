import Link from "next/link";
import { Callout, CodeBlock, Section } from "@/components/docs";

export const toc = [
  { id: "why", title: "Зачем" },
  { id: "split", title: "Два способа доставки" },
  { id: "parts", title: "Из чего состоит" },
  { id: "principles", title: "Принципы" },
];

export default function Page() {
  return (
    <>
      <p>
        PathLogs UI вырос из трекера задач: доска, диаграмма Ганта, командная палитра
        и десяток примитивов писались под конкретный продукт, а потом выяснилось, что
        половина из этого нужна в каждом следующем проекте. Фреймворк — это та половина,
        вынутая из приложения и очищенная от домена.
      </p>

      <Section title="Зачем" id="why">
        <p>
          Библиотек компонентов много, и ещё одна кнопка миру не нужна. Здесь ценность
          в другом — в вещах, которые обычно пишут заново в каждом проекте и каждый раз
          спотыкаются об одни и те же грабли:
        </p>
        <ul>
          <li>
            прокрутка протяжкой, которая <strong>не ломает клик</strong> и уступает
            нативному drag&amp;drop;
          </li>
          <li>
            канбан с оптимистичным состоянием, которое <strong>не откатывается</strong>{" "}
            при быстрых переносах подряд;
          </li>
          <li>
            выпадающее меню, которое <strong>не уносит с собой диалог</strong>,
            открытый из него же;
          </li>
          <li>
            Markdown от пользователей, в котором <strong>невозможен</strong> сырой HTML
            и <code>javascript:</code>-ссылка.
          </li>
        </ul>
        <p>
          Каждая такая мелочь стоила отладки, и рядом с ней в коде лежит комментарий,
          объясняющий, что было бы иначе.
        </p>
      </Section>

      <Section title="Два способа доставки" id="split">
        <p>
          Фреймворк раздаётся двумя способами, и это не компромисс, а разделение
          по природе кода.
        </p>

        <div className="not-prose my-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-edge bg-surface p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-hover">
              npm-пакеты
            </p>
            <p className="mb-3 text-sm font-medium">Токены, хуки, примитивы</p>
            <p className="text-sm leading-relaxed text-muted">
              Их правят редко, а обновлять хочется одной командой. Версионирование
              здесь помогает.
            </p>
          </div>
          <div className="rounded-xl border border-edge bg-surface p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-hover">
              CLI-реестр
            </p>
            <p className="mb-3 text-sm font-medium">Доска, Гант, фильтры</p>
            <p className="text-sm leading-relaxed text-muted">
              Тяжёлые виджеты почти всегда требуют правок под конкретный домен. Держать
              их за стеной версионирования — значит вынуждать обходить её пропсами.
            </p>
          </div>
        </div>

        <Callout tone="why" title="Почему виджеты копируются, а не ставятся">
          Доска, которую нельзя поправить, обрастает пропсами: <code>renderCardHeader</code>,{" "}
          <code>hideAssignees</code>, <code>cardClassName</code> — и через полгода её API
          больше самого компонента. Копия в проекте снимает эту проблему целиком: нужно
          другое поведение — открой файл и напиши другое.
        </Callout>
      </Section>

      <Section title="Из чего состоит" id="parts">
        <CodeBlock
          lang="bash"
          code={`@toimetdev/pathlogs-tokens   CSS-переменные, темы, работа с цветом
@toimetdev/pathlogs-hooks    протяжка, хоткеи, SSE, опрос, тема
@toimetdev/pathlogs-core     диалоги, меню, тултипы, палитра, Markdown
@toimetdev/pathlogs-ui       CLI: копирует виджеты в проект`}
        />
        <p>
          Пакеты компонентов несут <strong>собственный CSS</strong> и не требуют Tailwind.
          Виджеты реестра, наоборот, размечены Tailwind — они попадают в ваш проект,
          где он уже настроен.
        </p>
      </Section>

      <Section title="Принципы" id="principles">
        <ul>
          <li>
            <strong>Компонент не знает о домене.</strong> Что показать — решает{" "}
            <code>renderCard</code>, что сделать — колбэк. Одна и та же доска
            обслуживает задачи, заявки и кандидатов.
          </li>
          <li>
            <strong>Логика отделена от разметки.</strong> Всё, что можно проверить
            без DOM, живёт в отдельном модуле и покрыто тестами: порядок карточек,
            критический путь, разбор Markdown, математика инерции.
          </li>
          <li>
            <strong>Цвет не единственный носитель смысла.</strong> Рядом со статусом
            всегда есть текст, у приоритета — шкала, а не только оттенок.
          </li>
          <li>
            <strong>Комментарий объясняет «почему».</strong> Если решение неочевидно,
            рядом написано, что было бы иначе.
          </li>
        </ul>

        <p>
          Дальше — <Link href="/ru/docs/installation">установка</Link>: пакеты, стили
          и скрипт темы.
        </p>
      </Section>
    </>
  );
}
