// Renders the PWA icons from src/app/icon.svg (run: node scripts/make-icons.mjs).
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const svg = await readFile(new URL("../src/app/icon.svg", import.meta.url));
const out = (n) => new URL(`../public/icons/${n}`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

for (const size of [192, 512]) {
  await sharp(svg, { density: 1200 }).resize(size, size).png().toFile(out(`icon-${size}.png`));
}
// Maskable: art inside the 80% safe zone on a full-bleed background.
const inner = Math.round(512 * 0.72);
const art = await sharp(svg, { density: 1200 }).resize(inner, inner).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#120d0b" } })
  .composite([{ input: art, gravity: "center" }])
  .png()
  .toFile(out("maskable-512.png"));
await sharp(svg, { density: 1200 }).resize(180, 180).flatten({ background: "#120d0b" }).png().toFile(out("apple-touch-icon.png"));
console.log("icons written");
