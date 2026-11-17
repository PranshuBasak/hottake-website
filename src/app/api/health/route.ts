import { connection, NextResponse } from "next/server";
import { getGames } from "@/lib/games";
import { overallStatus, timed, type Check } from "@/lib/health";
import { getAdmin } from "@/lib/supabase/admin";
import { site } from "@/lib/site";

const startedAt = new Date();
const CRITICAL = ["database"] as const;

/**
 * GET /api/health: open (no auth), safe to open in a browser.
 * Checks the database, storage, the published release, votes and comments, the catalogue and configuration,
 * then records the check (count + time) and returns the result.
 */
export async function GET() {
  await connection(); // always run at request time, never prerendered
  const admin = getAdmin();
  const checks: Record<string, Check> = {};

  checks.config = {
    status: process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "ok" : "degraded",
    detail: admin ? "supabase keys present" : "SUPABASE_SECRET_KEY missing, so tracking, sign-ups and health logging are off",
  };

  const catalogue = getGames().length;
  checks.catalogue = { status: catalogue > 0 ? "ok" : "down", detail: `${catalogue} games` };

  if (!admin) {
    checks.database = { status: "down", detail: "not configured" };
    checks.storage = { status: "down", detail: "not configured" };
    checks.release = { status: "down", detail: "not configured" };
    checks.feedback = { status: "down", detail: "not configured" };
  } else {
    const [storage, release, feedback] = await Promise.all([
      timed(async () => {
        const { data, error } = await admin.storage.getBucket("releases");
        if (error) return { status: "down", detail: error.message };
        return { status: data.public ? "ok" : "degraded", detail: data.public ? "bucket 'releases' public" : "bucket 'releases' is private" };
      }),
      timed(async () => {
        const { data, error } = await admin.from("releases").select("version, url").eq("is_latest", true).maybeSingle();
        if (error) return { status: "down", detail: error.message };
        if (!data) return { status: "degraded", detail: "no release published yet (run npm run upload:release)" };
        const head = await fetch(data.url, { method: "HEAD", cache: "no-store" });
        return { status: head.ok ? "ok" : "down", detail: `v${data.version} file ${head.ok ? "reachable" : `HTTP ${head.status}`}` };
      }),
      timed(async () => {
        // Votes and comments: proves the feedback functions exist and answer.
        const { error } = await admin.rpc("vote_counts", { p_game: "health-check" });
        if (error) return { status: "degraded", detail: "votes and comments unavailable (run supabase/setup-2.sql)" };
        return { status: "ok", detail: "votes and comments reachable" };
      }),
    ]);
    checks.storage = storage;
    checks.release = release;
    checks.feedback = feedback;
  }

  const status = overallStatus(checks, CRITICAL.filter((c) => c !== "database"));

  // The database check doubles as the logger: one write that also proves reads/writes work.
  let checkCount: number | null = null;
  let previousCheckedAt: string | null = null;
  let checkedAt = new Date().toISOString();
  if (admin) {
    checks.database = await timed(async () => {
      const { data, error } = await admin.rpc("record_health_check", { p_status: status });
      if (error) return { status: "down", detail: error.message };
      const row = data?.[0];
      if (row) {
        checkCount = row.check_count;
        previousCheckedAt = row.previous_checked_at;
        checkedAt = row.checked_at;
      }
      return { status: "ok", detail: "read + write" };
    });
  }

  const finalStatus = overallStatus(checks, CRITICAL);
  return NextResponse.json(
    {
      status: finalStatus,
      service: "hottake-website",
      version: site.version,
      checked_at: checkedAt,
      check_count: checkCount,
      previous_checked_at: previousCheckedAt,
      uptime_seconds: Math.round((Date.now() - startedAt.getTime()) / 1000),
      region: process.env.VERCEL_REGION ?? "local",
      deployment: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      checks,
    },
    {
      status: finalStatus === "down" ? 503 : 200,
      headers: { "Cache-Control": "no-store, max-age=0", "Access-Control-Allow-Origin": "*" },
    },
  );
}
