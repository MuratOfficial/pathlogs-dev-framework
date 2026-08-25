import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { AvatarDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "stack", title: "Стопка" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Аватар: фото, а без него — инициалы на акцентном фоне. И стопка с нахлёстом
        для списка участников.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { Avatar, AvatarStack, initials } from "@toimetdev/pathlogs-core";

<Avatar person={user} size="md" />
<AvatarStack people={task.assignees} max={3} />

initials("Мурат Тоймет"); // "МТ"`}
        >
          <AvatarDemo />
        </Example>
      </Section>

      <Section title="Стопка" id="stack">
        <p>
          Показывает первые <code>max</code> аватаров, остальные сворачивает
          в «+N». Кольцо цвета фона отделяет соседние аватары друг от друга.
        </p>
        <Callout tone="why" title="Остаток показывает имена, а не только число">
          «+3» само по себе не отвечает на единственный вопрос, ради которого
          на него смотрят: кто эти трое. Поэтому счётчик несёт подсказку
          с их именами.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "person",
              type: "{ id: string; name: string; image?: string | null }",
              required: true,
              description: "Кого показать. Без image рисуются инициалы.",
            },
            {
              name: "size",
              type: '"xs" | "sm" | "md"',
              default: '"sm"',
              description: "Размер: 20 / 24 / 32 px.",
            },
            {
              name: "tip",
              type: "boolean",
              default: "true",
              description: "Показывать имя подсказкой при наведении.",
            },
          ]}
        />
        <p>
          <code>AvatarStack</code> принимает <code>people</code>, <code>max</code>{" "}
          (по умолчанию 3) и <code>size</code>.
        </p>
      </Section>
    </>
  );
}
