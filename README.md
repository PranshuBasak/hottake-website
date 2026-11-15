# HotTake website

The public marketing site for HotTake: Next.js 16 (App Router, Cache Components), shadcn/ui, Tailwind v4,
GSAP, ShaderGradient, interior.dev components and ASCII Magic transitions. Supabase stores visitor metrics
(with consent), email sign-ups, downloads and the installer file.

Design: [`docs/superpowers/specs/2026-11-15-marketing-website-design.md`](../docs/superpowers/specs/2026-11-15-marketing-website-design.md)

## Run it

```bash
cd site
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (vitest)
npm run lint
npm run build
```

`site/.env.local` (never committed; see `.env.example`):

| Variable | What |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL` | `https://fvkkwsmrgvlcvgapalyn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` — server only (tracking, sign-ups, downloads, health) |
| `NEXT_PUBLIC_SITE_URL` | the public URL, e.g. `https://hottake.example` (canonical links, sitemap, OG) |

Without the secret key the site still works; it just records nothing.

## Supabase setup (once)

1. Apply the migrations in `supabase/migrations/` in order (Supabase MCP `apply_migration`, the SQL editor,
   or `npx supabase db push`). They create the tables, the write functions (service role only), the
   retention job (`pg_cron`, daily: IPs/user agents nulled after 90 days, events/sessions deleted after
   13 months), the reporting views and the public `releases` storage bucket.
2. Upload the installer and mark it as the latest release:

   ```bash
   npm run upload:release -- ../release/HotTake_0.1.0_x64-setup.exe 0.1.0 "First public release"
   ```

   This computes size + SHA-256, uploads to `releases/v0.1.0/…` and inserts the `releases` row.
   `/download` and `/api/download` pick it up within 10 minutes (cached).

Metrics are read in the Supabase dashboard: views `metrics_daily`, `metrics_top_pages`, `metrics_countries`,
`metrics_devices`, `metrics_downloads_daily`, `metrics_subscribers_daily`, plus the raw `sessions`, `events`,
`subscribers` and `downloads` tables.

## APIs

| Route | What |
|---|---|
| `GET /api/health` | Open, no auth. Checks config, catalogue, database (read + write), storage bucket and the release file; increments a counter and returns `check_count`, `checked_at`, `previous_checked_at`. 200 when ok/degraded, 503 when the database is down. |
| `POST /api/track` | Page views and events from the site. Stores IP, location, device and IDs only when the `ht_consent` cookie is `all`; otherwise an anonymous count. |
| `GET /api/download` | Logs the download, then redirects to the installer in Supabase Storage. |

## Content

- **Games** come from `../games/*/manifest.json`: `npm run sync:games` regenerates `src/data/games.json` and
  `public/games/*.svg` (both committed so Vercel builds don't need the parent repo). Run it after adding a game.
- **Creator bio**: `src/data/creator.ts` (add a photo under `public/creator/` and set `photo`).
- **Contact email, jurisdiction, version**: `src/lib/site.ts`.
- **ASCII pieces**: `npm run vendor:ascii` copies the runtime + pieces listed in `scripts/vendor-ascii.mjs` to
  `public/vendor/ascii-magic/` (self-hosted, MIT).

## Deploy (Vercel)

Import the repo in Vercel with **Root Directory = `site`** (framework: Next.js), add the env variables above for
Production and Preview, and set `NEXT_PUBLIC_SITE_URL` to the final domain. Or, from `site/`: `npx vercel login`,
then `npx vercel --prod`.

`three` is pinned to `0.169.0`: newer versions removed a shader chunk ShaderGradient 2.4 uses.
