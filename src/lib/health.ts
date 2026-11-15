export type CheckStatus = "ok" | "degraded" | "down";
export type Check = { status: CheckStatus; ms?: number; detail?: string };

/** Overall status: any critical check down → down; anything else not ok → degraded. */
export function overallStatus(checks: Record<string, Check>, critical: readonly string[]): CheckStatus {
  const entries = Object.entries(checks);
  if (entries.some(([name, c]) => critical.includes(name) && c.status === "down")) return "down";
  if (entries.some(([, c]) => c.status !== "ok")) return "degraded";
  return "ok";
}

/** Runs `fn`, timing it and turning throws/timeouts into a "down" check. */
export async function timed(fn: () => Promise<Omit<Check, "ms">>, timeoutMs = 4000): Promise<Check> {
  const t0 = performance.now();
  try {
    const result = await Promise.race([
      fn(),
      new Promise<Check>((_, reject) => setTimeout(() => reject(new Error(`timed out after ${timeoutMs} ms`)), timeoutMs)),
    ]);
    return { ...result, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { status: "down", ms: Math.round(performance.now() - t0), detail: e instanceof Error ? e.message : "failed" };
  }
}
