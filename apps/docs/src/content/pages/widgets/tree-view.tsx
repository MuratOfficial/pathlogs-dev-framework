import { Callout, CodeBlock, Example, PropsTable, Section } from "@/components/docs";
import { TreeViewDemo } from "@/demos/newwidgets";

export const toc = [
  { id: "install", title: "Установка" },
  { id: "example", title: "Пример" },
  { id: "props", title: "Пропсы" },
  { id: "checks", title: "Tri-state чекбоксы" },
  { id: "logic", title: "Модель отдельно" },
];

export default function Page() {
  return (
    <>
      <p>
        Дерево с клавиатурной навигацией, tri-state чекбоксами и переносом узлов
        мышью. В shadcn/ui дерева нет вовсе — а нужно оно постоянно: файлы,
        разделы, вложенные задачи.
      </p>

      <Section title="Установка" id="install">
        <CodeBlock lang="bash" code="npx @toimetdev/pathlogs-ui add tree-view" />
      </Section>

      <Section title="Пример" id="example">
        <Example
          code={`<TreeView
  nodes={tree}
  expanded={expanded}
  onExpandedChange={setExpanded}
  checkable
  checked={checked}
  onCheckedChange={setChecked}
  onMove={(next) => setTree(next)}
  renderLabel={(node) => node.name}
/>`}
        >
          <TreeViewDemo />
        </Example>
        <p>
          Стрелки двигают фокус и разворачивают ветки, пробел ставит галочку,
          перетаскивание меняет вложенность.
        </p>
      </Section>

      <Section title="Пропсы" id="props">
        <PropsTable
          rows={[
            { name: "nodes", type: "N[]", required: true, description: "Дерево. У узла нужны id и children." },
            { name: "renderLabel", type: "(node, meta) => ReactNode", required: true, description: "Подпись узла." },
            { name: "renderIcon", type: "(node, expanded) => ReactNode", description: "Иконка слева." },
            { name: "expanded / onExpandedChange", type: "Set<string> / (set) => void", description: "Развёрнутые узлы." },
            { name: "checkable", type: "boolean", default: "false", description: "Включить чекбоксы с tri-state." },
            { name: "checked / onCheckedChange", type: "Set<string> / (set) => void", description: "Отмеченные узлы." },
            { name: "onMove", type: "(nodes, moved) => void", description: "Перенос узла мышью. Без него дерево только для чтения." },
            { name: "onActivate", type: "(node) => void", description: "Клик или Enter по узлу." },
          ]}
        />
      </Section>

      <Section title="Tri-state чекбоксы" id="checks">
        <Callout tone="why" title="Родитель выводит состояние из детей">
          Родительский узел не хранит своё состояние, а вычисляет его: все дети
          отмечены — «включён», часть — «частично», никого — «выключен». Иначе
          после снятия одной галочки в глубине родитель остался бы отмеченным
          и соврал бы о содержимом ветки. Нажатие на «частично» включает всё
          поддерево — это читается как «хочу всё».
        </Callout>
        <Callout tone="why" title="Узел нельзя перенести в собственного потомка">
          Такая операция отрезала бы поддерево от дерева, и оно исчезло бы целиком.
          Проверка встроена в <code>canDrop</code>: недопустимый перенос просто
          не выполняется.
        </Callout>
      </Section>

      <Section title="Модель отдельно" id="logic">
        <CodeBlock
          code={`import {
  flattenTree,    // дерево → плоский список видимых строк (для виртуализации)
  moveNode,       // перенос с запретом переноса в потомка
  checkStates,    // tri-state для всего дерева
  treeKeyAction,  // клавиатура по ARIA
  filterTree,     // поиск с сохранением предков
} from "@/components/ui/tree-view/treeModel";`}
        />
      </Section>
    </>
  );
}
