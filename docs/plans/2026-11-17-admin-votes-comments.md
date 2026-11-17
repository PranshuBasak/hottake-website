# Admin dashboard, votes and comments: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thumbs up/down and comments on every game page, and a password-protected, read-only `/admin` dashboard with shadcn charts and URL filters over all collected data.

**Architecture:** Two new Supabase tables written only through `security definer` functions called from Next route handlers with the secret key; identity is an `ht_author` cookie hashed with a server pepper. `/admin` is server-rendered, gated by an HMAC-signed `ht_admin` cookie checked in every admin page and data loader; aggregations run in SQL functions.

**Tech Stack:** Next.js 16 (Cache Components), Supabase, zod, vitest, `@ui-sdk/react` 0.1.0-beta.6 (Toggle, ToggleGroup, Field, Input, Textarea, Button, Select, SegmentedControl, Pagination), shadcn `chart` (Recharts).

**Spec:** `docs/specs/2026-11-17-admin-votes-comments-design.md`

## Global Constraints

- UI SDK: import from entries (`@ui-sdk/react/toggle`), style via `data-slot` + state attributes with Tailwind, `@layer ui-sdk;` at the top of `globals.css`, every control named, no hand-rolled `role=` widgets.
- Votes: `value in (-1, 1)`, one row per `(game_id, author_hash)`; same thumb again removes the vote.
- Comments: name 1–40 chars, body 1–1000 chars, plain text; 3 per author per 10 min, 20 per IP per hour; honeypot field `company`; no delete anywhere.
- `ht_author`: UUID, HttpOnly, Secure (https), SameSite=Lax, 12 months, stored only as `sha256(key + AUTHOR_PEPPER)`.
- Admin: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` (scrypt `salt:hash` hex), `ADMIN_SESSION_SECRET`; `ht_admin` HMAC token, Path=/admin, SameSite=Strict, 12 h; 5 failed logins per IP per 15 min → locked 15 min.
- Admin is read-only: no mutation endpoint under `/admin`; `noindex`; disallowed in robots; excluded from sitemap and tracking.
- Game ids validated in the app against `games.json`; DB checks format `^[a-z0-9-]{2,40}$`.
- No em dashes in copy.

## Review Focus

1. Request without `ht_author` trying to PATCH a comment → 403, comment unchanged. Test in Task 2 (`canEdit`).
2. Unknown game id (`/api/games/nope/vote`) → 404, nothing stored. Test in Task 2 (`isKnownGame`).
3. Expired or tampered `ht_admin` cookie → redirected to `/admin/login`. Test in Task 4 (`verifySession`).
4. Comment body with `<script>` → stored and shown as literal text. Covered by rendering text nodes only (Task 3) + `validateComment` keeps it.
5. Filters with invalid values (`?from=garbage&country=xx`) → fall back to defaults, no crash. Test in Task 5 (`parseFilters`).

---

### Task 1: Database

**Files:** Create `supabase/migrations/20261117000000_votes_comments_admin.sql`; append it to `supabase/setup-2.sql` (copy for the SQL editor); modify `src/lib/supabase/types.ts`.

**Produces (SQL functions, all `security definer`, `set search_path = ''`, execute granted to `service_role` only):**
- `cast_vote(p_game text, p_author text, p_value smallint, p_country text) returns table(up int, down int, mine smallint)`; `p_value = 0` removes the caller's own row.
- `game_feedback(p_game text, p_author text, p_limit int, p_before bigint) returns jsonb` → `{ up, down, mine, comments: [{ id, name, body, created_at, edited_at, mine }] }`.
- `post_comment(p_game text, p_author text, p_name text, p_body text, p_ip inet, p_country text) returns jsonb` → `{ status: "ok" | "rate_limited", comment? }`.
- `edit_comment(p_id bigint, p_author text, p_name text, p_body text) returns jsonb` → `{ status: "ok" | "forbidden" | "not_found", comment? }`.
- `admin_login_attempt(p_ip inet, p_ok boolean) returns boolean` (true = allowed to try) and `admin_is_locked(p_ip inet) returns boolean`.
- Read-only admin functions taking `(p_from timestamptz, p_to timestamptz, p_country text, p_device text, p_path text)` and returning `jsonb`: `admin_overview`, `admin_audience`, `admin_downloads`, `admin_signups` (+ `p_search text`, `p_page int`), `admin_games`, `admin_comments` (+ `p_game text`, `p_search text`, `p_page int`).
- Purge job extended: `game_comments.ip` nulled after 90 days; `admin_login_attempts` older than 1 day deleted.

- [ ] Write the migration; RLS on, revoke from anon/authenticated.
- [ ] Ask Pranshu to run `supabase/setup-2.sql`; verify with a node script calling each function with the secret key.
- [ ] Commit.

### Task 2: Feedback API (votes + comments)

**Files:** Create `src/lib/feedback.ts`, `src/lib/feedback.test.ts`, `src/lib/author.ts`, `src/app/api/games/[id]/feedback/route.ts`, `.../vote/route.ts`, `.../comments/route.ts`, `.../comments/[commentId]/route.ts`.

**Produces:** `isKnownGame(id: string): boolean`; `validateComment(input: { name?: unknown; body?: unknown; company?: unknown }): { ok: true; name: string; body: string } | { ok: false; error: string }`; `parseVote(v: unknown): -1 | 0 | 1 | null`; `authorHash(key: string, pepper: string): string`; `readAuthor(req): { key: string | null }`; `ensureAuthor(res, key?): string` (sets cookie).

- [ ] Tests: `isKnownGame("coin-clash") === true`, `isKnownGame("nope") === false`; `validateComment({ name: " Ana ", body: "gg" })` → `{ ok: true, name: "Ana", body: "gg" }`; empty name / 41-char name / 1001-char body → `ok: false`; filled `company` → `{ ok: false, error: "bot" }`; `parseVote(1)`, `parseVote(-1)`, `parseVote(0)` valid, `parseVote(2)` → null; `authorHash("k","p")` is 64 hex chars and stable.
- [ ] Implement; routes 404 unknown games, 400 invalid input, 403 when PATCH has no matching author, 429 on rate limit.
- [ ] `npm test` green; commit.

### Task 3: Game page UI (UI SDK)

**Files:** Create `src/components/games/game-feedback.tsx` (client island), `vote-bar.tsx`, `comment-form.tsx`, `comment-list.tsx`; modify `src/app/games/[id]/page.tsx` (mount below details), `src/app/globals.css` (`@layer ui-sdk;`).

- [ ] VoteBar: `ToggleGroup` (single, deselectable) with two `Toggle`s labelled "I like this game" / "Not for me", counts and `% liked`; optimistic update, reverts on error.
- [ ] CommentForm: `Field`+`Input` (name, remembered in localStorage), `Field`+`Textarea` (message, counter), `Button` submit; honeypot; inline `FieldError`.
- [ ] CommentList: newest first, "edited" marker, Edit on own comments (inline form), "Load more" with `p_before` cursor. Bodies rendered as text.
- [ ] Commit.

### Task 4: Admin auth

**Files:** Create `src/lib/admin-auth.ts`, `src/lib/admin-auth.test.ts`, `scripts/admin-hash.mjs` (`npm run admin:hash -- <password>`), `src/app/admin/login/page.tsx`, `src/app/admin/login/actions.ts` (`login`, `logout`), `src/app/admin/layout.tsx`.

**Produces:** `hashPassword(pw: string): string` (scrypt, `salt:hash`); `verifyPassword(pw: string, stored: string): boolean`; `signSession(expMs: number, secret: string): string`; `verifySession(token: string | undefined, secret: string, now?: number): boolean`; `requireAdmin(): Promise<void>` (redirects to `/admin/login`).

- [ ] Tests: hash then verify true; wrong pw false; `verifySession(signSession(now+1000))` true; expired false; tampered (one char changed) false; `undefined` false.
- [ ] Implement with `node:crypto` (`scryptSync`, `timingSafeEqual`, `createHmac`).
- [ ] Commit.

### Task 5: Admin dashboard

**Files:** Create `src/lib/admin-filters.ts` (+ test), `src/lib/admin-data.ts` (server-only loaders calling the Task 1 functions), `src/components/admin/*` (filter bar with UI SDK Select + SegmentedControl, KPI card, chart wrappers using shadcn `ChartContainer`, data table with UI SDK Pagination), pages `src/app/admin/page.tsx` (Overview), `audience`, `downloads`, `signups`, `games`, `comments`.

**Produces:** `parseFilters(sp: Record<string, string | string[] | undefined>, now: Date): { from: Date; to: Date; range: "7d" | "30d" | "90d" | "custom"; country: string | null; device: string | null; path: string | null }`.

- [ ] Tests: empty → 30d; `range=7d`; `from=garbage` → default; `country=IN` kept, `country=xx1` dropped; `to < from` swapped.
- [ ] Implement pages; each calls `requireAdmin()` first; filters in URL; disabled filters with a note where a dimension does not apply.
- [ ] Commit.

### Task 6: Wiring, legal and docs

- [ ] robots disallow `/admin`; sitemap unchanged; tracker skips `/admin`; `metadata.robots` noindex in admin layout.
- [ ] Privacy: "Votes and comments" section (author key, country, IP 90 days, public name + comment, kept indefinitely, removal by email request). Cookies page: `ht_author`, `ht_admin`. README: admin env vars, `admin:hash`, SQL.
- [ ] `/api/health`: add `feedback` check (`game_feedback` callable).
- [ ] Commit.

### Task 7: Verify and ship

- [ ] `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- [ ] Browser: vote, change, remove; post, edit, other browser cannot edit; admin login fail/lock/success; every admin page with filters.
- [ ] Set Vercel env (Pranshu: password hash and secrets), push, verify live.

### Task 8: Interaction sounds and first-visit intro (added by Pranshu)

**Files:** Create `src/lib/sound.ts` (Web Audio, no files: `playSound(kind: "click" | "vote" | "post" | "hover")`, `isMuted()`, `setMuted(b)` in localStorage `ht_sound`), `src/components/site/sound-toggle.tsx` (UI SDK `Toggle`, footer), `src/components/site/intro-screen.tsx` (first visit only, localStorage `ht_intro_seen`; GSAP: logo, ASCII flames, 0–100 counter, wipe out; skippable with any key/click; skipped under reduced motion).

- [ ] Sounds: short synthesized blips, played only after a user gesture, never on page load; muted state remembered; reduced-motion users default to muted.
- [ ] Intro: renders once per browser, does not replace or alter the page transition; never shown to bots (no-JS sees the page).
- [ ] Commit.
