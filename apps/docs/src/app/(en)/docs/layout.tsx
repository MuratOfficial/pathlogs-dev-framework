import { DocsShell } from "@/views/DocsArticle";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell lang="en">{children}</DocsShell>;
}
