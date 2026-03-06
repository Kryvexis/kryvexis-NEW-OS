-- 060_accounting_payables.sql
-- Kryvexis OS — Accounting upgrade: categories + supplier bills + optional tx columns
--
-- ✅ Safe to run multiple times.
-- Run this in Supabase SQL editor AFTER running:
--   1) sql/schema.sql (or your base schema)
--   2) sql/upgrade_full.sql (recommended)
--
-- What you get:
--   - accounting_categories: clean category list (expense + income)
--   - supplier_bills: basic payables tracking
--   - transactions: optional supplier_id + bill_id columns (if missing)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table if not exists public.accounting_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  type text not null check (type in ('expense','income')),
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_accounting_categories_company on public.accounting_categories(company_id);
create unique index if not exists ux_accounting_categories_company_type_name
  on public.accounting_categories(company_id, type, lower(name));

alter table public.accounting_categories enable row level security;

drop policy if exists "accounting categories company read" on public.accounting_categories;
drop policy if exists "accounting categories company read" on public.accounting_categories;
create policy "accounting categories company read" on public.accounting_categories
  for select using (public.is_my_company(company_id));

drop policy if exists "accounting categories company write" on public.accounting_categories;
drop policy if exists "accounting categories company write" on public.accounting_categories;
create policy "accounting categories company write" on public.accounting_categories
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

grant select, insert, update, delete on public.accounting_categories to authenticated;

-- ---------------------------------------------------------------------------
-- Supplier bills (Payables)
-- ---------------------------------------------------------------------------
create table if not exists public.supplier_bills (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  bill_number text,
  issue_date date,
  due_date date,
  category text,
  notes text,
  status text not null default 'unpaid' check (status in ('unpaid','partial','paid','void')),
  total numeric not null default 0,
  balance_due numeric not null default 0,
  paid_amount numeric,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_supplier_bills_company on public.supplier_bills(company_id);
create index if not exists idx_supplier_bills_supplier on public.supplier_bills(supplier_id);
create index if not exists idx_supplier_bills_due on public.supplier_bills(due_date);

alter table public.supplier_bills enable row level security;

drop policy if exists "supplier bills company read" on public.supplier_bills;
drop policy if exists "supplier bills company read" on public.supplier_bills;
create policy "supplier bills company read" on public.supplier_bills
  for select using (public.is_my_company(company_id));

drop policy if exists "supplier bills company write" on public.supplier_bills;
drop policy if exists "supplier bills company write" on public.supplier_bills;
create policy "supplier bills company write" on public.supplier_bills
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

grant select, insert, update, delete on public.supplier_bills to authenticated;

-- ---------------------------------------------------------------------------
-- Transactions: optional columns
-- ---------------------------------------------------------------------------
alter table if exists public.transactions
  add column if not exists supplier_id uuid references public.suppliers(id),
  add column if not exists bill_id uuid references public.supplier_bills(id);

create index if not exists idx_transactions_supplier_id on public.transactions(supplier_id);
create index if not exists idx_transactions_bill_id on public.transactions(bill_id);
