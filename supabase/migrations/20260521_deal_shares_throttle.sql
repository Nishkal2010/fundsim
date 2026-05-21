-- Throttle & TTL for deal_shares
--
-- Problem: deal_shares allowed unrestricted anonymous inserts. An attacker
-- could flood the table with 32 KB rows (per the size caps from
-- 20260513_security_hardening.sql) until storage quota or billing escalated.
-- There was also no cleanup — rows accumulated forever.
--
-- Fix:
--   1. Add a created_at index to make range-delete (cleanup) fast.
--   2. Add a cleanup function that deletes rows older than 90 days.
--   3. Drop the open anon-insert policy and replace it with a policy that
--      requires the service-role key (via the new /api/share-create endpoint).
--      Anon SELECT is preserved — public sharing links still work.
--
-- Scheduling the cleanup (choose one):
--   a) pg_cron (recommended): enable the pg_cron extension in the Supabase
--      dashboard (Database > Extensions > pg_cron), then run:
--
--        SELECT cron.schedule(
--          'cleanup-old-deal-shares',  -- job name
--          '0 3 * * *',               -- daily at 03:00 UTC
--          $$ SELECT cleanup_old_deal_shares(); $$
--        );
--
--   b) Manual: connect with psql and call SELECT cleanup_old_deal_shares();
--      whenever you want. There is no automatic cleanup until you schedule it.

-- ── 1. Index on created_at ────────────────────────────────────────────────
-- Makes the DELETE in cleanup_old_deal_shares() an index range scan instead
-- of a sequential scan. Also speeds up any dashboard query sorted by date.
create index if not exists deal_shares_created_at_idx
  on public.deal_shares (created_at);

-- ── 2. Cleanup function ───────────────────────────────────────────────────
-- SECURITY DEFINER so it can be called by a cron role or a restricted user
-- without needing DELETE privilege on the table directly.
-- The search_path is pinned to public to prevent search-path injection.
create or replace function public.cleanup_old_deal_shares()
  returns void
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  delete from public.deal_shares
  where created_at < now() - interval '90 days';
end;
$$;

-- Only the postgres (superuser) role should be able to call this directly;
-- anon and authenticated roles have no reason to invoke cleanup.
revoke execute on function public.cleanup_old_deal_shares() from public, anon, authenticated;

-- ── 3. RLS policy swap — close the anon-insert hole ──────────────────────
-- Wrapped in a transaction so that if either the DROP or the CREATE fails,
-- neither statement commits — the table never ends up with zero insert policies
-- or two conflicting ones.
begin;

-- Drop the original open policy from 20260430_deal_shares.sql.
drop policy if exists "Anyone can create deal_shares" on public.deal_shares;

-- New policy: inserts are allowed only when the caller is the service role.
-- The service role bypasses RLS entirely (Supabase default), so this policy
-- is effectively a hard block for every other role (anon, authenticated).
-- The new /api/share-create serverless endpoint uses the service-role key,
-- so all legitimate client inserts flow through it.
--
-- Note: if you ever need authenticated users to insert directly (e.g. for
-- a future "save to account" flow), add a separate policy scoped to
-- `auth.uid() is not null` at that time. Don't re-open anon insert.
create policy "Service role only insert deal_shares"
  on public.deal_shares for insert
  with check (false);
-- with check (false) on its own would block everyone, including the service
-- role — but the service role bypasses RLS in Supabase, so service-role
-- inserts still succeed while every other role is denied.

commit;
