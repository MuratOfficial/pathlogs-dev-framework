import { Callout, CodeBlock, PropsTable, Section } from "@/components/docs";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "single-source", title: "Один список" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Экран справки по горячим клавишам, открывается по «?». Собирается из того же
        массива, который отдан обработчику.
      </p>

      <Section title="Пример" id="example">
        <CodeBlock
          code={`import { HotkeysHelp } from "@toimetdev/pathlogs-core";

const hotkeys = [
  { keys: "g d", label: "Проекты", group: "Навигация", handler: () => router.push("/dashboard") },
  { keys: "g m", label: "Мои задачи", group: "Навигация", handler: () => router.push("/my") },
  { keys: "d", label: "Отметить выполненной", group: "Доска", handler: markDone },
  { keys: "mod+k", label: "Поиск", allowInInput: true, handler: openPalette },
];

<HotkeysHelp hotkeys={hotkeys} hint="«g» — лидер: нажмите g, затем вторую клавишу." />`}
        />
        <p>
          Отдельно вызывать <code>useHotkeys</code> не нужно — компонент делает это
          сам и добавляет к списку клавишу вызова справки.
        </p>
      </Section>

      <Section title="Один список" id="single-source">
        <Callout tone="why" title="Почему справка не отдельная таблица">
          Таблица «клавиша → описание», написанная рядом с обработчиками, живёт
          ровно до первого изменения. Клавишу переназначили, справку поправить
          забыли — и она врёт, причём заметить это некому: в справку заглядывают
          редко.
          <br />
          <br />
          Здесь источник один. Появилась клавиша с <code>label</code> — она сразу
          в справке. Исчезла — исчезла и оттуда.
        </Callout>
        <p>
          В справку попадают только записи с подписью. Клавиши без{" "}
          <code>label</code> считаются служебными — закрыть окно, подтвердить, —
          и в списке были бы шумом.
        </p>
        <p>
          Разделы идут в порядке первого появления, а не по алфавиту: так виден
          замысел автора, а алфавит перемешал бы связанные группы.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "hotkeys",
              type: "Hotkey[]",
              required: true,
              description: "Тот же список, что отдан бы в useHotkeys.",
            },
            {
              name: "hotkey",
              type: "string",
              default: '"?"',
              description: "Клавиша вызова справки.",
            },
            {
              name: "title",
              type: "string",
              default: '"Keyboard shortcuts"',
              description: "Заголовок окна.",
            },
            {
              name: "hint",
              type: "string",
              description: "Пояснение внизу — например, про клавишу-лидер.",
            },
          ]}
        />
        <p>
          Записи вроде <code>mod</code>, <code>arrowup</code> и{" "}
          <code>escape</code> показываются как ⌘/Ctrl, ↑ и Esc: имя события
          читается хуже, чем сам символ.
        </p>
      </Section>
    </>
  );
}
