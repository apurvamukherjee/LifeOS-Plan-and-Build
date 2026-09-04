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

-- ============================================================================
-- Stage 2: Wishlist, Notes, Expenses, Food, Gym, Medication
-- ============================================================================

-- wishlist_items --------------------------------------------------------------
create table if not exists wishlist_items (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null,
  price numeric not null,
  quantity numeric not null,
  category text not null,
  store text not null,
  want_need_level integer not null,
  sort_order integer not null,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_wishlist_items_server_updated_at on wishlist_items;
create trigger trg_wishlist_items_server_updated_at
  before insert or update on wishlist_items
  for each row execute function set_server_updated_at();
alter table wishlist_items enable row level security;
drop policy if exists "select own" on wishlist_items;
drop policy if exists "insert own" on wishlist_items;
drop policy if exists "update own" on wishlist_items;
drop policy if exists "delete own" on wishlist_items;
create policy "select own" on wishlist_items for select using (user_id = auth.uid());
create policy "insert own" on wishlist_items for insert with check (user_id = auth.uid());
create policy "update own" on wishlist_items for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on wishlist_items for delete using (user_id = auth.uid());

-- notes -----------------------------------------------------------------------
create table if not exists notes (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  title text,
  body text not null,
  tags jsonb not null default '[]'::jsonb,
  color text,
  is_pinned boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_notes_server_updated_at on notes;
create trigger trg_notes_server_updated_at
  before insert or update on notes
  for each row execute function set_server_updated_at();
alter table notes enable row level security;
drop policy if exists "select own" on notes;
drop policy if exists "insert own" on notes;
drop policy if exists "update own" on notes;
drop policy if exists "delete own" on notes;
create policy "select own" on notes for select using (user_id = auth.uid());
create policy "insert own" on notes for insert with check (user_id = auth.uid());
create policy "update own" on notes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on notes for delete using (user_id = auth.uid());

-- expenses --------------------------------------------------------------------
create table if not exists expenses (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  amount numeric not null,
  direction text not null,
  category text not null,
  note text not null default '',
  occurred_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_expenses_server_updated_at on expenses;
create trigger trg_expenses_server_updated_at
  before insert or update on expenses
  for each row execute function set_server_updated_at();
alter table expenses enable row level security;
drop policy if exists "select own" on expenses;
drop policy if exists "insert own" on expenses;
drop policy if exists "update own" on expenses;
drop policy if exists "delete own" on expenses;
create policy "select own" on expenses for select using (user_id = auth.uid());
create policy "insert own" on expenses for insert with check (user_id = auth.uid());
create policy "update own" on expenses for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on expenses for delete using (user_id = auth.uid());

-- budgets ---------------------------------------------------------------------
create table if not exists budgets (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  category text not null,
  monthly_limit numeric not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  unique (user_id, category)
);
drop trigger if exists trg_budgets_server_updated_at on budgets;
create trigger trg_budgets_server_updated_at
  before insert or update on budgets
  for each row execute function set_server_updated_at();
alter table budgets enable row level security;
drop policy if exists "select own" on budgets;
drop policy if exists "insert own" on budgets;
drop policy if exists "update own" on budgets;
drop policy if exists "delete own" on budgets;
create policy "select own" on budgets for select using (user_id = auth.uid());
create policy "insert own" on budgets for insert with check (user_id = auth.uid());
create policy "update own" on budgets for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on budgets for delete using (user_id = auth.uid());

-- recurring_bills -------------------------------------------------------------
create table if not exists recurring_bills (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  label text not null,
  amount numeric not null,
  day_of_month integer not null,
  category text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_recurring_bills_server_updated_at on recurring_bills;
create trigger trg_recurring_bills_server_updated_at
  before insert or update on recurring_bills
  for each row execute function set_server_updated_at();
alter table recurring_bills enable row level security;
drop policy if exists "select own" on recurring_bills;
drop policy if exists "insert own" on recurring_bills;
drop policy if exists "update own" on recurring_bills;
drop policy if exists "delete own" on recurring_bills;
create policy "select own" on recurring_bills for select using (user_id = auth.uid());
create policy "insert own" on recurring_bills for insert with check (user_id = auth.uid());
create policy "update own" on recurring_bills for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on recurring_bills for delete using (user_id = auth.uid());

-- foods -----------------------------------------------------------------------
create table if not exists foods (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null,
  calories_per_serving numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  serving_unit text not null,
  is_saved_meal boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_foods_server_updated_at on foods;
create trigger trg_foods_server_updated_at
  before insert or update on foods
  for each row execute function set_server_updated_at();
alter table foods enable row level security;
drop policy if exists "select own" on foods;
drop policy if exists "insert own" on foods;
drop policy if exists "update own" on foods;
drop policy if exists "delete own" on foods;
create policy "select own" on foods for select using (user_id = auth.uid());
create policy "insert own" on foods for insert with check (user_id = auth.uid());
create policy "update own" on foods for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on foods for delete using (user_id = auth.uid());

-- food_logs -------------------------------------------------------------------
create table if not exists food_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  food_id uuid,
  free_text_name text,
  servings numeric not null,
  meal_slot text not null,
  logged_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_food_logs_server_updated_at on food_logs;
create trigger trg_food_logs_server_updated_at
  before insert or update on food_logs
  for each row execute function set_server_updated_at();
alter table food_logs enable row level security;
drop policy if exists "select own" on food_logs;
drop policy if exists "insert own" on food_logs;
drop policy if exists "update own" on food_logs;
drop policy if exists "delete own" on food_logs;
create policy "select own" on food_logs for select using (user_id = auth.uid());
create policy "insert own" on food_logs for insert with check (user_id = auth.uid());
create policy "update own" on food_logs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on food_logs for delete using (user_id = auth.uid());

-- exercises -------------------------------------------------------------------
create table if not exists exercises (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null,
  muscle_group text not null,
  equipment text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_exercises_server_updated_at on exercises;
create trigger trg_exercises_server_updated_at
  before insert or update on exercises
  for each row execute function set_server_updated_at();
alter table exercises enable row level security;
drop policy if exists "select own" on exercises;
drop policy if exists "insert own" on exercises;
drop policy if exists "update own" on exercises;
drop policy if exists "delete own" on exercises;
create policy "select own" on exercises for select using (user_id = auth.uid());
create policy "insert own" on exercises for insert with check (user_id = auth.uid());
create policy "update own" on exercises for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on exercises for delete using (user_id = auth.uid());

-- workouts --------------------------------------------------------------------
create table if not exists workouts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null,
  notes text not null default '',
  started_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_workouts_server_updated_at on workouts;
create trigger trg_workouts_server_updated_at
  before insert or update on workouts
  for each row execute function set_server_updated_at();
alter table workouts enable row level security;
drop policy if exists "select own" on workouts;
drop policy if exists "insert own" on workouts;
drop policy if exists "update own" on workouts;
drop policy if exists "delete own" on workouts;
create policy "select own" on workouts for select using (user_id = auth.uid());
create policy "insert own" on workouts for insert with check (user_id = auth.uid());
create policy "update own" on workouts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on workouts for delete using (user_id = auth.uid());

-- workout_sets ----------------------------------------------------------------
create table if not exists workout_sets (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  workout_id uuid not null,
  exercise_id uuid not null,
  set_index integer not null,
  reps integer not null,
  weight_kg numeric not null,
  rpe numeric,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_workout_sets_server_updated_at on workout_sets;
create trigger trg_workout_sets_server_updated_at
  before insert or update on workout_sets
  for each row execute function set_server_updated_at();
alter table workout_sets enable row level security;
drop policy if exists "select own" on workout_sets;
drop policy if exists "insert own" on workout_sets;
drop policy if exists "update own" on workout_sets;
drop policy if exists "delete own" on workout_sets;
create policy "select own" on workout_sets for select using (user_id = auth.uid());
create policy "insert own" on workout_sets for insert with check (user_id = auth.uid());
create policy "update own" on workout_sets for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on workout_sets for delete using (user_id = auth.uid());

-- workout_templates -----------------------------------------------------------
create table if not exists workout_templates (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null,
  exercise_order jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_workout_templates_server_updated_at on workout_templates;
create trigger trg_workout_templates_server_updated_at
  before insert or update on workout_templates
  for each row execute function set_server_updated_at();
alter table workout_templates enable row level security;
drop policy if exists "select own" on workout_templates;
drop policy if exists "insert own" on workout_templates;
drop policy if exists "update own" on workout_templates;
drop policy if exists "delete own" on workout_templates;
create policy "select own" on workout_templates for select using (user_id = auth.uid());
create policy "insert own" on workout_templates for insert with check (user_id = auth.uid());
create policy "update own" on workout_templates for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on workout_templates for delete using (user_id = auth.uid());

-- medications -----------------------------------------------------------------
create table if not exists medications (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null,
  dosage text not null,
  shape text not null,
  color text not null,
  instructions text not null default '',
  schedule_rule jsonb not null,
  current_stock numeric not null,
  low_stock_threshold numeric not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_medications_server_updated_at on medications;
create trigger trg_medications_server_updated_at
  before insert or update on medications
  for each row execute function set_server_updated_at();
alter table medications enable row level security;
drop policy if exists "select own" on medications;
drop policy if exists "insert own" on medications;
drop policy if exists "update own" on medications;
drop policy if exists "delete own" on medications;
create policy "select own" on medications for select using (user_id = auth.uid());
create policy "insert own" on medications for insert with check (user_id = auth.uid());
create policy "update own" on medications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on medications for delete using (user_id = auth.uid());

-- medication_logs -------------------------------------------------------------
create table if not exists medication_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  medication_id uuid not null,
  scheduled_at timestamptz not null,
  taken_at timestamptz,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now()
);
drop trigger if exists trg_medication_logs_server_updated_at on medication_logs;
create trigger trg_medication_logs_server_updated_at
  before insert or update on medication_logs
  for each row execute function set_server_updated_at();
alter table medication_logs enable row level security;
drop policy if exists "select own" on medication_logs;
drop policy if exists "insert own" on medication_logs;
drop policy if exists "update own" on medication_logs;
drop policy if exists "delete own" on medication_logs;
create policy "select own" on medication_logs for select using (user_id = auth.uid());
create policy "insert own" on medication_logs for insert with check (user_id = auth.uid());
create policy "update own" on medication_logs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on medication_logs for delete using (user_id = auth.uid());

