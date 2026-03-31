-- Fieldset — Kanban Board Schema

create extension if not exists "uuid-ossp";

-- Team Members (create before tasks for FK reference)
create table team_members (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  color      text not null default '#6366f1',
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Tasks
create table tasks (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  status      text not null default 'todo'
                check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority    text not null default 'normal'
                check (priority in ('low', 'normal', 'high')),
  due_date    date,
  assignee_id uuid references team_members(id) on delete set null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Row Level Security
alter table tasks        enable row level security;
alter table team_members enable row level security;

create policy "Own tasks" on tasks
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Own team members" on team_members
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
