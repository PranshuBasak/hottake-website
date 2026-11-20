// Uploads the installer to Supabase Storage (bucket "releases") and marks it as the latest release.
// Usage (from site/):  npm run upload:release -- ../release/HotTake_0.2.0_x64-setup.exe 0.2.0 "Release notes"
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local (loaded by the npm script).
//
// When the installer has an updater signature next to it (<installer>.sig, written by `tauri build`
// with TAURI_SIGNING_PRIVATE_KEY set), the script also publishes releases/latest.json, the feed
// the desktop app checks on launch. The feed goes up last, so it never points at a missing file.
// Pass --force to publish a version that is not newer than the one already in the feed.
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "releases";
const FEED = "latest.json";

const argv = process.argv.slice(2);
const force = argv.includes("--force");
const [file = "../release/HotTake_0.1.0_x64-setup.exe", version = "0.1.0", ...rest] = argv.filter((a) => a !== "--force");
const notes = rest.length ? rest.join(" ") : null; // npm splits quoted notes into words; join them back
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in site/.env.local first.");
  process.exit(1);
}

/** -1, 0 or 1 for two "x.y.z" versions. */
function compareVersions(a, b) {
  const pa = a.split(/[.+-]/).map(Number);
  const pb = b.split(/[.+-]/).map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return Math.sign(d);
  }
  return 0;
}

const path = resolve(file);
const name = basename(path);
const sigPath = `${path}.sig`;
const withFeed = existsSync(sigPath);
const bytes = await readFile(path);
const { size } = await stat(path);
const sha256 = createHash("sha256").update(bytes).digest("hex");
const objectPath = `v${version}/${name}`;

const supabase = createClient(url, key, { auth: { persistSession: false } });
const storage = supabase.storage.from(BUCKET);

// Installed apps only update to a higher version, so a feed that does not move forward is a mistake.
if (withFeed && !force) {
  const res = await fetch(storage.getPublicUrl(FEED).data.publicUrl, { cache: "no-store" });
  if (res.ok) {
    const current = await res.json();
    if (compareVersions(version, current.version) <= 0) {
      console.error(`The update feed already lists v${current.version}; v${version} is not newer, so no app would update.`);
      console.error("Raise the version, or pass --force to publish it anyway.");
      process.exit(1);
    }
  }
}

console.log(`Uploading ${name} (${(size / 1048576).toFixed(1)} MB) to ${BUCKET}/${objectPath} …`);
const up = await storage.upload(objectPath, bytes, {
  contentType: "application/vnd.microsoft.portable-executable",
  cacheControl: "31536000",
  upsert: true,
});
if (up.error) {
  console.error("Upload failed:", up.error.message);
  process.exit(1);
}
const publicUrl = storage.getPublicUrl(objectPath).data.publicUrl;

// Only one row may have is_latest = true (unique partial index), so clear it first.
const clear = await supabase.from("releases").update({ is_latest: false }).eq("is_latest", true);
if (clear.error) {
  console.error("Could not clear the previous latest release:", clear.error.message);
  process.exit(1);
}
const row = await supabase
  .from("releases")
  .upsert({ version, file_name: name, url: publicUrl, size_bytes: size, sha256, notes, is_latest: true }, { onConflict: "version" })
  .select()
  .single();
if (row.error) {
  console.error("Could not record the release:", row.error.message);
  process.exit(1);
}
console.log(`v${version} is on the download page:\n  ${publicUrl}\n  sha256 ${sha256}`);

if (!withFeed) {
  console.log(`No ${basename(sigPath)} next to the installer, so the update feed was left as it is.`);
  process.exit(0);
}

const feed = {
  version,
  notes: notes ?? "",
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      signature: (await readFile(sigPath, "utf8")).trim(),
      url: publicUrl,
    },
  },
};
const feedUp = await storage.upload(FEED, JSON.stringify(feed, null, 2), {
  // The bucket only allows installer types; the updater parses the body whatever the type says.
  contentType: "application/octet-stream",
  cacheControl: "60", // apps should see a new release within a minute
  upsert: true,
});
if (feedUp.error) {
  console.error("Installer uploaded, but the update feed failed:", feedUp.error.message);
  process.exit(1);
}
console.log(`Update feed now offers v${version}:\n  ${storage.getPublicUrl(FEED).data.publicUrl}`);
