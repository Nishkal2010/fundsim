-- Deal shares table — stores serialized simulator state for public shareable URLs
create table if not exists deal_shares (
  id uuid primary key default gen_random_uuid(),
  simulator text not null check (simulator in ('pe','vc','ib')),
  tab text not null default '',
  inputs jsonb not null default '{}',
  summary jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Public read (no auth needed to view a shared deal)
alter table deal_shares enable row level security;
create policy "Public read deal_shares"
  on deal_shares for select using (true);

-- Anyone can insert (authed or anon)
create policy "Anyone can create deal_shares"
  on deal_shares for insert with check (true);
