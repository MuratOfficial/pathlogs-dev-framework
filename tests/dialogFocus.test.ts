// @vitest-environment jsdom
import { createElement as h, useState, type ReactElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Dialog } from "@toimetdev/pathlogs-core";

// React 19 просит этот флаг, иначе act() ругается в консоль.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(element: ReactElement) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(element);
  });
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container?.remove();
  container = null;
  root = null;
});

/** Печать в поле: React слушает нативный input, поэтому value ставим сеттером прототипа. */
function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/**
 * Окно с двумя полями и намеренно инлайновым onClose — именно так его пишет
 * вызывающий код. Если эффект фокуса зависит от onClose, ввод во втором поле
 * перебрасывает курсор на первое.
 */
function Form() {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  return h(
    Dialog,
    { open: true, onClose: () => {}, title: "Форма" },
    h("input", {
      id: "first",
      value: first,
      onChange: (e: { target: { value: string } }) => setFirst(e.target.value),
    }),
    h("input", {
      id: "second",
      value: second,
      onChange: (e: { target: { value: string } }) => setSecond(e.target.value),
    })
  );
}

describe("Dialog: фокус при вводе", () => {
  it("не уводит фокус на первое поле после каждого символа", () => {
    render(h(Form));

    const second = document.getElementById("second") as HTMLInputElement;
    second.focus();
    expect(document.activeElement).toBe(second);

    type(second, "П");
    expect(document.activeElement).toBe(second);

    type(second, "Пр");
    type(second, "При");
    expect(document.activeElement).toBe(second);
    expect(second.value).toBe("При");
  });

  it("при открытии всё ещё ставит фокус на первый интерактивный элемент", () => {
    render(h(Form));
    expect((document.activeElement as HTMLElement).id).toBe("first");
  });

  it("Escape закрывает окно свежим обработчиком, а не тем, что был при открытии", () => {
    const calls: string[] = [];

    function Host() {
      const [text, setText] = useState("");
      return h(
        Dialog,
        // Обработчик пересоздаётся на каждый рендер и замыкает текущий текст:
        // проверяем, что окно зовёт последний, а не сохранённый при монтировании.
        { open: true, onClose: () => calls.push(text), title: "Форма" },
        h("input", {
          id: "field",
          value: text,
          onChange: (e: { target: { value: string } }) => setText(e.target.value),
        })
      );
    }

    render(h(Host));
    type(document.getElementById("field") as HTMLInputElement, "ок");

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });

    expect(calls).toEqual(["ок"]);
  });

  it("после закрытия возвращает фокус туда, где он был", () => {
    const trigger = document.createElement("button");
    trigger.id = "trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    function Host() {
      const [open, setOpen] = useState(true);
      return h(
        Dialog,
        { open, onClose: () => setOpen(false), title: "Форма" },
        h("input", { id: "field", readOnly: true, value: "" })
      );
    }

    render(h(Host));
    expect((document.activeElement as HTMLElement).id).toBe("field");

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });

    expect((document.activeElement as HTMLElement).id).toBe("trigger");
    trigger.remove();
  });

  it("busy блокирует закрытие по Escape", () => {
    const calls: string[] = [];
    render(
      h(
        Dialog,
        { open: true, busy: true, onClose: () => calls.push("closed"), title: "Форма" },
        h("input", { id: "field", readOnly: true, value: "" })
      )
    );

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });

    expect(calls).toEqual([]);
  });
});
