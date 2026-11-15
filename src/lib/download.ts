export type ReleaseRow = {
  id: number;
  version: string;
  file_name: string;
  url: string;
  size_bytes: number;
  sha256: string;
  notes: string | null;
  published_at: string;
};

export const DOWNLOAD_FALLBACK = "/download?error=unavailable";

/** Where `/api/download` sends the visitor. Only https file URLs are allowed. */
export function resolveDownload(release: Pick<ReleaseRow, "id" | "url"> | null): string {
  if (!release) return DOWNLOAD_FALLBACK;
  try {
    const u = new URL(release.url);
    return u.protocol === "https:" ? u.toString() : DOWNLOAD_FALLBACK;
  } catch {
    return DOWNLOAD_FALLBACK;
  }
}

export function formatBytes(n: number): string {
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
