import { describe, expect, it } from "vitest";
import { filtersToQuery, parseFilters } from "./admin-filters";

const now = new Date("2026-11-17T12:00:00Z");
const DAY = 86_400_000;

describe("parseFilters", () => {
  it("defaults to the last 30 days with no other filters", () => {
    const f = parseFilters({}, now);
    expect(f.range).toBe("30d");
    expect(f.to.getTime()).toBe(now.getTime());
    expect(now.getTime() - f.from.getTime()).toBe(30 * DAY);
    expect(f).toMatchObject({ country: null, device: null, path: null, game: null, q: null, page: 1 });
  });

  it("honours a preset range", () => {
    const f = parseFilters({ range: "7d" }, now);
    expect(f.range).toBe("7d");
    expect(now.getTime() - f.from.getTime()).toBe(7 * DAY);
  });

  it("falls back to the default when dates are garbage", () => {
    const f = parseFilters({ range: "custom", from: "garbage", to: "nope" }, now);
    expect(f.range).toBe("30d");
  });

  it("reads a custom range as whole days and swaps reversed dates", () => {
    const f = parseFilters({ range: "custom", from: "2026-11-10", to: "2026-11-01" }, now);
    expect(f.range).toBe("custom");
    expect(f.from.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(f.to.toISOString()).toBe("2026-11-11T00:00:00.000Z");
  });

  it("keeps valid dimensions and drops invalid ones", () => {
    expect(parseFilters({ country: "in" }, now).country).toBe("IN");
    expect(parseFilters({ country: "xx1" }, now).country).toBeNull();
    expect(parseFilters({ device: "mobile" }, now).device).toBe("mobile");
    expect(parseFilters({ device: "toaster" }, now).device).toBeNull();
    expect(parseFilters({ path: "/games/quiplash" }, now).path).toBe("/games/quiplash");
    expect(parseFilters({ path: "javascript:alert(1)" }, now).path).toBeNull();
    expect(parseFilters({ game: "hot-seat" }, now).game).toBe("hot-seat");
    expect(parseFilters({ game: "../etc" }, now).game).toBeNull();
    expect(parseFilters({ page: "-4" }, now).page).toBe(1);
    expect(parseFilters({ page: "3" }, now).page).toBe(3);
    expect(parseFilters({ q: "  hi  " }, now).q).toBe("hi");
  });

  it("takes the first value when a key repeats", () => {
    expect(parseFilters({ range: ["90d", "7d"] }, now).range).toBe("90d");
  });
});

describe("filtersToQuery", () => {
  it("writes only what differs from the defaults, and can override keys", () => {
    const f = parseFilters({ range: "7d", country: "IN", page: "2" }, now);
    expect(filtersToQuery(f)).toBe("?range=7d&country=IN&page=2");
    expect(filtersToQuery(f, { page: null })).toBe("?range=7d&country=IN");
    expect(filtersToQuery(parseFilters({}, now))).toBe("");
  });
});
