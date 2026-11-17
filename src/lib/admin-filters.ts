/** Admin dashboard filters live in the URL so every view can be bookmarked and shared. */

export type Range = "7d" | "30d" | "90d" | "custom";
export type Device = "desktop" | "mobile" | "tablet";

export type Filters = {
  from: Date;
  to: Date;
  range: Range;
  country: string | null;
  device: Device | null;
  path: string | null;
  game: string | null;
  q: string | null;
  page: number;
};

type SP = Record<string, string | string[] | undefined>;

const DAY = 86_400_000;
const PRESETS: Record<Exclude<Range, "custom">, number> = { "7d": 7, "30d": 30, "90d": 90 };
const DEVICES: Device[] = ["desktop", "mobile", "tablet"];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

function day(v: string | undefined): Date | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseFilters(sp: SP, now: Date): Filters {
  const country = one(sp.country)?.toUpperCase();
  const device = one(sp.device) as Device | undefined;
  const path = one(sp.path);
  const game = one(sp.game);
  const q = one(sp.q)?.slice(0, 100);
  const page = Number(one(sp.page));
  const base = {
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
    device: device && DEVICES.includes(device) ? device : null,
    path: path && /^\/[\w\-./]{0,200}$/.test(path) ? path : null,
    game: game && /^[a-z0-9-]{2,40}$/.test(game) ? game : null,
    q: q || null,
    page: Number.isInteger(page) && page > 0 && page < 10_000 ? page : 1,
  };

  const range = one(sp.range);
  if (range === "custom") {
    let from = day(one(sp.from));
    let to = day(one(sp.to));
    if (from && to) {
      if (to < from) [from, to] = [to, from];
      // `to` is inclusive in the URL, exclusive in queries.
      return { ...base, range: "custom", from, to: new Date(to.getTime() + DAY) };
    }
  }
  const preset = range && range in PRESETS ? (range as keyof typeof PRESETS) : "30d";
  return { ...base, range: preset, from: new Date(now.getTime() - PRESETS[preset] * DAY), to: now };
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

/** Builds `?…` for a link, keeping current filters; pass `null` to drop a key. Defaults are left out. */
export function filtersToQuery(f: Filters, override: Partial<Record<keyof Filters, string | number | null>> = {}): string {
  const p = new URLSearchParams();
  const raw: Record<string, string | number | null> = {
    range: f.range === "30d" ? null : f.range,
    from: f.range === "custom" ? ymd(f.from) : null,
    to: f.range === "custom" ? ymd(new Date(f.to.getTime() - DAY)) : null,
    country: f.country,
    device: f.device,
    path: f.path,
    game: f.game,
    q: f.q,
    page: f.page > 1 ? f.page : null,
    ...override,
  };
  for (const [k, v] of Object.entries(raw)) if (v !== null && v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Arguments shared by the admin SQL functions. */
export function rangeArgs(f: Filters) {
  return { p_from: f.from.toISOString(), p_to: f.to.toISOString(), p_country: f.country };
}
