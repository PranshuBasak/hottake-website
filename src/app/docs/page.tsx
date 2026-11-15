import type { Metadata } from "next";
import Content from "@/content/docs/index.mdx";
import { DocArticle } from "@/components/docs/doc-article";
import { docPage } from "@/lib/docs";

const page = docPage("index")!;

export const metadata: Metadata = {
  title: "Documentation",
  description: page.description,
  alternates: { canonical: "/docs" },
  openGraph: { url: "/docs", title: "HotTake documentation", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HotTake" }] },
};

export default function DocsIndex() {
  return (
    <DocArticle page={page}>
      <Content />
    </DocArticle>
  );
}
