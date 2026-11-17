"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectTrigger, SelectValue } from "@ui-sdk/react/select";
import { cn } from "@/lib/utils";

export type Dimension = "country" | "device" | "path" | "game" | "q";

export type FilterBarProps = {
  /** Current query, as plain strings. */
  query: Record<string, string>;
  /** What each dimension can be set to. */
  options: { country: string[]; device: string[]; path: string[]; game: { value: string; label: string }[] };
  /** Dimensions this page can filter by. The rest show disabled. */
  dims: Dimension[];
  searchLabel?: string;
};

const ALL = "__all";
const LABELS: Record<Exclude<Dimension, "q">, string> = { country: "Country", device: "Device", path: "Page", game: "Game" };

const control =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-bg-0 px-3 text-sm text-foreground outline-none transition-colors hover:border-white/25 focus-visible:border-amber data-disabled:cursor-not-allowed data-disabled:opacity-45";

export function FilterBar({ query, options, dims, searchLabel = "Search" }: FilterBarProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const range = query.range ?? "30d";
  const [from, setFrom] = useState(query.from ?? "");
  const [to, setTo] = useState(query.to ?? "");
  const [q, setQ] = useState(query.q ?? "");

  const go = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(query);
    p.delete("page");
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "" || v === ALL) p.delete(k);
      else p.set(k, v);
    }
    if (p.get("range") === "30d") p.delete("range");
    if (p.get("range") !== "custom") {
      p.delete("from");
      p.delete("to");
    }
    const s = p.toString();
    start(() => router.push(s ? `?${s}` : "?", { scroll: false }));
  };

  const select = (dim: Exclude<Dimension, "q">) => {
    const enabled = dims.includes(dim);
    const items =
      dim === "game" ? options.game : options[dim].map((v) => ({ value: v, label: dim === "device" ? v[0].toUpperCase() + v.slice(1) : v }));
    return (
      <Field key={dim} className="min-w-0">
        <FieldLabel className="mb-1 block text-xs font-semibold text-muted-foreground">{LABELS[dim]}</FieldLabel>
        <Select
          value={enabled ? (query[dim] ?? ALL) : ALL}
          onValueChange={(v) => go({ [dim]: (v as string | null) ?? null })}
          disabled={!enabled}
        >
          <SelectTrigger className={cn(control, "w-full min-w-36 justify-between")} title={enabled ? undefined : "Doesn't apply to this page"}>
            <SelectValue className="truncate" />
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </SelectTrigger>
          <SelectContent className="max-h-72 min-w-(--anchor-width) overflow-auto rounded-xl border border-border bg-bg-2 p-1 shadow-xl">
            <Item value={ALL}>All</Item>
            {items.map((i) => (
              <Item key={i.value} value={i.value}>
                {i.label}
              </Item>
            ))}
          </SelectContent>
        </Select>
      </Field>
    );
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-bg-1 p-4 transition-opacity", pending && "opacity-70")} aria-busy={pending}>
      <div className="flex flex-wrap items-end gap-4">
        <Field>
          <FieldLabel className="mb-1 block text-xs font-semibold text-muted-foreground">Date range</FieldLabel>
          <SegmentedControl
            value={range}
            onValueChange={(v) => v && go({ range: v, ...(v === "custom" ? { from: from || isoDaysAgo(29), to: to || isoDaysAgo(0) } : {}) })}
            className="relative isolate inline-flex h-10 rounded-xl border border-border bg-bg-0 p-1"
          >
            <SegmentedControlIndicator className="absolute -z-10 top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-lg bg-ember/20 ring-1 ring-ember/50 transition-[top,left,width,height] duration-200 motion-reduce:transition-none" />
            {[
              ["7d", "7 days"],
              ["30d", "30 days"],
              ["90d", "90 days"],
              ["custom", "Custom"],
            ].map(([v, l]) => (
              <SegmentedControlItem
                key={v}
                value={v}
                className="rounded-lg px-3 text-sm font-semibold text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-amber data-checked:text-foreground"
              >
                {l}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </Field>

        {range === "custom" && (
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              go({ range: "custom", from, to });
            }}
          >
            <DateField label="From" value={from} onChange={setFrom} />
            <DateField label="To" value={to} onChange={setTo} />
            <Button type="submit" className={cn(control, "font-semibold")}>
              Apply
            </Button>
          </form>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(["country", "device", "path", "game"] as const).map(select)}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go({ q: q.trim() || null });
          }}
        >
          <Field disabled={!dims.includes("q")}>
            <FieldLabel className="mb-1 block text-xs font-semibold text-muted-foreground">{searchLabel}</FieldLabel>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={q}
                onValueChange={setQ}
                placeholder={dims.includes("q") ? "Press Enter to search" : "Not on this page"}
                className={cn(control, "w-full pl-9")}
              />
            </div>
          </Field>
        </form>
      </div>
    </div>
  );
}

function Item({ value, children }: { value: string; children: ReactNode }) {
  return (
    <SelectItem
      value={value}
      className="flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-white/8 data-selected:font-semibold"
    >
      <span className="truncate">{children}</span>
      <SelectItemIndicator>
        <Check className="size-4 text-amber" aria-hidden />
      </SelectItemIndicator>
    </SelectItem>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} required className={cn(control, "[color-scheme:dark]")} />
    </label>
  );
}

function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}
