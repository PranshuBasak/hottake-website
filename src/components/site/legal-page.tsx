"use client";

import { useRef } from "react";
import { ReadingProgress } from "@/components/interior/reading-progress";
import { ScrollSpy, type ScrollSpySection } from "@/components/interior/scroll-spy";
import { site } from "@/lib/site";

/**
 * Shell for long-form legal pages: title block, sticky table of contents (scroll-spy),
 * a reading-progress bar, and typographic styles for the prose children.
 * Each section in `children` must be a <section id="..."> matching an entry in `sections`.
 */
export function LegalPage({
  title,
  intro,
  sections,
  children,
}: {
  title: string;
  intro: string;
  sections: ScrollSpySection[];
  children: React.ReactNode;
}) {
  const article = useRef<HTMLElement>(null);
  return (
    <div className="container-site pt-32 pb-24">
      <div className="fixed inset-x-0 top-0 z-40 h-1">
        <ReadingProgress target={article} className="h-1" />
      </div>
      <header className="max-w-3xl">
        <p className="eyebrow mb-3">Legal · last updated {site.legal.updated}</p>
        <h1 className="text-4xl font-extrabold sm:text-6xl">{title}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{intro}</p>
      </header>
      <div className="mt-12 max-w-3xl">
        <div className="sticky top-[76px] z-30 mb-10 rounded-[12px] bg-bg-0/80 backdrop-blur">
          <ScrollSpy sections={sections} offset={140} label="On this page" />
        </div>
        <article
          ref={article}
          className="prose-legal max-w-3xl space-y-12 [&_a]:text-amber [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_li]:mt-1.5 [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_section]:scroll-mt-36 [&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-border [&_td]:p-3 [&_td]:align-top [&_td]:text-muted-foreground [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground"
        >
          {children}
        </article>
      </div>
    </div>
  );
}
