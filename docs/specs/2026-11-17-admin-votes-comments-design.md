# Admin dashboard, game votes and game comments: design

Date: 2026-11-17 · Status: ready for Pranshu's approval · Site: hotake.pranshubasak.site (Next.js 16 + Supabase)

## Intent

Pranshu wants to see, in one private place, everything the website collects (visits, devices, countries, downloads,
sign-ups) and to let visitors react to each game: a thumbs up or down, and a short comment. It must stay simple: no
user accounts, no moderation tooling, one admin login, and an admin view that can only look, never change.

## Goals

- `/admin`: a password-protected, read-only dashboard with shadcn charts and filters over all collected data,
  including the new votes and comments.
- Each of the 32 game pages (`/games/[id]`) gets 👍/👎 voting and a comment thread.
- Commenters can edit their own comments from the same browser; nobody can delete anything.

## Non-goals

- No visitor accounts, logins or profiles.
- No admin actions of any kind: no edit, delete, hide, ban, export-to-file or reply. (Read only.)
- No changes to the game list itself (games stay static, from the app's manifests).
- No notifications (email/Slack) about new comments.
- No comment threading/replies, reactions on comments, images or links rendering.

## Anti-goals (a failure even if it works)

- Any route, action or database function that lets anyone (admin included) delete or rewrite someone else's comment.
- Admin data reachable without the login, or admin queries running in the browser with a key.
- Votes or comments that slow down game pages or break their static rendering.
- Counting votes for visitors in a way that needs the analytics consent (voting must work for everyone).

## Constraints

- Existing stack: Next.js 16 App Router with Cache Components, shadcn/ui, Tailwind v4, GSAP, Supabase (Postgres +
  Storage), Vercel. Server writes use the secret key through `getAdmin()`; the browser never talks to Supabase.
- Existing tables: `visitors`, `sessions`, `events`, `subscribers`, `releases`, `downloads`, `health_checks`, plus
  views `metrics_*`. Retention job: IPs/UAs nulled after 90 days, events/sessions deleted after 13 months.
- Game pages are statically prerendered; dynamic parts must sit in a Suspense boundary or load client-side.
- Supabase MCP isn't connected in the build session, so schema changes ship as a migration + `setup` SQL that
  Pranshu runs in the SQL editor (as before).
- House style: no em dashes in copy.

## Approaches considered

1. **Built-in `/admin` in this Next.js site (chosen).** Env-var credentials, signed cookie session, server-side
   queries with the secret key, shadcn charts (Recharts). Read-only is enforced in code: there are no write paths.
2. Supabase dashboard / Metabase. No build work, but not the site, no custom filters, and anyone with the keys
   can edit. Rejected.
3. A separate admin app. A second deployment and auth surface for a few pages. Rejected as overkill.

## Decided

### Identity for votes and comments: the author key

- New cookie `ht_author`: random UUID, `HttpOnly`, `Secure`, `SameSite=Lax`, 12 months, set on the first vote or
  comment. It is part of a feature the visitor uses, so it does not depend on the analytics consent; it is listed
  on `/cookies` and in the privacy policy. It is unrelated to `ht_vid`/`ht_sid` (analytics, 30-minute session).
- The server stores only `sha256(key + server pepper)` (`author_hash`), never the raw key.
- Losing the cookie (cleared, other browser/device) means that browser can no longer change its vote or edit its
  comments. Nobody else ever can.

### Votes

- Table `game_votes(game_id text, author_hash text, value smallint check (value in (-1, 1)), country text, created_at, updated_at,
  primary key (game_id, author_hash))`.
- One vote per browser per game; clicking the same thumb again removes your vote (toggle), the other thumb switches
  it. (Removing your own vote is the only "delete" that exists, and it only ever touches your own row.)
- Game page shows `👍 n · 👎 m · p% liked` (hidden percentage when there are no votes) and highlights your vote.
- `game_id` must be one of the 32 known ids (checked on the server against `games.json`).

### Comments

- Table `game_comments(id bigint identity, game_id text, author_hash text, name text 1–40 chars, body text 1–1000
  chars, country text, created_at, edited_at nullable, ip inet nullable)`. Plain text only; rendered as text (no HTML, links not
  clickable).
- Post: name + message + hidden honeypot. Rate limit: 3 comments per author key per 10 minutes and 20 per IP per
  hour (database function, like `subscribe`).
- Edit: allowed only when the request's `ht_author` hashes to the row's `author_hash`; updates `body` (and `name`)
  and sets `edited_at`. Shown as "edited 2 h ago". Previous text is not kept.
- No delete function exists in the database or the app, for anyone.
- Ordering: newest first, 20 per page with "Load more".
- IP is stored for abuse limits only and falls under the existing 90-day IP purge.

### Admin

- Credentials: `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` (scrypt, generated by `npm run admin:hash`) plus
  `ADMIN_SESSION_SECRET`, all in Vercel env (and `.env.local`). No password in the repo.
- `/admin/login` form → server action verifies with constant-time compare → sets `ht_admin` cookie: HMAC-signed
  `{exp}` token, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/admin`, 12 hours. Logout clears it.
- Brute force: after 5 failed logins from an IP in 15 minutes, the login refuses for 15 minutes (DB table
  `admin_login_attempts`, purged daily).
- Every `/admin/*` page and its data function checks the cookie on the server; `/admin` is `noindex`, disallowed in
  robots and excluded from the sitemap and from analytics tracking.
- Read-only: admin pages only run `select`s through server code; no admin route exposes any mutation.

### Admin pages and charts (shadcn `chart` + Recharts)

Shared filter bar on every page: date range (7 / 30 / 90 days / custom), country, device type, page path (where it
applies). Filters live in the URL (`?from=&to=&country=&device=&path=`) so views are bookmarkable.

| Page | Contents |
|---|---|
| Overview | KPI cards (visitors, page views, downloads, sign-ups, votes, comments, each vs the previous period); area chart of visits/page views per day; bar chart of top pages; donut of device types |
| Audience | countries (bar), browsers and OS (bar), referrers and UTM sources (table), new vs returning |
| Downloads | downloads per day (area), by country (bar), by release (table) |
| Sign-ups | sign-ups per day (bar), searchable read-only list (email, date, source) |
| Games | per-game 👍/👎 stacked bars, sortable table (likes, dislikes, % liked, comments) |
| Comments | all comments newest first, filter by game and search text, shows edited marker |

Data comes from SQL views/functions (aggregations done in Postgres, not in the browser), executed with the secret
key from server components. Tables over 100 rows paginate.

### Game page integration

- Votes and comments render in a client island under the game details, loaded after the static page (fetch on
  view), so `/games/[id]` stays fully prerendered and fast.
- API: `GET /api/games/[id]/feedback` (counts, my vote, first page of comments, which comment ids are mine),
  `POST /api/games/[id]/vote`, `POST /api/games/[id]/comments`, `PATCH /api/games/[id]/comments/[commentId]`.
  All validated with zod; ids and limits enforced in DB functions too.
- The admin and game feedback also appear in `/api/health` checks (tables reachable).

### Legal and docs

- Privacy policy: new "Votes and comments" section (what is stored, author key, IP for 90 days, public display of
  name + comment, no deletion, contact to request removal under law). Cookies page: `ht_author`, `ht_admin`.
- README: admin setup (env vars, hashing the password), new SQL.

## Settled after the builder check

- **Retention and legal removal (Pranshu's decision):** comments and votes are kept indefinitely. The site and the
  admin view never delete. A valid legal removal request (GDPR / India DPDP) is handled by Pranshu by email and done
  by hand in the Supabase dashboard. The privacy policy says exactly this. The purge job still nulls comment IPs after
  90 days.
- **Filters on data without a dimension (Claude's call):** votes and comments also store `country` from Vercel's
  `x-vercel-ip-country` header (coarse, not identifying, no consent needed). Sign-ups and downloads keep what they
  have. Filters that cannot apply to a page are shown disabled with a one-line note, and visitor charts are labelled
  "consented visitors" (anonymous page views are counted separately).
- **Valid game ids (Claude's call):** checked in the app against `games.json`. The database only checks the format
  (`^[a-z0-9-]{2,40}$`), so adding a game never needs an SQL step.

## Left to the builder

Exact chart styling and colours (within the site palette), copy wording, component breakdown, pagination details,
the hash/HMAC helpers' internals, query shapes of the SQL views.
