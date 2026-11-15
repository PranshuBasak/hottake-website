// Uploads the installer to Supabase Storage (bucket "releases") and marks it as the latest release.
// Usage (from site/):  npm run upload:release -- ../release/HotTake_0.1.0_x64-setup.exe 0.1.0 "Release notes"
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local (loaded by the npm script).
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const [file = "../release/HotTake_0.1.0_x64-setup.exe", version = "0.1.0", ...rest] = process.argv.slice(2);
const notes = rest.length ? rest.join(" ") : null; // npm splits quoted notes into words; join them back
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in site/.env.local first.");
  process.exit(1);
}

const path = resolve(file);
const name = basename(path);
const bytes = await readFile(path);
const { size } = await stat(path);
const sha256 = createHash("sha256").update(bytes).digest("hex");
const objectPath = `v${version}/${name}`;

const supabase = createClient(url, key, { auth: { persistSession: false } });

console.log(`Uploading ${name} (${(size / 1048576).toFixed(1)} MB) to releases/${objectPath} …`);
const up = await supabase.storage.from("releases").upload(objectPath, bytes, {
  contentType: "application/vnd.microsoft.portable-executable",
  cacheControl: "31536000",
  upsert: true,
});
if (up.error) {
  console.error("Upload failed:", up.error.message);
  process.exit(1);
}
const publicUrl = supabase.storage.from("releases").getPublicUrl(objectPath).data.publicUrl;

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
console.log(`Done. v${version} is live:\n  ${publicUrl}\n  sha256 ${sha256}`);
