"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination";

const step =
  "inline-flex size-9 items-center justify-center rounded-lg border border-border text-sm font-semibold tabular-nums transition-colors hover:border-white/30 data-current:border-ember data-current:bg-ember/15 data-disabled:opacity-40";

/** Page links for a server-rendered table. `base` is the current query without `page`. */
export function Pager({ page, total, pageSize, base }: { page: number; total: number; pageSize: number; base: string }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams(base.replace(/^\?/, ""));
    if (p > 1) qs.set("page", String(p));
    else qs.delete("page");
    const s = qs.toString();
    return s ? `?${s}` : "?";
  };
  return (
    <Pagination aria-label="Pages" page={Math.min(page, pageCount)} pageCount={pageCount} getHref={href} className="mt-4">
      <PaginationList className="flex flex-wrap items-center gap-1.5">
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious className={step} render={<Link href="?" scroll={false} />}>
                <ChevronLeft className="size-4" aria-hidden />
                <span className="sr-only">Previous</span>
              </PaginationPrevious>
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink page={item} className={step} render={<Link href="?" scroll={false} />} />
                ) : (
                  <PaginationEllipsis className="px-1 text-muted-foreground" />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext className={step} render={<Link href="?" scroll={false} />}>
                <span className="sr-only">Next</span>
                <ChevronRight className="size-4" aria-hidden />
              </PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  );
}
