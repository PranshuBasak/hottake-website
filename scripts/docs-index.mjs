// Builds src/data/docs.json from src/content/docs/*.mdx: each page's meta, its ## / ### headings (with the
// same ids rehype-slug gives them) and plain-text chunks for the docs search. Runs before dev and build.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(site, "src", "content", "docs");
export const SECTIONS = ["Start here", "Architecture", "Making games", "Build & contribute"];

const strip = (s) =>
  s
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const pages = readdirSync(dir)
  .filter((f) => f.endsWith(".mdx"))
  .map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const src = readFileSync(join(dir, file), "utf8");
    const m = src.match(/export const meta = (\{[\s\S]*?\});/);
    if (!m) throw new Error(`${file}: missing "export const meta = { … };"`);
    const meta = Function(`return (${m[1]})`)();
    for (const k of ["title", "description", "section", "order"]) if (meta[k] === undefined) throw new Error(`${file}: meta.${k} missing`);
    if (!SECTIONS.includes(meta.section)) throw new Error(`${file}: unknown section "${meta.section}"`);

    const body = src.slice(m.index + m[0].length).replace(/```[\s\S]*?```/g, " ");
    const slugger = new GithubSlugger();
    const headings = [];
    const chunks = [];
    let current = { id: "", title: meta.title, text: "" };
    for (const line of body.split("\n")) {
      const h = line.match(/^(##|###)\s+(.*)$/);
      if (h) {
        if (current.text.trim()) chunks.push({ ...current, text: strip(current.text).slice(0, 400) });
        const title = strip(h[2]);
        const id = slugger.slug(title);
        headings.push({ depth: h[1].length, title, id });
        current = { id, title, text: "" };
      } else current.text += ` ${line}`;
    }
    if (current.text.trim()) chunks.push({ ...current, text: strip(current.text).slice(0, 400) });
    return { slug, ...meta, headings, chunks };
  })
  .sort((a, b) => SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section) || a.order - b.order);

writeFileSync(join(site, "src", "data", "docs.json"), JSON.stringify(pages, null, 1) + "\n");
console.log(`docs index: ${pages.length} pages, ${pages.reduce((n, p) => n + p.chunks.length, 0)} search chunks`);
