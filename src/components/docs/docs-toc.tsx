"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { DocHeading } from "@/lib/docs";

/** "On this page": headings of the current doc, highlighting the one being read. */
export function DocsToc({ headings }: { headings: DocHeading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (!headings.length) return null;
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="eyebrow mb-3">On this page</p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.depth === 3 ? "pl-3" : ""}>
            <a
              href={`#${h.id}`}
              className={cn("block leading-snug transition-colors", active === h.id ? "text-amber" : "text-muted-foreground hover:text-foreground")}
            >
              {h.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
