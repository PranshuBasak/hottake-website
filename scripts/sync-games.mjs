// Reads ../games/*/manifest.json and cover art, writes src/data/games.json and public/games/<id>.<ext>.
// Run from site/: `npm run sync:games`. Outputs are committed so Vercel builds don't need the parent repo.
import { readdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "..");
const gamesDir = join(site, "..", "games");
const outCovers = join(site, "public", "games");
mkdirSync(outCovers, { recursive: true });

const stickLabel = { dpad: "D-pad", joystick: "Joystick", none: "Buttons only", "": "Twin stick" };

const games = readdirSync(gamesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
  .filter((d) => existsSync(join(gamesDir, d.name, "manifest.json")))
  .map((d) => {
    const m = JSON.parse(readFileSync(join(gamesDir, d.name, "manifest.json"), "utf8"));
    const ext = extname(m.cover);
    copyFileSync(join(gamesDir, d.name, m.cover), join(outCovers, `${m.id}${ext}`));
    const stick = m.controller?.stick ?? "";
    const buttons = m.controller?.buttons ?? [];
    const credit = m.credits
      ? { author: m.credits.author ?? null, url: m.credits.url ?? null, license: m.credits.license ?? null, notes: m.credits.notes ?? null }
      : null;
    return {
      id: m.id,
      name: m.name,
      tagline: m.tagline,
      description: m.description ?? m.tagline,
      tags: m.tags ?? [],
      players: { min: m.players.min, max: m.players.max },
      coop: (m.tags ?? []).includes("co-op"),
      stick: stickLabel[stick] ?? stick,
      buttons,
      cover: `/games/${m.id}${ext}`,
      credit,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(join(site, "src", "data", "games.json"), JSON.stringify(games, null, 2) + "\n");
console.log(`synced ${games.length} games`);
