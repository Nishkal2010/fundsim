-- NOT YET APPLIED. Run this against the FundSim Supabase project
-- (jqkrtxbgypxttmxwgdqs) before or with the deploy that ships the matching
-- api/chat.ts change. Until it exists, consume_spend_quota returns 404, the
-- endpoint fails CLOSED, and /api/chat refuses every caller. That is the
-- intended direction: an uncountable call is one we do not make.
--
-- WHY. api/chat.ts had no authentication at all. The only gate was an Origin
-- header, which is one curl flag, and the "30 questions a day" quota lived in
-- the browser's localStorage (src/utils/finfoxApi.ts), so it bound nobody who
-- was not using the UI. The server-side limiter was an in-memory Map, which is
-- per-instance by construction: a burst lands on cold lambdas that each start
-- empty. Behind that sat claude-opus-4-8.
--
-- The ceiling lives in this FUNCTION, never in the caller's arguments, so a
-- forged request cannot widen its own limit. Subjects are hashed, so the table
-- never holds a raw IP or a bare user id.
create table if not exists public.spend_counters (
  subject_hash text    not null,
  day          date    not null,
  endpoint     text    not null,
  count        integer not null default 0,
  primary key (subject_hash, day, endpoint)
);

comment on table public.spend_counters is
  'Daily per-subject counters for model calls. Holds sha256(subject|endpoint), never a raw IP or user id. Written only by consume_spend_quota; purged after 7 days.';

-- RLS on with zero policies and all grants revoked: anon and authenticated
-- cannot read or write this table at all. The SECURITY DEFINER function below
-- is the only way in, which is what keeps the counter honest.
alter table public.spend_counters enable row level security;
revoke all on public.spend_counters from public, anon, authenticated;

create or replace function public.consume_spend_quota(p_subject text, p_endpoint text)
returns table(allowed boolean, used integer, quota integer)
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  v_quota int;
  v_hash  text;
  v_day   date := (now() at time zone 'utc')::date;
  v_count int;
begin
  -- Signed-in callers are identified, so they get the allowance the product
  -- advertises. Anonymous callers share an IP with everyone behind their NAT,
  -- so theirs is deliberately small: it exists to keep the demo working, not
  -- to serve real usage.
  v_quota := case p_endpoint
               when 'chat_user' then 60
               when 'chat_anon' then 10
               else 5
             end;

  if p_subject is null or p_subject = '' or p_subject like '%:unknown' then
    -- No usable subject means no way to bound the spend.
    return query select false, 0, v_quota;
    return;
  end if;

  v_hash := encode(sha256(convert_to(p_subject || '|' || p_endpoint, 'utf8')), 'hex');

  insert into public.spend_counters as c (subject_hash, day, endpoint, count)
  values (v_hash, v_day, p_endpoint, 1)
  on conflict (subject_hash, day, endpoint)
    do update set count = c.count + 1
  returning c.count into v_count;

  return query select v_count <= v_quota, v_count, v_quota;
end;
$function$;

comment on function public.consume_spend_quota(text, text) is
  'Atomically increments and tests a daily quota for one subject and endpoint. The ceiling is fixed in the function body so a caller cannot raise it.';

revoke execute on function public.consume_spend_quota(text, text) from public;
grant execute on function public.consume_spend_quota(text, text) to anon, authenticated;

create or replace function public.purge_spend_counters()
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare n int;
begin
  delete from public.spend_counters
   where day < (now() at time zone 'utc')::date - 7;
  get diagnostics n = row_count;
  return n;
end;
$function$;

revoke execute on function public.purge_spend_counters() from public, anon, authenticated;
