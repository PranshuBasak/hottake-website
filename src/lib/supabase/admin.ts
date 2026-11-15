import "server-only";
import { createAdminClient } from "@supabase/server/core";
import type { Database } from "./types";

type Admin = ReturnType<typeof createAdminClient<Database>>;

/**
 * Server-only Supabase client with the secret key (bypasses RLS).
 * Returns null when SUPABASE_URL / SUPABASE_SECRET_KEY are not configured, so pages keep
 * working (and simply don't record) on a fresh checkout or a preview without secrets.
 */
export function getAdmin(): Admin | null {
  try {
    return createAdminClient<Database>();
  } catch {
    return null;
  }
}
