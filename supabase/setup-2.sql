-- HotTake website: votes, comments and admin dashboard. Paste into Supabase > SQL Editor > New query > Run.
-- Safe to run again if a previous run stopped part-way.

-- Game votes and comments, admin login throttling, and read-only admin reporting functions.
-- All writes go through security definer functions callable only by service_role (the site's server).
-- Nothing here deletes a comment. Removing a comment for a legal request is done by hand in the dashboard.

-- ───────────── tables ─────────────

create table if not exists public.game_votes (
  game_id text not null check (game_id ~ '^[a-z0-9-]{2,40}$'),
  author_hash text not null check (author_hash ~ '^[0-9a-f]{64}$'),
  value smallint not null check (value in (-1, 1)),
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (game_id, author_hash)
);
create index if not exists game_votes_updated_idx on public.game_votes (updated_at);

create table if not exists public.game_comments (
  id bigint generated always as identity primary key,
  game_id text not null check (game_id ~ '^[a-z0-9-]{2,40}$'),
  author_hash text not null check (author_hash ~ '^[0-9a-f]{64}$'),
  name text not null check (char_length(name) between 1 and 40),
  body text not null check (char_length(body) between 1 and 1000),
  country text,
  ip inet,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists game_comments_game_idx on public.game_comments (game_id, id desc);
create index if not exists game_comments_author_idx on public.game_comments (author_hash, created_at);
create index if not exists game_comments_ip_idx on public.game_comments (ip, created_at);
create index if not exists game_comments_created_idx on public.game_comments (created_at);

create table if not exists public.admin_login_attempts (
  id bigint generated always as identity primary key,
  ip inet,
  ok boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_login_attempts_ip_idx on public.admin_login_attempts (ip, created_at);

alter table public.game_votes enable row level security;
alter table public.game_comments enable row level security;
alter table public.admin_login_attempts enable row level security;
revoke all on public.game_votes, public.game_comments, public.admin_login_attempts from anon, authenticated;

-- ───────────── votes and comments (site) ─────────────

create or replace function public.vote_counts(p_game text)
returns table (up int, down int)
language sql stable security definer set search_path = ''
as $$
  select count(*) filter (where value = 1)::int, count(*) filter (where value = -1)::int
  from public.game_votes where game_id = p_game;
$$;

-- p_value 1 or -1 sets the caller's vote; 0 removes the caller's own vote (the only removal that exists).
create or replace function public.cast_vote(p_game text, p_author text, p_value smallint, p_country text)
returns table (up int, down int, mine smallint)
language plpgsql security definer set search_path = ''
as $$
begin
  if p_value = 0 then
    delete from public.game_votes where game_id = p_game and author_hash = p_author;
  else
    insert into public.game_votes (game_id, author_hash, value, country)
    values (p_game, p_author, p_value, left(p_country, 2))
    on conflict (game_id, author_hash) do update set value = excluded.value, updated_at = now();
  end if;
  return query
    select c.up, c.down,
      (select v.value from public.game_votes v where v.game_id = p_game and v.author_hash = p_author)
    from public.vote_counts(p_game) c;
end;
$$;

create or replace function public.game_feedback(p_game text, p_author text, p_limit int, p_before bigint)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'up', c.up,
    'down', c.down,
    'mine', (select v.value from public.game_votes v where v.game_id = p_game and v.author_hash = p_author),
    'total_comments', (select count(*) from public.game_comments where game_id = p_game),
    'comments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', x.id, 'name', x.name, 'body', x.body, 'created_at', x.created_at, 'edited_at', x.edited_at,
        'mine', x.author_hash = p_author) order by x.id desc)
      from (
        select * from public.game_comments
        where game_id = p_game and (p_before is null or id < p_before)
        order by id desc
        limit least(greatest(coalesce(p_limit, 20), 1), 50)
      ) x
    ), '[]'::jsonb)
  )
  from public.vote_counts(p_game) c;
$$;

create or replace function public.post_comment(p_game text, p_author text, p_name text, p_body text, p_ip inet, p_country text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  rec public.game_comments%rowtype;
begin
  if (select count(*) from public.game_comments where author_hash = p_author and created_at > now() - interval '10 minutes') >= 3
     or (p_ip is not null and (select count(*) from public.game_comments where ip = p_ip and created_at > now() - interval '1 hour') >= 20) then
    return jsonb_build_object('status', 'rate_limited');
  end if;
  insert into public.game_comments (game_id, author_hash, name, body, ip, country)
  values (p_game, p_author, p_name, p_body, p_ip, left(p_country, 2))
  returning * into rec;
  return jsonb_build_object('status', 'ok', 'comment', jsonb_build_object(
    'id', rec.id, 'name', rec.name, 'body', rec.body, 'created_at', rec.created_at, 'edited_at', rec.edited_at, 'mine', true));
end;
$$;

create or replace function public.edit_comment(p_id bigint, p_author text, p_name text, p_body text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  rec public.game_comments%rowtype;
begin
  select * into rec from public.game_comments where id = p_id;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  if rec.author_hash <> p_author then return jsonb_build_object('status', 'forbidden'); end if;
  update public.game_comments set name = p_name, body = p_body, edited_at = now() where id = p_id returning * into rec;
  return jsonb_build_object('status', 'ok', 'comment', jsonb_build_object(
    'id', rec.id, 'name', rec.name, 'body', rec.body, 'created_at', rec.created_at, 'edited_at', rec.edited_at, 'mine', true));
end;
$$;

-- ───────────── admin login throttling ─────────────

create or replace function public.admin_is_locked(p_ip inet)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (select count(*) from public.admin_login_attempts
          where ip is not distinct from p_ip and not ok and created_at > now() - interval '15 minutes') >= 5;
$$;

create or replace function public.admin_login_attempt(p_ip inet, p_ok boolean)
returns void
language sql security definer set search_path = ''
as $$
  insert into public.admin_login_attempts (ip, ok) values (p_ip, p_ok);
$$;

-- ───────────── admin reporting (read-only) ─────────────

-- Page views in a range with the session's country/device; anonymous views have no country/device.
create or replace function public.admin_page_views(p_from timestamptz, p_to timestamptz, p_country text, p_device text, p_path text)
returns table (created_at timestamptz, visitor_id uuid, path text, consented boolean, country text, device text)
language sql stable security definer set search_path = ''
as $$
  select e.created_at, e.visitor_id, e.path, e.consented, s.country, coalesce(s.device_type, 'desktop')
  from public.events e
  left join public.sessions s on s.id = e.session_id
  where e.name = 'page_view' and e.created_at >= p_from and e.created_at < p_to
    and (p_path is null or e.path = p_path)
    and (p_country is null or s.country = p_country)
    and (p_device is null or coalesce(s.device_type, 'desktop') = p_device);
$$;

create or replace function public.admin_kpis(p_from timestamptz, p_to timestamptz, p_country text, p_device text, p_path text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'page_views', (select count(*) from public.admin_page_views(p_from, p_to, p_country, p_device, p_path)),
    'visitors', (select count(distinct visitor_id) from public.admin_page_views(p_from, p_to, p_country, p_device, p_path)),
    'downloads', (select count(*) from public.downloads where created_at >= p_from and created_at < p_to and (p_country is null or country = p_country)),
    'signups', (select count(*) from public.subscribers where created_at >= p_from and created_at < p_to),
    'votes', (select count(*) from public.game_votes where updated_at >= p_from and updated_at < p_to and (p_country is null or country = p_country)),
    'comments', (select count(*) from public.game_comments where created_at >= p_from and created_at < p_to and (p_country is null or country = p_country))
  );
$$;

create or replace function public.admin_overview(p_from timestamptz, p_to timestamptz, p_country text, p_device text, p_path text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'kpis', public.admin_kpis(p_from, p_to, p_country, p_device, p_path),
    'previous', public.admin_kpis(p_from - (p_to - p_from), p_from, p_country, p_device, p_path),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'page_views', coalesce(x.views, 0), 'visitors', coalesce(x.visitors, 0)) order by d.day)
      from generate_series(date_trunc('day', p_from), date_trunc('day', p_to - interval '1 second'), interval '1 day') as d(day)
      left join (
        select date_trunc('day', created_at) as day, count(*) as views, count(distinct visitor_id) as visitors
        from public.admin_page_views(p_from, p_to, p_country, p_device, p_path) group by 1
      ) x on x.day = d.day
    ), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', n) order by n desc)
      from (select path, count(*) n from public.admin_page_views(p_from, p_to, p_country, p_device, p_path) group by path order by n desc limit 10) t
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('device', device, 'views', n) order by n desc)
      from (select device, count(*) n from public.admin_page_views(p_from, p_to, p_country, p_device, p_path) where consented group by device) t
    ), '[]'::jsonb)
  );
$$;

create or replace function public.admin_audience(p_from timestamptz, p_to timestamptz, p_country text, p_device text, p_path text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with s as (
    select * from public.sessions
    where started_at >= p_from and started_at < p_to and not is_bot
      and (p_country is null or country = p_country)
      and (p_device is null or coalesce(device_type, 'desktop') = p_device)
      and (p_path is null or landing_path = p_path)
  )
  select jsonb_build_object(
    'sessions', (select count(*) from s),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('label', k, 'value', n) order by n desc) from (select coalesce(country, 'unknown') k, count(*) n from s group by 1 order by n desc limit 15) t), '[]'::jsonb),
    'browsers', coalesce((select jsonb_agg(jsonb_build_object('label', k, 'value', n) order by n desc) from (select coalesce(browser, 'unknown') k, count(*) n from s group by 1 order by n desc limit 10) t), '[]'::jsonb),
    'os', coalesce((select jsonb_agg(jsonb_build_object('label', k, 'value', n) order by n desc) from (select coalesce(os, 'unknown') k, count(*) n from s group by 1 order by n desc limit 10) t), '[]'::jsonb),
    'referrers', coalesce((select jsonb_agg(jsonb_build_object('label', k, 'value', n) order by n desc) from (select coalesce(nullif(split_part(split_part(referrer, '://', 2), '/', 1), ''), 'direct') k, count(*) n from s group by 1 order by n desc limit 15) t), '[]'::jsonb),
    'utm', coalesce((select jsonb_agg(jsonb_build_object('label', k, 'value', n) order by n desc) from (select utm_source k, count(*) n from s where utm_source is not null group by 1 order by n desc limit 15) t), '[]'::jsonb),
    'new_vs_returning', jsonb_build_object(
      'new', (select count(*) from public.visitors v where v.first_seen >= p_from and v.first_seen < p_to and v.id in (select visitor_id from s)),
      'returning', (select count(*) from public.visitors v where v.first_seen < p_from and v.id in (select visitor_id from s))
    )
  );
$$;

create or replace function public.admin_downloads(p_from timestamptz, p_to timestamptz, p_country text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with d as (select * from public.downloads where created_at >= p_from and created_at < p_to and (p_country is null or country = p_country))
  select jsonb_build_object(
    'total', (select count(*) from d),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', g.day, 'downloads', coalesce(x.n, 0)) order by g.day)
      from generate_series(date_trunc('day', p_from), date_trunc('day', p_to - interval '1 second'), interval '1 day') as g(day)
      left join (select date_trunc('day', created_at) as day, count(*) n from d group by 1) x on x.day = g.day
    ), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('label', k, 'value', n) order by n desc) from (select coalesce(country, 'unknown') k, count(*) n from d group by 1 order by n desc limit 15) t), '[]'::jsonb),
    'releases', coalesce((select jsonb_agg(jsonb_build_object('label', k, 'value', n) order by n desc) from (select coalesce(r.version, 'unknown') k, count(*) n from d left join public.releases r on r.id = d.release_id group by 1 order by n desc) t), '[]'::jsonb)
  );
$$;

create or replace function public.admin_signups(p_from timestamptz, p_to timestamptz, p_search text, p_page int)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with s as (
    select * from public.subscribers
    where created_at >= p_from and created_at < p_to and (p_search is null or email ilike '%' || p_search || '%')
  )
  select jsonb_build_object(
    'total', (select count(*) from s),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', g.day, 'signups', coalesce(x.n, 0)) order by g.day)
      from generate_series(date_trunc('day', p_from), date_trunc('day', p_to - interval '1 second'), interval '1 day') as g(day)
      left join (select date_trunc('day', created_at) as day, count(*) n from s group by 1) x on x.day = g.day
    ), '[]'::jsonb),
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object('email', email, 'created_at', created_at, 'source', source, 'unsubscribed', unsubscribed_at is not null) order by created_at desc)
      from (select * from s order by created_at desc limit 25 offset greatest(coalesce(p_page, 1) - 1, 0) * 25) t
    ), '[]'::jsonb)
  );
$$;

create or replace function public.admin_games(p_from timestamptz, p_to timestamptz, p_country text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with v as (select game_id, value from public.game_votes where updated_at >= p_from and updated_at < p_to and (p_country is null or country = p_country)),
       c as (select game_id from public.game_comments where created_at >= p_from and created_at < p_to and (p_country is null or country = p_country)),
       ids as (select game_id from v union select game_id from c)
  select coalesce(jsonb_agg(jsonb_build_object(
    'game_id', ids.game_id,
    'up', (select count(*) from v where v.game_id = ids.game_id and value = 1),
    'down', (select count(*) from v where v.game_id = ids.game_id and value = -1),
    'comments', (select count(*) from c where c.game_id = ids.game_id)
  )), '[]'::jsonb)
  from ids;
$$;

create or replace function public.admin_comments(p_from timestamptz, p_to timestamptz, p_country text, p_game text, p_search text, p_page int)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with c as (
    select * from public.game_comments
    where created_at >= p_from and created_at < p_to
      and (p_country is null or country = p_country)
      and (p_game is null or game_id = p_game)
      and (p_search is null or body ilike '%' || p_search || '%' or name ilike '%' || p_search || '%')
  )
  select jsonb_build_object(
    'total', (select count(*) from c),
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'game_id', game_id, 'name', name, 'body', body, 'country', country,
        'created_at', created_at, 'edited_at', edited_at) order by id desc)
      from (select * from c order by id desc limit 25 offset greatest(coalesce(p_page, 1) - 1, 0) * 25) t
    ), '[]'::jsonb)
  );
$$;

-- Filter options for the admin filter bar.
create or replace function public.admin_filter_options()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'countries', coalesce((select jsonb_agg(c order by c) from (select distinct country c from public.sessions where country is not null) t), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(d order by d) from (select distinct coalesce(device_type, 'desktop') d from public.sessions) t), '[]'::jsonb),
    'paths', coalesce((select jsonb_agg(p order by p) from (select distinct path p from public.events where name = 'page_view' limit 200) t), '[]'::jsonb)
  );
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'vote_counts(text)', 'cast_vote(text, text, smallint, text)', 'game_feedback(text, text, int, bigint)',
    'post_comment(text, text, text, text, inet, text)', 'edit_comment(bigint, text, text, text)',
    'admin_is_locked(inet)', 'admin_login_attempt(inet, boolean)',
    'admin_page_views(timestamptz, timestamptz, text, text, text)', 'admin_kpis(timestamptz, timestamptz, text, text, text)',
    'admin_overview(timestamptz, timestamptz, text, text, text)', 'admin_audience(timestamptz, timestamptz, text, text, text)',
    'admin_downloads(timestamptz, timestamptz, text)', 'admin_signups(timestamptz, timestamptz, text, int)',
    'admin_games(timestamptz, timestamptz, text)', 'admin_comments(timestamptz, timestamptz, text, text, text, int)',
    'admin_filter_options()'
  ] loop
    execute format('revoke execute on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;

-- ───────────── retention ─────────────

create or replace function public.purge_old_metrics()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.sessions set ip = null, user_agent = null where started_at < now() - interval '90 days' and (ip is not null or user_agent is not null);
  update public.downloads set ip = null where created_at < now() - interval '90 days' and ip is not null;
  update public.subscribers set consent_ip = null where created_at < now() - interval '90 days' and consent_ip is not null;
  update public.game_comments set ip = null where created_at < now() - interval '90 days' and ip is not null;
  delete from public.admin_login_attempts where created_at < now() - interval '1 day';
  delete from public.events where created_at < now() - interval '13 months';
  delete from public.sessions where started_at < now() - interval '13 months';
  delete from public.visitors where last_seen < now() - interval '13 months';
$$;
revoke execute on function public.purge_old_metrics() from public, anon, authenticated;
