-- Departments table
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Agents table
create table if not exists public.agents (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name          text not null,
  system_prompt text not null default '',
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists departments_user_id_idx on public.departments(user_id);
create index if not exists agents_department_id_idx on public.agents(department_id);

-- Row Level Security
alter table public.departments enable row level security;
alter table public.agents enable row level security;

-- Departments: users can only see/edit their own
create policy "departments_select" on public.departments
  for select using (auth.uid() = user_id);

create policy "departments_insert" on public.departments
  for insert with check (auth.uid() = user_id);

create policy "departments_update" on public.departments
  for update using (auth.uid() = user_id);

create policy "departments_delete" on public.departments
  for delete using (auth.uid() = user_id);

-- Agents: users can only see/edit agents in their own departments
create policy "agents_select" on public.agents
  for select using (
    exists (
      select 1 from public.departments d
      where d.id = agents.department_id and d.user_id = auth.uid()
    )
  );

create policy "agents_insert" on public.agents
  for insert with check (
    exists (
      select 1 from public.departments d
      where d.id = agents.department_id and d.user_id = auth.uid()
    )
  );

create policy "agents_update" on public.agents
  for update using (
    exists (
      select 1 from public.departments d
      where d.id = agents.department_id and d.user_id = auth.uid()
    )
  );

create policy "agents_delete" on public.agents
  for delete using (
    exists (
      select 1 from public.departments d
      where d.id = agents.department_id and d.user_id = auth.uid()
    )
  );
