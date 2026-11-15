"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CommandPalette, type CommandItem } from "@/components/interior/command-palette";
import { docsPages } from "@/lib/docs";
import { cn } from "@/lib/utils";

/** Ctrl/⌘ K (or /) opens a command palette over every docs heading. */
export function DocsSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = useMemo<CommandItem[]>(
    () =>
      docsPages().flatMap((p) => [
        { id: p.slug, label: p.title, hint: p.section, keywords: p.description },
        ...p.chunks
          .filter((c) => c.id)
          .map((c) => ({ id: `${p.slug}#${c.id}`, label: c.title, hint: p.title, keywords: c.text })),
      ]),
    [],
  );

  // The palette animates in, so its own autofocus can fire before the input is focusable: focus it once open.
  useEffect(() => {
    if (!open) return;
    const t = [0, 60, 180].map((ms) => setTimeout(() => document.querySelector<HTMLInputElement>("[data-docs-search] input")?.focus(), ms));
    return () => t.forEach(clearTimeout);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /input|textarea|select/i.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 items-center gap-2 rounded-xl border border-border bg-bg-1 px-3 text-sm text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground",
          compact ? "w-10 justify-center px-0" : "w-full",
        )}
        aria-label="Search the docs"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        {!compact && (
          <>
            <span className="flex-1 text-left">Search docs</span>
            <kbd className="rounded-md border border-border px-1.5 font-mono text-[11px]">Ctrl K</kbd>
          </>
        )}
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div data-docs-search className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <CommandPalette
              items={items}
              open
              autoFocus
              label="Search the docs"
              placeholder="Search architecture, SDK, building…"
              emptyLabel="Nothing matches. Try another word."
              maxRows={8}
              onDismiss={() => setOpen(false)}
              onSelect={(item) => {
                setOpen(false);
                const [slug, hash] = item.id.split("#");
                router.push(`${slug === "index" ? "/docs" : `/docs/${slug}`}${hash ? `#${hash}` : ""}`);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
