import { redirect } from "next/navigation";

/** /ru/docs без раздела ведёт на первую страницу — отдельного оглавления нет. */
export default function DocsIndex() {
  redirect("/ru/docs/introduction");
}
