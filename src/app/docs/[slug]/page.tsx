import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/doc-article";
import { docPage, docsPages } from "@/lib/docs";

export function generateStaticParams() {
  return docsPages()
    .filter((p) => p.slug !== "index")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = docPage(slug);
  if (!page || slug === "index") return {};
  return {
    title: `${page.title} · Docs`,
    description: page.description,
    alternates: { canonical: `/docs/${slug}` },
    openGraph: {
      url: `/docs/${slug}`,
      type: "article",
      title: `${page.title} · HotTake docs`,
      description: page.description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HotTake" }],
    },
  };
}

export default async function DocPageRoute({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const page = docPage(slug);
  if (!page || slug === "index") notFound();
  const { default: Content } = await import(`@/content/docs/${slug}.mdx`);
  return (
    <DocArticle page={page}>
      <Content />
    </DocArticle>
  );
}
