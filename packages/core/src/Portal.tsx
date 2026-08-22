"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Рендер в <body> мимо текущего поддерева.
 *
 * Нужен всем всплывающим слоям: диалог, отрисованный внутри колонки с
 * overflow: hidden, обрезается её границами, а z-index внутри чужого
 * stacking context не спасает.
 *
 * До монтирования ничего не рендерит: на сервере document нет, а разметка,
 * которой не было в серверном ответе, всё равно не должна появляться
 * в первом кадре гидратации.
 */
export function Portal({
  children,
  container,
}: {
  children: ReactNode;
  /** Куда рендерить. По умолчанию document.body. */
  container?: Element | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  const target = container ?? document.body;
  return createPortal(children, target);
}
