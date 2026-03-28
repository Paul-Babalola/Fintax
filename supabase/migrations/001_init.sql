-- ============================================================
-- Fintax Nigeria — Supabase Database Schema
-- Migration: 001_init.sql
-- Run in: Supabase Dashboard → SQL Editor, or via CLI:
--   npx supabase db push
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
-- uuid_generate_v4() for primary keys
create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────

create type income_source as enum (
  'salary',
  'freelance',
  'investment',
  'rental',
  'other'
);

create type expense_category as enum (
  'rent',
  'food',
  'transport',
  'utilities',
  'health',
  'education',
  'entertainment',
  'other'
);

create type deduction_type as enum (
  'rent_relief',
  'pension',
  'nhf',
  'life_assurance'
);

create type employment_type as enum (
  'employed',
  'self_employed',
  'both'
);

-- ============================================================
-- TABLE: user_profiles
-- One row per authenticated user.
-- Created automatically via trigger on auth.users insert.
-- ============================================================

create table public.user_profiles (
  id                          uuid primary key references auth.users(id) on delete cascade,
  employment_type             employment_type not null default 'employed',
  state_of_residence          text not null default 'lagos',
  annual_rent                 numeric(14, 2),           -- used for rent relief calculation
  monthly_pension_contribution numeric(14, 2),          -- auto-deduction: 8% of salary
  nhf_monthly_contribution    numeric(14, 2),           -- NHF: 2.5% of basic salary
  tax_year_start              date not null default '2026-01-01',
  onboarding_complete         boolean not null default false,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

comment on table public.user_profiles is
  'Extended user data. One row per auth.users entry. Used to populate NTA 2025 tax engine inputs.';

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.set_updated_at();

-- ── RLS: user_profiles ─────────────────────────────────────
alter table public.user_profiles enable row level security;

-- Users can only read their own profile
create policy "user_profiles: select own"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Users can only update their own profile
create policy "user_profiles: update own"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert is handled by the trigger (service role), not the user directly
-- No insert policy needed for anon/authenticated role

-- ============================================================
-- TABLE: income_entries
-- One row per income event. Source of truth for tax engine.
-- ============================================================

create table public.income_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      numeric(14, 2) not null check (amount > 0),
  source      income_source not null,
  date        date not null,
  notes       text,
  wht_rate    numeric(5, 4),    -- e.g. 0.1000 for 10%
  wht_amount  numeric(14, 2),   -- pre-calculated: amount * wht_rate
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.income_entries is
  'Manual income entries. Investment and rental entries auto-tagged with 10% WHT per NTA 2025 Section 51.';

comment on column public.income_entries.wht_rate is
  'Withholding tax rate applied at source. 0.10 for investment/rental income per NTA 2025.';

comment on column public.income_entries.wht_amount is
  'WHT amount already deducted. Credited against final PIT liability in tax engine.';

create index income_entries_user_id_date_idx
  on public.income_entries (user_id, date desc);

create trigger set_income_entries_updated_at
  before update on public.income_entries
  for each row execute procedure public.set_updated_at();

-- ── RLS: income_entries ────────────────────────────────────
alter table public.income_entries enable row level security;

create policy "income_entries: select own"
  on public.income_entries for select
  using (auth.uid() = user_id);

create policy "income_entries: insert own"
  on public.income_entries for insert
  with check (auth.uid() = user_id);

create policy "income_entries: update own"
  on public.income_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "income_entries: delete own"
  on public.income_entries for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TABLE: expenses
-- One row per expense event. Deductible flag drives tax engine.
-- ============================================================

create table public.expenses (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  amount          numeric(14, 2) not null check (amount > 0),
  category        expense_category not null,
  date            date not null,
  notes           text,
  is_deductible   boolean not null default false,
  deduction_type  deduction_type,
  receipt_url     text,           -- Supabase Storage path (Phase 2: WHT cert uploads)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Deductible entries must have a deduction_type
  constraint deductible_requires_type
    check (
      (is_deductible = false) or
      (is_deductible = true and deduction_type is not null)
    )
);

comment on table public.expenses is
  'Manual expense entries. is_deductible + deduction_type drive NTA 2025 relief calculations.';

create index expenses_user_id_date_idx
  on public.expenses (user_id, date desc);

create index expenses_user_id_category_idx
  on public.expenses (user_id, category);

create trigger set_expenses_updated_at
  before update on public.expenses
  for each row execute procedure public.set_updated_at();

-- ── RLS: expenses ──────────────────────────────────────────
alter table public.expenses enable row level security;

create policy "expenses: select own"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "expenses: insert own"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "expenses: update own"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "expenses: delete own"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TABLE: budgets
-- One row per category per user. Flat monthly limits.
-- ============================================================

create table public.budgets (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category      expense_category not null,
  monthly_limit numeric(14, 2) not null check (monthly_limit > 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- One budget limit per category per user
  unique (user_id, category)
);

comment on table public.budgets is
  'Monthly spending limits per category. Dashboard compares against expenses for progress bars.';

create index budgets_user_id_idx
  on public.budgets (user_id);

create trigger set_budgets_updated_at
  before update on public.budgets
  for each row execute procedure public.set_updated_at();

-- ── RLS: budgets ───────────────────────────────────────────
alter table public.budgets enable row level security;

create policy "budgets: select own"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "budgets: insert own"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "budgets: update own"
  on public.budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budgets: delete own"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TABLE: tax_snapshots
-- Periodic snapshots of the tax estimate. Not used in MVP UI
-- but written server-side monthly for historical tracking.
-- ============================================================

create table public.tax_snapshots (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  snapshot_month      date not null,           -- first day of the month (e.g. 2026-03-01)
  gross_income        numeric(14, 2) not null,
  taxable_income      numeric(14, 2) not null,
  total_deductions    numeric(14, 2) not null,
  pit_before_wht      numeric(14, 2) not null,
  wht_credit          numeric(14, 2) not null,
  net_tax_liability   numeric(14, 2) not null,
  effective_rate      numeric(7, 6) not null,
  is_exempt           boolean not null,
  engine_version      text not null default '1.0.0',
  created_at          timestamptz not null default now(),

  unique (user_id, snapshot_month)
);

comment on table public.tax_snapshots is
  'Monthly point-in-time tax estimates. Powers the YTD trend chart in Phase 2.';

create index tax_snapshots_user_id_month_idx
  on public.tax_snapshots (user_id, snapshot_month desc);

-- ── RLS: tax_snapshots ─────────────────────────────────────
alter table public.tax_snapshots enable row level security;

create policy "tax_snapshots: select own"
  on public.tax_snapshots for select
  using (auth.uid() = user_id);

create policy "tax_snapshots: insert own"
  on public.tax_snapshots for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- VIEWS
-- Convenience views used by dashboard queries.
-- RLS on the underlying tables still applies.
-- ============================================================

-- Monthly income summary per user
create or replace view public.monthly_income_summary as
select
  user_id,
  date_trunc('month', date)::date as month,
  source,
  count(*)                        as entry_count,
  sum(amount)                     as total_amount,
  sum(coalesce(wht_amount, 0))    as total_wht
from public.income_entries
group by user_id, date_trunc('month', date), source;

-- Monthly expense summary per category per user
create or replace view public.monthly_expense_summary as
select
  user_id,
  date_trunc('month', date)::date as month,
  category,
  count(*)                        as entry_count,
  sum(amount)                     as total_amount,
  sum(case when is_deductible then amount else 0 end) as deductible_amount
from public.expenses
group by user_id, date_trunc('month', date), category;

-- ============================================================
-- STORAGE BUCKET: receipts
-- Used in Phase 2 for WHT certificate and receipt uploads.
-- Create this in Supabase Dashboard → Storage, or uncomment:
-- ============================================================

-- insert into storage.buckets (id, name, public)
-- values ('receipts', 'receipts', false);

-- Storage RLS (uncomment when bucket is created):
-- create policy "receipts: user can upload own files"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'receipts' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "receipts: user can read own files"
--   on storage.objects for select
--   using (
--     bucket_id = 'receipts' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================
-- SEED: default budget categories (optional)
-- Run this separately after a user signs up to pre-populate
-- their budget with ₦0 limits they can then edit.
-- Call from your onboarding Server Action, not here.
-- ============================================================

-- Example onboarding insert (use in Server Action, not migration):
-- insert into public.budgets (user_id, category, monthly_limit)
-- values
--   (<user_id>, 'food',          50000),
--   (<user_id>, 'transport',     30000),
--   (<user_id>, 'utilities',     20000),
--   (<user_id>, 'health',        15000),
--   (<user_id>, 'entertainment', 20000),
--   (<user_id>, 'other',         30000)
-- on conflict (user_id, category) do nothing;
