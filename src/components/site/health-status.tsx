"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, TriangleAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Check = { status: "ok" | "degraded" | "down"; ms?: number; detail?: string };
type Health = {
  status: Check["status"];
  version: string;
  checked_at: string;
  check_count: number | null;
  previous_checked_at: string | null;
  uptime_seconds: number;
  region: string;
  deployment: string | null;
  checks: Record<string, Check>;
};

const NAMES: Record<string, string> = {
  database: "Database (read + write)",
  storage: "File storage",
  release: "Installer download",
  config: "Configuration",
  catalogue: "Game catalogue",
};

const TONE = {
  ok: { icon: CheckCircle2, cls: "text-ok", label: "Operational" },
  degraded: { icon: TriangleAlert, cls: "text-warn", label: "Degraded" },
  down: { icon: XCircle, cls: "text-destructive", label: "Down" },
} as const;

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "never");

/** Calls /api/health from the browser and shows the result; "Run again" repeats it. */
export function HealthStatus() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      setData((await res.json()) as Health);
    } catch {
      setError("The status check itself could not be reached.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Kick off the first check once mounted; run() only sets state after the request resolves.
    const t = setTimeout(run, 0);
    return () => clearTimeout(t);
  }, [run]);

  const tone = data ? TONE[data.status] : null;

  return (
    <div className="mt-10 space-y-6" aria-live="polite" aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-bg-1 p-6">
        <div className="flex items-center gap-3">
          {loading && !data ? (
            <Loader2 className="size-7 animate-spin text-muted-foreground" aria-hidden />
          ) : tone ? (
            <tone.icon className={cn("size-7", tone.cls)} aria-hidden />
          ) : (
            <XCircle className="size-7 text-destructive" aria-hidden />
          )}
          <div>
            <p className="text-xl font-bold">{error ? "Unreachable" : tone ? (data!.status === "ok" ? "All systems operational" : tone.label) : "Checking…"}</p>
            {data && (
              <p className="text-sm text-muted-foreground">
                Checked {when(data.checked_at)} · check #{data.check_count ?? "–"} · previous {when(data.previous_checked_at)}
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold hover:border-white/30 disabled:opacity-60"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden /> Run again
        </button>
      </div>

      {data && (
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-bg-1">
          {Object.entries(data.checks).map(([key, c]) => {
            const t = TONE[c.status];
            return (
              <li key={key} className="flex items-start gap-3 p-5">
                <t.icon className={cn("mt-0.5 size-5 shrink-0", t.cls)} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{NAMES[key] ?? key}</p>
                  {c.detail && <p className="mt-0.5 text-sm break-words text-muted-foreground">{c.detail}</p>}
                </div>
                <div className="text-right text-sm">
                  <p className={t.cls}>{t.label}</p>
                  {c.ms !== undefined && <p className="text-muted-foreground">{c.ms} ms</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data && (
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            ["Version", data.version],
            ["Region", data.region],
            ["Deployment", data.deployment ?? "local"],
            ["Uptime", `${Math.round(data.uptime_seconds / 60)} min`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-border p-4">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-mono">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
