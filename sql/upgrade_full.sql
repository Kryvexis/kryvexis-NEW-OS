-- Kryvexis OS upgrade: Suppliers + Transactions (Accounts)
-- Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_suppliers_company on public.suppliers(company_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  kind text not null check (kind in ('income','expense')),
  amount numeric(12,2) not null,
  category text,
  memo text,
  tx_date date,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_company on public.transactions(company_id);
create index if not exists idx_transactions_date on public.transactions(tx_date);

alter table public.suppliers enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "suppliers company read" on public.suppliers;
drop policy if exists "suppliers company write" on public.suppliers;
create policy "suppliers company read" on public.suppliers
  for select using (public.is_my_company(company_id));
create policy "suppliers company write" on public.suppliers
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "transactions company read" on public.transactions;
drop policy if exists "transactions company write" on public.transactions;
create policy "transactions company read" on public.transactions
  for select using (public.is_my_company(company_id));
create policy "transactions company write" on public.transactions
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select, update on all sequences in schema public to authenticated;
