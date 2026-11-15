import data from "@/data/games.json";

export type GameCredit = { author: string | null; url: string | null; license: string | null; notes: string | null };
export type Game = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  players: { min: number; max: number };
  coop: boolean;
  stick: string;
  buttons: string[];
  cover: string;
  /** 640×360 WebP of the cover, for animated lists. */
  thumb: string;
  credit: GameCredit | null;
};

const games = data as Game[];

export function getGames(): Game[] {
  return games;
}

export function getGame(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}

/** Tags worth filtering by (drops the generic "party"). */
export function allTags(): string[] {
  return [...new Set(games.flatMap((g) => g.tags))].filter((t) => t !== "party").sort();
}

export function playersLabel(g: Pick<Game, "players">): string {
  return g.players.min === g.players.max ? `${g.players.min}` : `${g.players.min}–${g.players.max}`;
}

export function controlsLabel(g: Pick<Game, "stick" | "buttons">): string {
  return [g.stick, ...g.buttons].filter(Boolean).join(" · ");
}

/** True when `count` players can play this game. */
export function fitsPlayers(g: Pick<Game, "players">, count: number): boolean {
  return count >= g.players.min && count <= g.players.max;
}
