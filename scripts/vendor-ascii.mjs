// Copies the ascii-magic-art runtime and the few pieces the site uses into public/vendor/ascii-magic/
// (self-hosted, so no third-party script at runtime). Run: `npm run vendor:ascii`.
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(site, "node_modules", "ascii-magic-art");
const out = join(site, "public", "vendor", "ascii-magic");
export const PIECES = ["pixel-fire", "sparks", "starburst", "starfield-warp", "fireworks", "plasma", "synthwave-grid", "lcd-handheld-game", "campfire"];

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "pieces"), { recursive: true });
for (const dir of ["runtime", "lib"]) cpSync(join(src, dir), join(out, dir), { recursive: true });
for (const f of ["LICENSE", "NOTICE"]) cpSync(join(src, f), join(out, f));
for (const p of PIECES) cpSync(join(src, "pieces", `${p}.js`), join(out, "pieces", `${p}.js`));
console.log(`vendored ascii-magic runtime + ${PIECES.length} pieces`);
