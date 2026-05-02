-- Create beam_projects table
create table if not exists public.beam_projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Untitled Project',
  beam_length float not null default 10,
  support_a   float not null default 0,
  support_b   float not null default 10,
  loads       jsonb not null default '[]'::jsonb,
  material    jsonb not null default '{}'::jsonb,
  section     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Index for fast per-user project listing (ordered by last-modified)
create index if not exists beam_projects_user_updated
  on public.beam_projects (user_id, updated_at desc);

-- Row Level Security: users can only access their own projects
alter table public.beam_projects enable row level security;

create policy "Users can select their own projects"
  on public.beam_projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.beam_projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.beam_projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.beam_projects for delete
  using (auth.uid() = user_id);
