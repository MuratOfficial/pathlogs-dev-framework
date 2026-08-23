import { Callout, Example, PropsTable, Section } from "@/components/docs";
import { ThemeToggleDemo } from "@/demos/basics";

export const toc = [
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
];

export default function Page() {
  return (
    <>
      <p>
        Переключатель светлой и тёмной темы. Тот же, что стоит в шапке этого сайта.
      </p>

      <Section title="Пример" id="example">
        <Example
          code={`import { ThemeToggle } from "@toimetdev/pathlogs-core";

<ThemeToggle
  labels={{ toDark: "Тёмная тема", toLight: "Светлая тема", action: "Переключить тему" }}
/>`}
        >
          <ThemeToggleDemo />
        </Example>
        <p>
          Иконки лежат друг на друге и меняются поворотом — переключение читается
          как одно движение, а не как подмена картинки.
        </p>
        <Callout tone="warn" title="Нужен скрипт темы в head">
          Без <code>themeScript()</code> из <code>@toimetdev/pathlogs-tokens</code>{" "}
          страница мигнёт чужой темой при каждой загрузке: атрибут появится только
          после гидратации. Подробности — в разделе{" "}
          <a href="/docs/theming">«Темы и токены»</a>.
        </Callout>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            {
              name: "storageKey",
              type: "string",
              default: '"theme"',
              description: (
                <>
                  Ключ в <code>localStorage</code>. Должен совпадать с ключом,
                  переданным в <code>themeScript()</code>.
                </>
              ),
            },
            {
              name: "labels",
              type: "{ toDark?, toLight?, action? }",
              description:
                "Подсказка при наведении в каждом из состояний и доступное имя кнопки.",
            },
            { name: "className", type: "string", description: "Дополнительные классы." },
          ]}
        />
        <p>
          Свой переключатель — с тремя состояниями, с выпадающим списком — делается
          на хуке <code>useTheme</code>: он отдаёт и выбор пользователя, и то,
          что видно на экране.
        </p>
      </Section>
    </>
  );
}
