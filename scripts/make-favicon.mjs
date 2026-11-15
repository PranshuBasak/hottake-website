// Writes src/app/favicon.ico (16, 32 and 48 px PNG frames) and the PNG app icons from src/app/icon1.svg.
// Google Search needs a .ico or .png favicon; SVG alone is not enough. Run: node scripts/make-favicon.mjs
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const here = (p) => new URL(p, import.meta.url);
const svg = await readFile(here("../src/app/icon1.svg"));
const png = (size) => sharp(svg, { density: 1200 }).resize(size, size).png().toBuffer();

// ICO container with PNG-compressed frames (supported by every current browser and by Google).
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(frames[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += frames[i].length;
});
await writeFile(here("../src/app/favicon.ico"), Buffer.concat([header, ...frames]));
await writeFile(here("../src/app/icon2.png"), await png(48));
console.log("favicon.ico (16/32/48) and icon2.png (48) written");
