-- Security hardening migration:
--   1. Enable RLS on fund_models so users can only see/edit their own rows.
--   2. Cap JSONB column sizes on deal_shares to prevent storage abuse from
--      anonymous inserts (the existing policy intentionally allows anon
--      inserts so unauth'd users can publish shareable links).

-- ── fund_models RLS ──────────────────────────────────────────────────
-- Create the table defensively in case it was created out-of-band via
-- the Supabase dashboard with no migration on disk.
create table if not exists public.fund_models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fund_models enable row level security;

drop policy if exists "fund_models_select_own" on public.fund_models;
create policy "fund_models_select_own"
  on public.fund_models for select
  using (auth.uid() = user_id);

drop policy if exists "fund_models_insert_own" on public.fund_models;
create policy "fund_models_insert_own"
  on public.fund_models for insert
  with check (auth.uid() = user_id);

drop policy if exists "fund_models_update_own" on public.fund_models;
create policy "fund_models_update_own"
  on public.fund_models for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "fund_models_delete_own" on public.fund_models;
create policy "fund_models_delete_own"
  on public.fund_models for delete
  using (auth.uid() = user_id);

-- ── deal_shares size guard ───────────────────────────────────────────
-- Bound the JSONB payload so a bot inserting thousands of giant rows
-- can't blow up storage. 32KB per blob is comfortably more than any
-- legitimate simulator snapshot needs (typical payload is < 4KB).
alter table public.deal_shares
  drop constraint if exists deal_shares_inputs_size_check;
alter table public.deal_shares
  add constraint deal_shares_inputs_size_check
  check (octet_length(inputs::text) <= 32768);

alter table public.deal_shares
  drop constraint if exists deal_shares_summary_size_check;
alter table public.deal_shares
  add constraint deal_shares_summary_size_check
  check (octet_length(summary::text) <= 32768);
