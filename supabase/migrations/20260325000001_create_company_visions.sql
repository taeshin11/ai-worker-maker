create table if not exists public.company_visions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  title            text not null default '',
  tagline          text not null default '',
  problem          text not null default '',
  solution         text not null default '',
  target_audience  text not null default '',
  key_features     text[] not null default '{}',
  tone             text not null default 'Professional',
  status           text not null default 'draft',  -- draft | approved
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists company_visions_user_id_idx on public.company_visions(user_id);

alter table public.company_visions enable row level security;

create policy "visions_select" on public.company_visions
  for select using (auth.uid() = user_id);

create policy "visions_insert" on public.company_visions
  for insert with check (auth.uid() = user_id);

create policy "visions_update" on public.company_visions
  for update using (auth.uid() = user_id);

create policy "visions_delete" on public.company_visions
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger visions_updated_at
  before update on public.company_visions
  for each row execute procedure public.touch_updated_at();
