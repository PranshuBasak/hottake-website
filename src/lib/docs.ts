import data from "@/data/docs.json";

export type DocHeading = { depth: number; title: string; id: string };
export type DocChunk = { id: string; title: string; text: string };
export type DocPage = {
  slug: string;
  title: string;
  description: string;
  section: string;
  order: number;
  headings: DocHeading[];
  chunks: DocChunk[];
};

const pages = data as DocPage[];

export const docsPages = (): DocPage[] => pages;
export const docPage = (slug: string): DocPage | undefined => pages.find((p) => p.slug === slug);
export const docHref = (slug: string) => (slug === "index" ? "/docs" : `/docs/${slug}`);

/** Pages grouped by section, in reading order. */
export function docsNav(): { section: string; pages: Pick<DocPage, "slug" | "title">[] }[] {
  const out: { section: string; pages: Pick<DocPage, "slug" | "title">[] }[] = [];
  for (const p of pages) {
    let g = out.find((s) => s.section === p.section);
    if (!g) out.push((g = { section: p.section, pages: [] }));
    g.pages.push({ slug: p.slug, title: p.title });
  }
  return out;
}

/** Previous and next page in reading order. */
export function docNeighbours(slug: string) {
  const i = pages.findIndex((p) => p.slug === slug);
  return { prev: i > 0 ? pages[i - 1] : undefined, next: i >= 0 && i < pages.length - 1 ? pages[i + 1] : undefined };
}
