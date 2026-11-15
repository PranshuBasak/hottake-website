-- HotTake website: full Supabase setup. Paste into Supabase > SQL Editor > New query > Run. Safe to run once.

-- HotTake website: visitors, sessions, events, subscribers, releases, downloads.
-- Only the server (secret key → service_role) writes. Visitors' browsers never talk to these tables.
-- RLS is on everywhere; the only public policy is read access to published releases.

create extension if not exists pg_cron with schema pg_catalog;

-- ───────────── tables ─────────────

create table public.visitors (
  id uuid primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  visits integer not null default 1 check (visits >= 1)
);

create table public.sessions (
  id uuid primary key,
  visitor_id uuid not null references public.visitors (id) on delete cascade,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ip inet,
  country text,
  region text,
  city text,
  user_agent text,
  browser text,
  browser_version text,
  os text,
  os_version text,
  device_type text,
  device_vendor text,
  device_model text,
  is_bot boolean not null default false,
  languages text[],
  timezone text,
  screen text,
  viewport text,
  pixel_ratio real,
  color_scheme text,
  reduced_motion boolean,
  cpu_cores smallint,
  device_memory real,
  connection text,
  touch boolean,
  referrer text,
  landing_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text
);
create index sessions_visitor_id_idx on public.sessions (visitor_id);
create index sessions_started_at_idx on public.sessions (started_at);

create table public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor_id uuid references public.visitors (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete cascade,
  consented boolean not null,
  name text not null check (char_length(name) between 1 and 40),
  path text not null check (char_length(path) <= 300),
  props jsonb not null default '{}'::jsonb
);
create index events_created_at_idx on public.events (created_at);
create index events_session_id_idx on public.events (session_id);
create index events_visitor_id_idx on public.events (visitor_id);
create index events_name_created_idx on public.events (name, created_at);

create table public.subscribers (
  id bigint generated always as identity primary key,
  email text not null check (char_length(email) <= 254 and email = lower(email)),
  created_at timestamptz not null default now(),
  source text not null default 'site',
  consent_ip inet,
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at timestamptz
);
create unique index subscribers_email_key on public.subscribers (email);
create unique index subscribers_token_key on public.subscribers (unsubscribe_token);
create index subscribers_ip_created_idx on public.subscribers (consent_ip, created_at);

create table public.releases (
  id bigint generated always as identity primary key,
  version text not null unique,
  file_name text not null,
  url text not null,
  size_bytes bigint not null check (size_bytes > 0),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  notes text,
  published_at timestamptz not null default now(),
  is_latest boolean not null default false
);
create unique index releases_one_latest on public.releases (is_latest) where is_latest;

create table public.downloads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  release_id bigint references public.releases (id) on delete set null,
  visitor_id uuid references public.visitors (id) on delete set null,
  ip inet,
  country text,
  referrer text
);
create index downloads_created_at_idx on public.downloads (created_at);
create index downloads_release_id_idx on public.downloads (release_id);
create index downloads_visitor_id_idx on public.downloads (visitor_id);

-- ───────────── security ─────────────

alter table public.visitors enable row level security;
alter table public.sessions enable row level security;
alter table public.events enable row level security;
alter table public.subscribers enable row level security;
alter table public.releases enable row level security;
alter table public.downloads enable row level security;

revoke all on public.visitors, public.sessions, public.events, public.subscribers, public.downloads from anon, authenticated;
revoke insert, update, delete on public.releases from anon, authenticated;
grant select on public.releases to anon, authenticated;
create policy "published releases are public" on public.releases for select to anon, authenticated using (true);

-- ───────────── write functions (service_role only) ─────────────

-- One round trip per hit: upsert visitor + session (when consented) and append the event.
create or replace function public.track_hit(p_visitor jsonb, p_session jsonb, p_event jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := nullif(p_visitor ->> 'id', '')::uuid;
  s_id uuid := nullif(p_session ->> 'id', '')::uuid;
begin
  if v_id is not null then
    insert into public.visitors as v (id) values (v_id)
    on conflict (id) do update
      set last_seen = now(),
          visits = v.visits + case when (p_visitor ->> 'new_visit')::boolean then 1 else 0 end;
  end if;

  if s_id is not null and v_id is not null then
    insert into public.sessions (
      id, visitor_id, ip, country, region, city, user_agent, browser, browser_version, os, os_version,
      device_type, device_vendor, device_model, is_bot, languages, timezone, screen, viewport, pixel_ratio,
      color_scheme, reduced_motion, cpu_cores, device_memory, connection, touch, referrer, landing_path,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content
    ) values (
      s_id, v_id, nullif(p_session ->> 'ip', '')::inet, p_session ->> 'country', p_session ->> 'region',
      p_session ->> 'city', p_session ->> 'user_agent', p_session ->> 'browser', p_session ->> 'browser_version',
      p_session ->> 'os', p_session ->> 'os_version', p_session ->> 'device_type', p_session ->> 'device_vendor',
      p_session ->> 'device_model', coalesce((p_session ->> 'is_bot')::boolean, false),
      case when jsonb_typeof(p_session -> 'languages') = 'array'
        then array(select jsonb_array_elements_text(p_session -> 'languages')) end,
      p_session ->> 'timezone', p_session ->> 'screen', p_session ->> 'viewport',
      (p_session ->> 'pixel_ratio')::real, p_session ->> 'color_scheme', (p_session ->> 'reduced_motion')::boolean,
      (p_session ->> 'cpu_cores')::smallint, (p_session ->> 'device_memory')::real, p_session ->> 'connection',
      (p_session ->> 'touch')::boolean, p_session ->> 'referrer', p_session ->> 'landing_path',
      p_session ->> 'utm_source', p_session ->> 'utm_medium', p_session ->> 'utm_campaign',
      p_session ->> 'utm_term', p_session ->> 'utm_content'
    )
    on conflict (id) do update set last_seen_at = now();
  end if;

  insert into public.events (visitor_id, session_id, consented, name, path, props)
  values (
    v_id,
    case when v_id is not null then s_id end,
    v_id is not null,
    left(p_event ->> 'name', 40),
    left(coalesce(p_event ->> 'path', '/'), 300),
    coalesce(p_event -> 'props', '{}'::jsonb)
  );
end;
$$;

-- Returns 'subscribed' | 'already' | 'resubscribed' | 'rate_limited'.
create or replace function public.subscribe(p_email text, p_source text, p_ip inet)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.subscribers%rowtype;
begin
  if p_ip is not null and (
    select count(*) from public.subscribers
    where consent_ip = p_ip and created_at > now() - interval '1 hour'
  ) >= 5 then
    return 'rate_limited';
  end if;

  select * into existing from public.subscribers where email = lower(p_email);
  if found then
    if existing.unsubscribed_at is not null then
      update public.subscribers set unsubscribed_at = null, consent_ip = p_ip, source = p_source where id = existing.id;
      return 'resubscribed';
    end if;
    return 'already';
  end if;

  insert into public.subscribers (email, source, consent_ip) values (lower(p_email), p_source, p_ip);
  return 'subscribed';
end;
$$;

create or replace function public.unsubscribe(p_token uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with u as (
    update public.subscribers set unsubscribed_at = coalesce(unsubscribed_at, now())
    where unsubscribe_token = p_token
    returning 1
  )
  select exists (select 1 from u);
$$;

create or replace function public.log_download(p_release_id bigint, p_visitor_id uuid, p_ip inet, p_country text, p_referrer text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.downloads (release_id, visitor_id, ip, country, referrer)
  values (
    p_release_id,
    (select id from public.visitors where id = p_visitor_id),
    p_ip, p_country, left(p_referrer, 500)
  );
$$;

revoke execute on function public.track_hit(jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.subscribe(text, text, inet) from public, anon, authenticated;
revoke execute on function public.unsubscribe(uuid) from public, anon, authenticated;
revoke execute on function public.log_download(bigint, uuid, inet, text, text) from public, anon, authenticated;
grant execute on function public.track_hit(jsonb, jsonb, jsonb) to service_role;
grant execute on function public.subscribe(text, text, inet) to service_role;
grant execute on function public.unsubscribe(uuid) to service_role;
grant execute on function public.log_download(bigint, uuid, inet, text, text) to service_role;

-- ───────────── retention (stated in the Privacy Policy) ─────────────

create or replace function public.purge_old_metrics()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.sessions set ip = null, user_agent = null where started_at < now() - interval '90 days' and (ip is not null or user_agent is not null);
  update public.downloads set ip = null where created_at < now() - interval '90 days' and ip is not null;
  update public.subscribers set consent_ip = null where created_at < now() - interval '90 days' and consent_ip is not null;
  delete from public.events where created_at < now() - interval '13 months';
  delete from public.sessions where started_at < now() - interval '13 months';
  delete from public.visitors where last_seen < now() - interval '13 months';
$$;
revoke execute on function public.purge_old_metrics() from public, anon, authenticated;

select cron.schedule('hottake-purge-old-metrics', '17 3 * * *', 'select public.purge_old_metrics()');

-- ───────────── reporting views (read in the Supabase dashboard) ─────────────

create view public.metrics_daily with (security_invoker = true) as
select date_trunc('day', created_at)::date as day,
       count(*) filter (where name = 'page_view') as page_views,
       count(distinct visitor_id) filter (where name = 'page_view') as visitors,
       count(*) filter (where name = 'page_view' and not consented) as anonymous_page_views,
       count(*) filter (where name = 'download_click') as download_clicks,
       count(*) filter (where name = 'subscribe') as subscribes
from public.events
group by 1
order by 1 desc;

create view public.metrics_top_pages with (security_invoker = true) as
select path, count(*) as views, count(distinct visitor_id) as visitors
from public.events
where name = 'page_view' and created_at > now() - interval '30 days'
group by path
order by views desc;

create view public.metrics_countries with (security_invoker = true) as
select coalesce(country, 'unknown') as country, count(*) as sessions
from public.sessions
where started_at > now() - interval '30 days'
group by 1
order by sessions desc;

create view public.metrics_devices with (security_invoker = true) as
select coalesce(device_type, 'desktop') as device_type, coalesce(os, 'unknown') as os,
       coalesce(browser, 'unknown') as browser, count(*) as sessions
from public.sessions
where started_at > now() - interval '30 days' and not is_bot
group by 1, 2, 3
order by sessions desc;

create view public.metrics_downloads_daily with (security_invoker = true) as
select date_trunc('day', d.created_at)::date as day, r.version, count(*) as downloads
from public.downloads d left join public.releases r on r.id = d.release_id
group by 1, 2
order by 1 desc;

create view public.metrics_subscribers_daily with (security_invoker = true) as
select date_trunc('day', created_at)::date as day, count(*) as new_subscribers,
       count(*) filter (where unsubscribed_at is not null) as since_unsubscribed
from public.subscribers
group by 1
order by 1 desc;

revoke all on public.metrics_daily, public.metrics_top_pages, public.metrics_countries, public.metrics_devices,
  public.metrics_downloads_daily, public.metrics_subscribers_daily from anon, authenticated;

-- ───────────── storage bucket for the installer ─────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('releases', 'releases', true, 52428800, array['application/octet-stream', 'application/x-msdownload', 'application/vnd.microsoft.portable-executable'])
on conflict (id) do nothing;

-- Open health endpoint bookkeeping: one row that counts checks and remembers when the last one ran.

create table public.health_checks (
  id smallint primary key default 1 check (id = 1),
  check_count bigint not null default 0,
  last_checked_at timestamptz,
  last_status text
);
insert into public.health_checks (id) values (1) on conflict (id) do nothing;

alter table public.health_checks enable row level security;
revoke all on public.health_checks from anon, authenticated;

-- Increments the counter and returns the new count plus the previous check time.
-- Also proves the database answers reads and writes.
create or replace function public.record_health_check(p_status text)
returns table (check_count bigint, previous_checked_at timestamptz, checked_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  prev timestamptz;
begin
  select h.last_checked_at into prev from public.health_checks h where h.id = 1 for update;
  return query
  update public.health_checks h
     set check_count = h.check_count + 1,
         last_checked_at = now(),
         last_status = left(p_status, 20)
   where h.id = 1
  returning h.check_count, prev, h.last_checked_at;
end;
$$;

revoke execute on function public.record_health_check(text) from public, anon, authenticated;
grant execute on function public.record_health_check(text) to service_role;
