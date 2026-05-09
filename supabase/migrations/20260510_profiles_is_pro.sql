-- Add is_pro flag to profiles table for FundSim Pro gating
alter table public.profiles
  add column if not exists is_pro boolean not null default false;

-- Index for fast lookup in useProStatus hook
create index if not exists profiles_is_pro_idx on public.profiles (id) where is_pro = true;
