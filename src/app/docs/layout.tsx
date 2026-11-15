import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { docsNav } from "@/lib/docs";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="container-site grid gap-10 pt-28 pb-20 lg:grid-cols-[240px_minmax(0,1fr)] xl:gap-14">
      <DocsSidebar nav={docsNav()} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
