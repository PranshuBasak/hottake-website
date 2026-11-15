import Link from "next/link";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { DocsToc } from "@/components/docs/docs-toc";
import { docHref, docNeighbours, type DocPage } from "@/lib/docs";
import { JsonLd, breadcrumbLd, ids } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const REPO = "https://github.com/PranshuBasak/hottake-website";

/** Shared frame for a docs page: title block, the MDX body, prev/next, and the on-page contents. */
export function DocArticle({ page, children }: { page: DocPage; children: React.ReactNode }) {
  const { prev, next } = docNeighbours(page.slug);
  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_200px]">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: page.title,
            description: page.description,
            url: absoluteUrl(docHref(page.slug)),
            articleSection: page.section,
            author: { "@id": ids.person },
            isPartOf: { "@id": ids.website },
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Docs", path: "/docs" },
            ...(page.slug === "index" ? [] : [{ name: page.title, path: docHref(page.slug) }]),
          ]),
        ]}
      />
      <article className="min-w-0">
        <p className="eyebrow mb-3">{page.section}</p>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{page.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{page.description}</p>
        <div className="docs-prose mt-10">{children}</div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm">
          <a href={`${REPO}/blob/main/src/content/docs/${page.slug}.mdx`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Pencil className="size-3.5" aria-hidden /> Edit this page on GitHub
          </a>
        </div>
        <nav aria-label="Previous and next" className="mt-6 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={docHref(prev.slug)} className="group rounded-2xl border border-border p-4 transition-colors hover:border-white/25">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" aria-hidden /> Previous
              </span>
              <span className="mt-1 block font-semibold">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={docHref(next.slug)} className="group rounded-2xl border border-border p-4 text-right transition-colors hover:border-white/25">
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                Next <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
              <span className="mt-1 block font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <DocsToc headings={page.headings} />
        </div>
      </aside>
    </div>
  );
}
