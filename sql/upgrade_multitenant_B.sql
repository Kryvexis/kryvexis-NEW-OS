-- Kryvexis OS - Upgrade to Multi-tenant (B) + Membership (company_users)
-- Run in Supabase SQL Editor AFTER schema.sql and other upgrades.
-- This adds a company_users membership table and helpers, and can be used to tighten RLS.

-- 1) Membership table
create table if not exists public.company_users (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

-- Each user belongs to exactly 1 company for now (tenant = company)
create unique index if not exists company_users_user_uq on public.company_users(user_id);

-- 2) Helper: current_company_id()
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select cu.company_id
  from public.company_users cu
  where cu.user_id = auth.uid()
  limit 1
$$;

-- 3) Seed membership for existing companies (owner -> member)
insert into public.company_users (company_id, user_id, role)
select c.id, c.owner_user_id, 'owner'
from public.companies c
left join public.company_users cu on cu.company_id = c.id and cu.user_id = c.owner_user_id
where cu.user_id is null;

-- 4) Auto-provision tenant on new auth user
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  -- Create a company for the new user
  insert into public.companies (owner_user_id, name, email, created_at, updated_at)
  values (new.id, 'My Company', new.email, now(), now())
  returning id into cid;

  -- Membership
  insert into public.company_users (company_id, user_id, role)
  values (cid, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_kx on auth.users;

create trigger on_auth_user_created_kx
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- 5) RLS for company_users (members can read their row; owners can manage members later)
alter table public.company_users enable row level security;

drop policy if exists "company_users read own" on public.company_users;
create policy "company_users read own"
on public.company_users for select
using (user_id = auth.uid());

drop policy if exists "company_users manage own company (owner)" on public.company_users;
create policy "company_users manage own company (owner)"
on public.company_users for all
using (
  exists (
    select 1 from public.company_users cu
    where cu.company_id = company_users.company_id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.company_users cu
    where cu.company_id = company_users.company_id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  )
);

-- 6) Tighten policies (optional but recommended before production)
-- NOTE: This block drops permissive dev policies that allow any logged-in user to access all rows.
-- If you still want dev-wide access, comment out this section.

-- Drop common dev policies
do $$
declare r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and (
        policyname ilike 'dev_%'
        or policyname ilike 'Allow all for dev %'
        or policyname ilike 'dev all%'
      )
  ) loop
    execute format('drop policy if exists %I on public.%I;', r.policyname, r.tablename);
  end loop;
end $$;

-- Create/replace company-scoped policies for core tables
-- Clients
drop policy if exists "clients company read" on public.clients;
create policy "clients company read"
on public.clients for select
using (company_id = public.current_company_id());

drop policy if exists "clients company write" on public.clients;
create policy "clients company write"
on public.clients for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

-- Products
drop policy if exists "products company read" on public.products;
create policy "products company read"
on public.products for select
using (company_id = public.current_company_id());

drop policy if exists "products company write" on public.products;
create policy "products company write"
on public.products for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

-- Quotes / Quote items
drop policy if exists "quotes company read" on public.quotes;
create policy "quotes company read"
on public.quotes for select
using (company_id = public.current_company_id());

drop policy if exists "quotes company write" on public.quotes;
create policy "quotes company write"
on public.quotes for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

drop policy if exists "quote_items read" on public.quote_items;
create policy "quote_items read"
on public.quote_items for select
using (
  exists (
    select 1 from public.quotes q
    where q.id = quote_items.quote_id
      and q.company_id = public.current_company_id()
  )
);

drop policy if exists "quote_items write" on public.quote_items;
create policy "quote_items write"
on public.quote_items for all
using (
  exists (
    select 1 from public.quotes q
    where q.id = quote_items.quote_id
      and q.company_id = public.current_company_id()
  )
)
with check (
  exists (
    select 1 from public.quotes q
    where q.id = quote_items.quote_id
      and q.company_id = public.current_company_id()
  )
);

-- Invoices / Invoice items
drop policy if exists "invoices company read" on public.invoices;
create policy "invoices company read"
on public.invoices for select
using (company_id = public.current_company_id());

drop policy if exists "invoices company write" on public.invoices;
create policy "invoices company write"
on public.invoices for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

drop policy if exists "invoice_items read" on public.invoice_items;
create policy "invoice_items read"
on public.invoice_items for select
using (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id
      and i.company_id = public.current_company_id()
  )
);

drop policy if exists "invoice_items write" on public.invoice_items;
create policy "invoice_items write"
on public.invoice_items for all
using (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id
      and i.company_id = public.current_company_id()
  )
)
with check (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id
      and i.company_id = public.current_company_id()
  )
);

-- Payments
drop policy if exists "payments company read" on public.payments;
create policy "payments company read"
on public.payments for select
using (company_id = public.current_company_id());

drop policy if exists "payments company write" on public.payments;
create policy "payments company write"
on public.payments for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

-- Tax rates
drop policy if exists "tax company read" on public.tax_rates;
create policy "tax company read"
on public.tax_rates for select
using (company_id = public.current_company_id());

drop policy if exists "tax company write" on public.tax_rates;
create policy "tax company write"
on public.tax_rates for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

-- Activity logs
drop policy if exists "activity company read" on public.activity_logs;
create policy "activity company read"
on public.activity_logs for select
using (company_id = public.current_company_id());

drop policy if exists "activity company write" on public.activity_logs;
create policy "activity company write"
on public.activity_logs for all
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

-- Companies: allow owners/members to read; only owner can update
alter table public.companies enable row level security;

drop policy if exists "company members read" on public.companies;
create policy "company members read"
on public.companies for select
using (id = public.current_company_id());

drop policy if exists "company owner write" on public.companies;
create policy "company owner write"
on public.companies for update
using (
  exists (
    select 1 from public.company_users cu
    where cu.company_id = companies.id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.company_users cu
    where cu.company_id = companies.id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  )
);

-- Grants (authenticated role)
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select, update on all sequences in schema public to authenticated;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select, update on sequences to authenticated;
