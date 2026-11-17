import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const num = (n: number) => new Intl.NumberFormat("en-GB").format(n);
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {children && <p className="mt-1 text-muted-foreground">{children}</p>}
    </header>
  );
}

export function Panel({ title, note, className, children }: { title: string; note?: string; className?: string; children: ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-2xl border border-border bg-bg-1 p-5", className)}>
      <h2 className="font-bold">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Kpi({ label, value, previous }: { label: string; value: number; previous?: number }) {
  const delta = previous === undefined ? null : previous === 0 ? (value > 0 ? 100 : 0) : Math.round(((value - previous) / previous) * 100);
  return (
    <div className="rounded-2xl border border-border bg-bg-1 p-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{num(value)}</p>
      {delta !== null && (
        <p className={cn("mt-1 flex items-center gap-1 text-xs tabular-nums", delta > 0 ? "text-ok" : delta < 0 ? "text-destructive" : "text-muted-foreground")}>
          {delta > 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : delta < 0 ? <ArrowDownRight className="size-3.5" aria-hidden /> : null}
          {delta > 0 ? "+" : ""}
          {delta}% vs previous period
        </p>
      )}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <p>{message}</p>
    </div>
  );
}

export function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-36 animate-pulse rounded-2xl bg-bg-1" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-bg-1" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-bg-1" />
    </div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-bg-2 text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {empty ? (
            <tr>
              <td colSpan={head.length} className="px-4 py-10 text-center text-muted-foreground">
                Nothing matches these filters.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
