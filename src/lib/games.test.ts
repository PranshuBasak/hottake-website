import { describe, expect, it } from "vitest";
import { allTags, fitsPlayers, getGame, getGames, playersLabel } from "./games";

const PORTS = ["bombermoji", "tangle", "ricochet-tanks", "sushi-paws", "cartastrophe", "night-siege", "nebula-knockout", "star-convoy"];

describe("catalogue", () => {
  it("has all 32 built-in games", () => expect(getGames()).toHaveLength(32));
  it("reads players from the manifest", () => expect(getGame("coin-clash")?.players).toEqual({ min: 1, max: 8 }));
  it("keeps credits for every ported game", () => {
    for (const id of PORTS) expect(getGame(id)?.credit?.url, id).toBeTruthy();
  });
  it("returns undefined for an unknown id", () => expect(getGame("nope")).toBeUndefined());
  it("has a description and cover for every game", () => {
    for (const g of getGames()) {
      expect(g.description.length, g.id).toBeGreaterThan(20);
      expect(g.cover, g.id).toMatch(/^\/games\/[a-z0-9-]+\.(svg|png)$/);
    }
  });
  it("marks co-op games", () => {
    expect(getGame("night-siege")?.coop).toBe(true);
    expect(getGame("coin-clash")?.coop).toBe(false);
  });
  it("filters by player count", () => {
    expect(fitsPlayers(getGame("fuse-pass")!, 2)).toBe(false);
    expect(fitsPlayers(getGame("fuse-pass")!, 3)).toBe(true);
  });
  it("formats labels", () => expect(playersLabel({ players: { min: 2, max: 8 } })).toBe("2–8"));
  it("lists tags without 'party'", () => expect(allTags()).not.toContain("party"));
});
