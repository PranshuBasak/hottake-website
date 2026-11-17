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
| `SUPABASE_SECRET_KEY` | `sb_secret_…`, server only (tracking, sign-ups, downloads, health) |
| `NEXT_PUBLIC_SITE_URL` | the public URL, e.g. `https://hottake.example` (canonical links, sitemap, OG) |
| `ADMIN_USERNAME` | username for `/admin` |
| `ADMIN_PASSWORD_HASH` | scrypt hash of the admin password, from `npm run admin:hash` |
| `ADMIN_SESSION_SECRET` | random string that signs the admin cookie, also printed by `npm run admin:hash` |
| `AUTHOR_PEPPER` | optional; mixed into the hash of the `ht_author` key (falls back to the secret key) |

Without the secret key the site still works; it just records nothing. Without the three `ADMIN_*` values the
admin area stays locked for everyone.

## Supabase setup (once)

1. Run `supabase/setup.sql` once in the Supabase SQL editor (it is both files in `supabase/migrations/`, in
   order), or apply the migrations with the Supabase MCP / `npx supabase db push`. They create the tables, the write functions (service role only), the
   retention job (`pg_cron`, daily: IPs/user agents nulled after 90 days, events/sessions deleted after
   13 months), the reporting views and the public `releases` storage bucket.
2. Upload the installer and mark it as the latest release:

   ```bash
   npm run upload:release -- ../release/HotTake_0.1.0_x64-setup.exe 0.1.0 "First public release"
   ```

   This computes size + SHA-256, uploads to `releases/v0.1.0/…` and inserts the `releases` row.
   `/download` and `/api/download` pick it up within 10 minutes (cached).

3. Run `supabase/setup-2.sql` once (the `20261117000000_votes_comments_admin` migration). It adds game votes,
   comments, the admin login lockout and the read-only reporting functions the admin dashboard uses.
4. Create the admin login: `npm run admin:hash` asks for a password (12+ characters) and prints
   `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`. Put them, plus `ADMIN_USERNAME`, in `.env.local` and in
   the Vercel project, then redeploy. Changing `ADMIN_SESSION_SECRET` signs everyone out.

## Admin dashboard

`/admin` (not linked anywhere, not indexed) shows page views, visitors, audience, downloads, sign-ups, votes and
comments, with date range, country, device, page, game and search filters kept in the URL. It is read-only:
nothing can be edited or deleted from it. Five wrong passwords from one IP lock sign-in for 15 minutes; a
session lasts 12 hours.

## Votes and comments

Every game page has thumbs up / down and comments. Games stay static; the section loads from the API after
the page. The `ht_author` cookie (random key, HttpOnly, 12 months, stored only as a hash) lets a browser
change its vote and edit its own comments. Nobody can delete a comment from the site. To remove one for legal
reasons, delete the row from `game_comments` in Supabase. Limits: 3 comments per browser per 10 minutes, 20
per IP per hour, names up to 40 characters, comments up to 1000, plain text only.

Metrics are also in the Supabase dashboard: views `metrics_daily`, `metrics_top_pages`, `metrics_countries`,
`metrics_devices`, `metrics_downloads_daily`, `metrics_subscribers_daily`, plus the raw `sessions`, `events`,
`subscribers` and `downloads` tables.

## APIs

| Route | What |
|---|---|
| `GET /api/health` | Open, no auth. Checks config, catalogue, database (read + write), storage bucket, the release file and votes/comments; increments a counter and returns `check_count`, `checked_at`, `previous_checked_at`. 200 when ok/degraded, 503 when the database is down. |
| `POST /api/track` | Page views and events from the site. Stores IP, location, device and IDs only when the `ht_consent` cookie is `all`; otherwise an anonymous count. |
| `GET /api/download` | Logs the download, then redirects to the installer in Supabase Storage. |
| `GET /api/games/[id]/feedback` | Vote counts, your vote and the newest 20 comments (`?before=<id>` for older ones). |
| `POST /api/games/[id]/vote` | `{ value: 1 | -1 | 0 }`: thumbs up, thumbs down or take your vote back. |
| `POST /api/games/[id]/comments` | `{ name, body }`. 201 on success, 429 when rate limited. |
| `PATCH /api/games/[id]/comments/[commentId]` | Edit your own comment; 403 without the author cookie that posted it. |

## Content

- **Games** come from `../games/*/manifest.json`: `npm run sync:games` regenerates `src/data/games.json` and
  `public/games/*.svg` (both committed so Vercel builds don't need the parent repo). Run it after adding a game.
- **Creator bio**: `src/data/creator.ts` (add a photo under `public/creator/` and set `photo`).
- **Contact email, jurisdiction, version**: `src/lib/site.ts`.
- **ASCII pieces**: `npm run vendor:ascii` copies the runtime + pieces listed in `scripts/vendor-ascii.mjs` to
  `public/vendor/ascii-magic/` (self-hosted, MIT).

## PWA

`src/app/manifest.ts` (installable, standalone, maskable icon, shortcuts) and `public/sw.js`: pages are
network-first with an offline fallback (`/offline`), static assets stale-while-revalidate, `/api/*` never
cached. The worker registers in production builds only. Bump `VERSION` in `sw.js` to drop old caches.
Icons are rendered from `src/app/icon.svg` by `node scripts/make-icons.mjs`.

## Hairline figure

`design/hairline/relay.js` is the source of the interactive phone → laptop drawing on /how-to-play. Rebuild it
with the hairline-create skill (`node .claude/skills/hairline-create/build.mjs design/hairline/relay.js`) and copy
`hairline-relay.html` to `public/figures/relay.html`.

## Deploy (Vercel)

The Vercel project is linked to this GitHub repo: every push to `main` deploys to production, every other
branch gets a preview. Env variables are set per environment in the Vercel project (the secret key only by hand).
If the domain changes, update `NEXT_PUBLIC_SITE_URL` (canonical links, sitemap, robots and OG images use it).

`three` is pinned to `0.169.0`: newer versions removed a shader chunk ShaderGradient 2.4 uses.
