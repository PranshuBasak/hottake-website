// Reads ../games/*/manifest.json and cover art, writes src/data/games.json and public/games/<id>.<ext>.
// Run from site/: `npm run sync:games`. Outputs are committed so Vercel builds don't need the parent repo.
import { readdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "..");
const gamesDir = join(site, "..", "games");
const outCovers = join(site, "public", "games");
mkdirSync(join(outCovers, "thumbs"), { recursive: true });

/** House style: no em dashes. A pair becomes brackets, a single one a colon. */
const EM = "\u2014";
const tidy = (t) =>
  typeof t === "string"
    ? t.replace(new RegExp(` ${EM} ([^${EM}]+?) ${EM} `, "g"), " ($1) ").replace(new RegExp(` ${EM} `, "g"), ": ").replace(new RegExp(EM, "g"), ", ")
    : t;

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
      ? { author: m.credits.author ?? null, url: m.credits.url ?? null, license: m.credits.license ?? null, notes: tidy(m.credits.notes) ?? null }
      : null;
    return {
      id: m.id,
      name: m.name,
      tagline: tidy(m.tagline),
      description: tidy(m.description ?? m.tagline),
      tags: m.tags ?? [],
      players: { min: m.players.min, max: m.players.max },
      coop: (m.tags ?? []).includes("co-op"),
      stick: stickLabel[stick] ?? stick,
      buttons,
      cover: `/games/${m.id}${ext}`,
      thumb: `/games/thumbs/${m.id}.webp`,
      credit,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Small raster thumbnails for moving/repeated cards: decoding a 640×360 WebP is far cheaper than
// re-rasterising a detailed SVG while it animates.
await Promise.all(
  games.map((g) =>
    sharp(join(outCovers, g.cover.slice("/games/".length)), { density: 160 })
      .resize(640, 360, { fit: "cover" })
      .webp({ quality: 82 })
      .toFile(join(outCovers, "thumbs", `${g.id}.webp`)),
  ),
);

writeFileSync(join(site, "src", "data", "games.json"), JSON.stringify(games, null, 2) + "\n");
// Just the count, so site-wide copy (header, footer, hero) can say it without shipping the whole catalogue to browsers.
writeFileSync(join(site, "src", "data", "game-count.json"), JSON.stringify({ count: games.length }) + "\n");
console.log(`synced ${games.length} games`);
