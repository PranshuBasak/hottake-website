import type { Metadata } from "next";
import { share } from "@/lib/share";
import Content from "@/content/docs/index.mdx";
import { DocArticle } from "@/components/docs/doc-article";
import { docPage } from "@/lib/docs";

const page = docPage("index")!;

export const metadata: Metadata = {
  title: "Documentation",
  description: page.description,
  alternates: { canonical: "/docs" },
  ...share({ path: "/docs", title: "HotTake documentation", description: page.description }),
};

export default function DocsIndex() {
  return (
    <DocArticle page={page}>
      <Content />
    </DocArticle>
  );
}
