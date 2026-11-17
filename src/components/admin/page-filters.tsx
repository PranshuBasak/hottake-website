import "server-only";
import { parseFilters, type Filters } from "@/lib/admin-filters";
import { loadFilterOptions } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-session";
import { getGames } from "@/lib/games";
import { FilterBar, type Dimension } from "./filter-bar";

type SP = Record<string, string | string[] | undefined>;

/** Checks the session, reads the filters from the URL and renders the filter bar for one page. */
export async function adminFilters(searchParams: Promise<SP>, dims: Dimension[], searchLabel?: string) {
  await requireAdmin();
  const sp = await searchParams;
  const f: Filters = parseFilters(sp, new Date());
  const opts = await loadFilterOptions();
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const one = Array.isArray(v) ? v[0] : v;
    if (one) query[k] = one;
  }
  const bar = (
    <FilterBar
      query={query}
      dims={dims}
      searchLabel={searchLabel}
      options={{
        country: opts.ok ? opts.data.countries : [],
        device: opts.ok && opts.data.devices.length ? opts.data.devices : ["desktop", "mobile", "tablet"],
        path: opts.ok ? opts.data.paths : [],
        game: getGames().map((g) => ({ value: g.id, label: g.name })),
      }}
    />
  );
  return { f, bar, query };
}
