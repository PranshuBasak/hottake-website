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
