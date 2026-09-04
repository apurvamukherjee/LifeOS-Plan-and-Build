-- LifeOS Supabase schema (Stage 1 MVP). See docs/DATA_MODEL.md and docs/SYNC_DESIGN.md.
--
-- Apply this once to a fresh Supabase project (SQL Editor -> paste -> Run, or via the
-- `supabase` CLI: `supabase db push` against this file). Safe to re-run: every statement is
-- guarded with IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS where applicable.

create extension if not exists pgcrypto;

-- Shared trigger: stamps server_updated_at with the SERVER's clock on every insert/update.
-- This is the sync cursor column (see docs/SYNC_DESIGN.md) — deliberately separate from the
-- client-supplied `updated_at`, which is used only for last-write-wins merge decisions and can
-- come from a clock-skewed device.
create or replace function set_server_updated_at()
returns trigger language plpgsql as $$
begin
  new.server_updated_at = now();
  return new;
end;
$$;

-- water_logs -----------------------------------------------------------------------------
create table if not exists water_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  amount_ml integer not null,
  logged_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_water_logs_server_updated_at on water_logs;
create trigger trg_water_logs_server_updated_at
  before insert or update on water_logs
  for each row execute function set_server_updated_at();
alter table water_logs enable row level security;
drop policy if exists "select own" on water_logs;
drop policy if exists "insert own" on water_logs;
drop policy if exists "update own" on water_logs;
drop policy if exists "delete own" on water_logs;
create policy "select own" on water_logs for select using (user_id = auth.uid());
create policy "insert own" on water_logs for insert with check (user_id = auth.uid());
create policy "update own" on water_logs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on water_logs for delete using (user_id = auth.uid());

-- settings ---------------------------------------------------------------------------------
create table if not exists settings (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  module_key text not null,
  key text not null,
  value jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  unique (user_id, module_key, key)
);
drop trigger if exists trg_settings_server_updated_at on settings;
create trigger trg_settings_server_updated_at
  before insert or update on settings
  for each row execute function set_server_updated_at();
alter table settings enable row level security;
drop policy if exists "select own" on settings;
drop policy if exists "insert own" on settings;
drop policy if exists "update own" on settings;
drop policy if exists "delete own" on settings;
create policy "select own" on settings for select using (user_id = auth.uid());
create policy "insert own" on settings for insert with check (user_id = auth.uid());
create policy "update own" on settings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on settings for delete using (user_id = auth.uid());

-- supplements ------------------------------------------------------------------------------
create table if not exists supplements (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null,
  dose_amount numeric not null,
  dose_unit text not null,
  category text not null,
  schedule_rule jsonb not null,
  cycle_config jsonb,
  current_stock numeric not null,
  low_stock_threshold numeric not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_supplements_server_updated_at on supplements;
create trigger trg_supplements_server_updated_at
  before insert or update on supplements
  for each row execute function set_server_updated_at();
alter table supplements enable row level security;
drop policy if exists "select own" on supplements;
drop policy if exists "insert own" on supplements;
drop policy if exists "update own" on supplements;
drop policy if exists "delete own" on supplements;
create policy "select own" on supplements for select using (user_id = auth.uid());
create policy "insert own" on supplements for insert with check (user_id = auth.uid());
create policy "update own" on supplements for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on supplements for delete using (user_id = auth.uid());

-- supplement_logs --------------------------------------------------------------------------
create table if not exists supplement_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  supplement_id uuid not null,
  logged_at timestamptz not null,
  amount numeric not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_supplement_logs_server_updated_at on supplement_logs;
create trigger trg_supplement_logs_server_updated_at
  before insert or update on supplement_logs
  for each row execute function set_server_updated_at();
alter table supplement_logs enable row level security;
drop policy if exists "select own" on supplement_logs;
drop policy if exists "insert own" on supplement_logs;
drop policy if exists "update own" on supplement_logs;
drop policy if exists "delete own" on supplement_logs;
create policy "select own" on supplement_logs for select using (user_id = auth.uid());
create policy "insert own" on supplement_logs for insert with check (user_id = auth.uid());
create policy "update own" on supplement_logs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on supplement_logs for delete using (user_id = auth.uid());

-- tasks --------------------------------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  title text not null,
  notes text not null default '',
  due_at timestamptz,
  priority text not null,
  recurrence_rule jsonb,
  completed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_tasks_server_updated_at on tasks;
create trigger trg_tasks_server_updated_at
  before insert or update on tasks
  for each row execute function set_server_updated_at();
alter table tasks enable row level security;
drop policy if exists "select own" on tasks;
drop policy if exists "insert own" on tasks;
drop policy if exists "update own" on tasks;
drop policy if exists "delete own" on tasks;
create policy "select own" on tasks for select using (user_id = auth.uid());
create policy "insert own" on tasks for insert with check (user_id = auth.uid());
create policy "update own" on tasks for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on tasks for delete using (user_id = auth.uid());

-- reminders ----------------------------------------------------------------------------------
create table if not exists reminders (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  entity_type text not null,
  entity_id uuid not null,
  scheduled_at timestamptz not null,
  repeat_rule jsonb,
  channel text not null,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_reminders_server_updated_at on reminders;
create trigger trg_reminders_server_updated_at
  before insert or update on reminders
  for each row execute function set_server_updated_at();
alter table reminders enable row level security;
drop policy if exists "select own" on reminders;
drop policy if exists "insert own" on reminders;
drop policy if exists "update own" on reminders;
drop policy if exists "delete own" on reminders;
create policy "select own" on reminders for select using (user_id = auth.uid());
create policy "insert own" on reminders for insert with check (user_id = auth.uid());
create policy "update own" on reminders for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on reminders for delete using (user_id = auth.uid());

-- streaks ------------------------------------------------------------------------------------
create table if not exists streaks (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  module_key text not null,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_local_date date,
  freezes_available integer not null default 0,
  freezes_used_dates jsonb not null default '[]'::jsonb,
  last_evaluated_local_date date,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  unique (user_id, module_key)
);
drop trigger if exists trg_streaks_server_updated_at on streaks;
create trigger trg_streaks_server_updated_at
  before insert or update on streaks
  for each row execute function set_server_updated_at();
alter table streaks enable row level security;
drop policy if exists "select own" on streaks;
drop policy if exists "insert own" on streaks;
drop policy if exists "update own" on streaks;
drop policy if exists "delete own" on streaks;
create policy "select own" on streaks for select using (user_id = auth.uid());
create policy "insert own" on streaks for insert with check (user_id = auth.uid());
create policy "update own" on streaks for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on streaks for delete using (user_id = auth.uid());

-- push_subscriptions ---------------------------------------------------------------------------
create table if not exists push_subscriptions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  endpoint text not null,
  keys jsonb not null,
  user_agent text not null default '',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_push_subscriptions_server_updated_at on push_subscriptions;
create trigger trg_push_subscriptions_server_updated_at
  before insert or update on push_subscriptions
  for each row execute function set_server_updated_at();
alter table push_subscriptions enable row level security;
drop policy if exists "select own" on push_subscriptions;
drop policy if exists "insert own" on push_subscriptions;
drop policy if exists "update own" on push_subscriptions;
drop policy if exists "delete own" on push_subscriptions;
create policy "select own" on push_subscriptions for select using (user_id = auth.uid());
create policy "insert own" on push_subscriptions for insert with check (user_id = auth.uid());
create policy "update own" on push_subscriptions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on push_subscriptions for delete using (user_id = auth.uid());
