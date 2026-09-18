import { redirect } from "next/navigation";

/** /docs без раздела ведёт на первую страницу — отдельного оглавления нет. */
export default function DocsIndex() {
  redirect("/docs/introduction");
}
