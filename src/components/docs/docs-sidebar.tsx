"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocsSearch } from "./docs-search";

type Nav = { section: string; pages: { slug: string; title: string }[] }[];

const href = (slug: string) => (slug === "index" ? "/docs" : `/docs/${slug}`);

function NavList({ nav, onNavigate }: { nav: Nav; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation" className="space-y-7">
      {nav.map((group) => (
        <div key={group.section}>
          <p className="eyebrow mb-2">{group.section}</p>
          <ul className="space-y-0.5 border-l border-border">
            {group.pages.map((p) => {
              const active = pathname === href(p.slug);
              return (
                <li key={p.slug}>
                  <Link
                    href={href(p.slug)}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "-ml-px block border-l py-1.5 pl-4 text-sm transition-colors",
                      active ? "border-ember font-semibold text-foreground" : "border-transparent text-muted-foreground hover:border-white/30 hover:text-foreground",
                    )}
                  >
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsSidebar({ nav }: { nav: Nav }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-6 overflow-y-auto pr-2 pb-10 [scrollbar-width:thin]">
          <DocsSearch />
          <NavList nav={nav} />
        </div>
      </aside>
      {/* mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex h-10 flex-1 items-center justify-between rounded-xl border border-border bg-bg-1 px-4 text-sm font-semibold"
          >
            Docs menu <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
          </button>
          <DocsSearch compact />
        </div>
        {open && (
          <div className="mt-3 rounded-2xl border border-border bg-bg-1 p-5">
            <NavList nav={nav} onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}
