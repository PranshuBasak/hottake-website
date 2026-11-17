import "server-only";
import { getGames } from "./games";
import { rangeArgs, type Filters } from "./admin-filters";
import { getAdmin } from "./supabase/admin";

export type Kpis = { page_views: number; visitors: number; downloads: number; signups: number; votes: number; comments: number };
export type Slice = { label: string; value: number };
export type Overview = {
  kpis: Kpis;
  previous: Kpis;
  daily: { day: string; page_views: number; visitors: number }[];
  top_pages: { path: string; views: number }[];
  devices: { device: string; views: number }[];
};
export type Audience = {
  sessions: number;
  countries: Slice[];
  browsers: Slice[];
  os: Slice[];
  referrers: Slice[];
  utm: Slice[];
  new_vs_returning: { new: number; returning: number };
};
export type Downloads = { total: number; daily: { day: string; downloads: number }[]; countries: Slice[]; releases: Slice[] };
export type Signups = {
  total: number;
  daily: { day: string; signups: number }[];
  rows: { email: string; created_at: string; source: string | null; unsubscribed: boolean }[];
};
export type GameRow = { game_id: string; name: string; up: number; down: number; comments: number; liked: number | null };
export type Comments = {
  total: number;
  rows: { id: number; game_id: string; name: string; body: string; country: string | null; created_at: string; edited_at: string | null }[];
};
export type FilterOptions = { countries: string[]; devices: string[]; paths: string[] };

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export const PAGE_SIZE = 25;

type Rpc = (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;

async function call<T>(fn: string, args: Record<string, unknown>): Promise<Result<T>> {
  const db = getAdmin();
  if (!db) return { ok: false, error: "Supabase isn't configured for this deployment." };
  const rpc = db.rpc.bind(db) as unknown as Rpc;
  const { data, error } = await rpc(fn, args);
  if (error) {
    const missing = /could not find|does not exist|schema cache/i.test(error.message);
    return { ok: false, error: missing ? "The admin database functions are missing. Run supabase/setup-2.sql in Supabase." : error.message };
  }
  return { ok: true, data: data as T };
}

const pageArgs = (f: Filters) => ({ ...rangeArgs(f), p_device: f.device, p_path: f.path });

export const loadOverview = (f: Filters) => call<Overview>("admin_overview", pageArgs(f));
export const loadAudience = (f: Filters) => call<Audience>("admin_audience", pageArgs(f));
export const loadDownloads = (f: Filters) => call<Downloads>("admin_downloads", rangeArgs(f));
export const loadSignups = (f: Filters) =>
  call<Signups>("admin_signups", { p_from: f.from.toISOString(), p_to: f.to.toISOString(), p_search: f.q, p_page: f.page });
export const loadComments = (f: Filters) =>
  call<Comments>("admin_comments", { ...rangeArgs(f), p_game: f.game, p_search: f.q, p_page: f.page });
export const loadFilterOptions = () => call<FilterOptions>("admin_filter_options", {});

/** Every static game is listed, including ones nobody has voted on yet. */
export async function loadGames(f: Filters): Promise<Result<GameRow[]>> {
  const r = await call<{ game_id: string; up: number; down: number; comments: number }[]>("admin_games", rangeArgs(f));
  if (!r.ok) return r;
  const byId = new Map(r.data.map((g) => [g.game_id, g]));
  const rows = getGames().map((g) => {
    const s = byId.get(g.id) ?? { up: 0, down: 0, comments: 0 };
    const total = s.up + s.down;
    return { game_id: g.id, name: g.name, up: s.up, down: s.down, comments: s.comments, liked: total ? Math.round((s.up / total) * 100) : null };
  });
  return { ok: true, data: rows };
}
