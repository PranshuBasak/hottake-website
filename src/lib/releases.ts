import "server-only";
import { cacheLife } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { site } from "./site";
import type { ReleaseRow } from "./download";

/** Latest published release (public read via RLS, so the publishable key is enough). */
export async function getLatestRelease(): Promise<ReleaseRow | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 3600 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("releases")
      .select("id, version, file_name, url, size_bytes, sha256, notes, published_at")
      .eq("is_latest", true)
      .maybeSingle();
    if (error) return null;
    return (data as ReleaseRow | null) ?? null;
  } catch {
    return null;
  }
}

/** What the download page shows when Supabase has no release row yet. */
export const fallbackRelease = {
  version: site.version,
  file_name: site.installerName,
  size_label: `${site.installerSizeMb} MB`,
};
