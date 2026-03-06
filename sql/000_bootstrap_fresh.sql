-- Kryvexis OS - Fresh Supabase Bootstrap
-- Paste this entire file into Supabase SQL Editor and RUN.
-- If you already ran parts of the schema, you may see 'already exists' notices.

BEGIN;

-- ============================================================================
-- START: schema.sql
-- ============================================================================
-- Kryvexis OS (Supabase) schema
-- Run in Supabase SQL Editor.

-- Extensions
create extension if not exists pgcrypto;

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  name text not null default 'My Company',
  logo_url text,
  address text,
  phone text,
  email text,
  tax_id text,
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  billing_address text,
  shipping_address text,
  tags_json jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

-- Products / Services
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  sku text,
  type text not null default 'product' check (type in ('product','service')),
  unit_price numeric(12,2) not null default 0,
  stock_on_hand integer,
  low_stock_threshold integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tax rates
create table if not exists public.tax_rates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  rate numeric(6,4) not null
);

-- Quotes
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  number text not null,
  status text not null default 'Draft' check (status in ('Draft','Sent','Accepted','Rejected','Expired')),
  issue_date date not null default current_date,
  expiry_date date,
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  terms text,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  qty numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax_rate_id uuid references public.tax_rates(id) on delete set null,
  line_total numeric(12,2) not null default 0
);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  number text not null,
  status text not null default 'Draft' check (status in ('Draft','Sent','Partially Paid','Paid','Overdue','Void')),
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  notes text,
  terms text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  qty numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax_rate_id uuid references public.tax_rates(id) on delete set null,
  line_total numeric(12,2) not null default 0
);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  method text,
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

-- Activity logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_clients_company on public.clients(company_id);
create index if not exists idx_products_company on public.products(company_id);
create index if not exists idx_quotes_company on public.quotes(company_id);
create index if not exists idx_invoices_company on public.invoices(company_id);
create index if not exists idx_payments_company on public.payments(company_id);

-- RLS
alter table public.companies enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.tax_rates enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

-- Policies: owner controls their company
drop policy if exists "company owner read" on public.companies;
drop policy if exists "company owner read" on public.companies;
create policy "company owner read" on public.companies
  for select using (owner_user_id = auth.uid());
drop policy if exists "company owner write" on public.companies;
drop policy if exists "company owner write" on public.companies;
create policy "company owner write" on public.companies
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

-- Helper: is row in a company owned by current user
create or replace function public.is_my_company(cid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.companies c
    where c.id = cid and c.owner_user_id = auth.uid()
  );
$$;

-- Policies for company-scoped tables
drop policy if exists "clients company read" on public.clients;
drop policy if exists "clients company read" on public.clients;
create policy "clients company read" on public.clients
  for select using (public.is_my_company(company_id));
drop policy if exists "clients company write" on public.clients;
drop policy if exists "clients company write" on public.clients;
create policy "clients company write" on public.clients
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "products company read" on public.products;
drop policy if exists "products company read" on public.products;
create policy "products company read" on public.products
  for select using (public.is_my_company(company_id));
drop policy if exists "products company write" on public.products;
drop policy if exists "products company write" on public.products;
create policy "products company write" on public.products
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "tax company read" on public.tax_rates;
drop policy if exists "tax company read" on public.tax_rates;
create policy "tax company read" on public.tax_rates
  for select using (public.is_my_company(company_id));
drop policy if exists "tax company write" on public.tax_rates;
drop policy if exists "tax company write" on public.tax_rates;
create policy "tax company write" on public.tax_rates
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "quotes company read" on public.quotes;
drop policy if exists "quotes company read" on public.quotes;
create policy "quotes company read" on public.quotes
  for select using (public.is_my_company(company_id));
drop policy if exists "quotes company write" on public.quotes;
drop policy if exists "quotes company write" on public.quotes;
create policy "quotes company write" on public.quotes
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "quote_items read" on public.quote_items;
drop policy if exists "quote_items read" on public.quote_items;
create policy "quote_items read" on public.quote_items
  for select using (exists(select 1 from public.quotes q where q.id = quote_id and public.is_my_company(q.company_id)));
drop policy if exists "quote_items write" on public.quote_items;
drop policy if exists "quote_items write" on public.quote_items;
create policy "quote_items write" on public.quote_items
  for all using (exists(select 1 from public.quotes q where q.id = quote_id and public.is_my_company(q.company_id)))
  with check (exists(select 1 from public.quotes q where q.id = quote_id and public.is_my_company(q.company_id)));

drop policy if exists "invoices company read" on public.invoices;
drop policy if exists "invoices company read" on public.invoices;
create policy "invoices company read" on public.invoices
  for select using (public.is_my_company(company_id));
drop policy if exists "invoices company write" on public.invoices;
drop policy if exists "invoices company write" on public.invoices;
create policy "invoices company write" on public.invoices
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "invoice_items read" on public.invoice_items;
drop policy if exists "invoice_items read" on public.invoice_items;
create policy "invoice_items read" on public.invoice_items
  for select using (exists(select 1 from public.invoices i where i.id = invoice_id and public.is_my_company(i.company_id)));
drop policy if exists "invoice_items write" on public.invoice_items;
drop policy if exists "invoice_items write" on public.invoice_items;
create policy "invoice_items write" on public.invoice_items
  for all using (exists(select 1 from public.invoices i where i.id = invoice_id and public.is_my_company(i.company_id)))
  with check (exists(select 1 from public.invoices i where i.id = invoice_id and public.is_my_company(i.company_id)));

drop policy if exists "payments company read" on public.payments;
drop policy if exists "payments company read" on public.payments;
create policy "payments company read" on public.payments
  for select using (public.is_my_company(company_id));
drop policy if exists "payments company write" on public.payments;
drop policy if exists "payments company write" on public.payments;
create policy "payments company write" on public.payments
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "activity company read" on public.activity_logs;
drop policy if exists "activity company read" on public.activity_logs;
create policy "activity company read" on public.activity_logs
  for select using (public.is_my_company(company_id));
drop policy if exists "activity company write" on public.activity_logs;
drop policy if exists "activity company write" on public.activity_logs;
create policy "activity company write" on public.activity_logs
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

-- Auto-create a company for each new user (optional but recommended)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.companies (owner_user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'company_name', 'My Company'), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- END: schema.sql
-- ============================================================================

-- ============================================================================
-- START: upgrade_multitenant_B.sql
-- ============================================================================
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

-- ============================================================================
-- END: upgrade_multitenant_B.sql
-- ============================================================================

-- ============================================================================
-- START: 099_rbac_option_b_full.sql
-- ============================================================================
-- Kryvexis OS - RBAC Option B (DB-backed, multi-company safe)
-- Run order (recommended):
--  1) upgrade_multitenant_B.sql (creates companies + company_users baseline)
--  2) fix_company_users_rls.sql (if present)
--  3) 080_role_modules.sql
--  4) 090_rbac_rls_policies.sql
--  5) 095_add_settings_module.sql
--
-- This file is an "all-in-one" safe script for fresh environments.

-- 1) company_users (membership)
create table if not exists public.company_users (
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

-- 2) role_modules (module visibility per role)
create table if not exists public.role_modules (
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null,
  module text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, role, module)
);

-- 3) Helper: membership test (non-recursive)
create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_users cu
    where cu.company_id = p_company_id
      and cu.user_id = auth.uid()
  )
$$;

create or replace function public.is_company_admin(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_users cu
    where cu.company_id = p_company_id
      and cu.user_id = auth.uid()
      and cu.role in ('owner','manager')
  )
$$;

-- 4) RLS: company_users
alter table public.company_users enable row level security;

drop policy if exists company_users_select_self on public.company_users;
create policy company_users_select_self
on public.company_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists company_users_select_company_admin on public.company_users;
create policy company_users_select_company_admin
on public.company_users
for select
to authenticated
using (public.is_company_admin(company_id));

drop policy if exists company_users_update_company_admin on public.company_users;
create policy company_users_update_company_admin
on public.company_users
for update
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

-- Optional: allow insert for invite flows (server validates)
drop policy if exists company_users_insert_admin on public.company_users;
create policy company_users_insert_admin
on public.company_users
for insert
to authenticated
with check (public.is_company_admin(company_id));

-- 5) RLS: role_modules
alter table public.role_modules enable row level security;

drop policy if exists role_modules_select_company_member on public.role_modules;
create policy role_modules_select_company_member
on public.role_modules
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists role_modules_upsert_company_admin on public.role_modules;
create policy role_modules_upsert_company_admin
on public.role_modules
for insert
to authenticated
with check (public.is_company_admin(company_id));

drop policy if exists role_modules_update_company_admin on public.role_modules;
create policy role_modules_update_company_admin
on public.role_modules
for update
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

-- 6) Seed defaults (idempotent)
-- Modules: sales, procurement, accounting, operations, insights, settings
insert into public.role_modules (company_id, role, module, enabled)
select c.id, r.role, m.module, m.enabled
from public.companies c
cross join (
  values ('owner'),('manager'),('cashier'),('buyer'),('accounts'),('staff')
) as r(role)
cross join (
  values
    ('sales', true),
    ('procurement', true),
    ('accounting', true),
    ('operations', true),
    ('insights', true),
    ('settings', true)
) as m(module, enabled)
where not exists (
  select 1 from public.role_modules rm
  where rm.company_id = c.id and rm.role = r.role and rm.module = m.module
);

-- Owner/Manager: all modules
update public.role_modules
set enabled = true
where role in ('owner','manager');

-- Cashier/Staff: sales only
update public.role_modules
set enabled = (module = 'sales')
where role in ('cashier','staff');

-- Buyer: procurement + operations (+ settings optional; keep enabled)
update public.role_modules
set enabled = (module in ('procurement','operations','settings'))
where role = 'buyer';

-- Accounts: accounting (+ sales for payments + settings)
update public.role_modules
set enabled = (module in ('accounting','sales','settings'))
where role = 'accounts';

-- ============================================================================
-- END: 099_rbac_option_b_full.sql
-- ============================================================================

-- ============================================================================
-- START: 050_rls_policies_imports.sql
-- ============================================================================
-- Basic RLS policies for core tables (clients/products/suppliers)
-- This fixes Import Center "row violates row-level security policy" when company_id is set correctly.

-- Helper: user is a member of company
-- (If you already have these policies, this file is safe to re-run.)

alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.suppliers enable row level security;

drop policy if exists "clients_select" on public.clients;
drop policy if exists "clients_write" on public.clients;

create policy "clients_select"
on public.clients
for select
to authenticated
using (exists (
  select 1 from public.company_users cu
  where cu.company_id = clients.company_id and cu.user_id = auth.uid()
));

create policy "clients_write"
on public.clients
for all
to authenticated
using (exists (
  select 1 from public.company_users cu
  where cu.company_id = clients.company_id and cu.user_id = auth.uid()
))
with check (exists (
  select 1 from public.company_users cu
  where cu.company_id = clients.company_id and cu.user_id = auth.uid()
));

drop policy if exists "products_select" on public.products;
drop policy if exists "products_write" on public.products;

create policy "products_select"
on public.products
for select
to authenticated
using (exists (
  select 1 from public.company_users cu
  where cu.company_id = products.company_id and cu.user_id = auth.uid()
));

create policy "products_write"
on public.products
for all
to authenticated
using (exists (
  select 1 from public.company_users cu
  where cu.company_id = products.company_id and cu.user_id = auth.uid()
))
with check (exists (
  select 1 from public.company_users cu
  where cu.company_id = products.company_id and cu.user_id = auth.uid()
));

drop policy if exists "suppliers_select" on public.suppliers;
drop policy if exists "suppliers_write" on public.suppliers;

create policy "suppliers_select"
on public.suppliers
for select
to authenticated
using (exists (
  select 1 from public.company_users cu
  where cu.company_id = suppliers.company_id and cu.user_id = auth.uid()
));

create policy "suppliers_write"
on public.suppliers
for all
to authenticated
using (exists (
  select 1 from public.company_users cu
  where cu.company_id = suppliers.company_id and cu.user_id = auth.uid()
))
with check (exists (
  select 1 from public.company_users cu
  where cu.company_id = suppliers.company_id and cu.user_id = auth.uid()
));

-- ============================================================================
-- END: 050_rls_policies_imports.sql
-- ============================================================================

-- ============================================================================
-- START: fix_company_users_rls.sql
-- ============================================================================
-- Fix: company_users RLS recursion
-- Run in Supabase SQL Editor.
-- This replaces broken/duplicated policies with a clean set that does NOT recurse.

create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_users cu
    where cu.company_id = p_company_id
      and cu.user_id = auth.uid()
  );
$$;

create or replace function public.is_company_owner(p_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_users cu
    where cu.company_id = p_company_id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  );
$$;

alter table public.company_users enable row level security;

-- Drop common policy names (safe if they don't exist)
drop policy if exists "Allow user to insert own company link" on public.company_users;
drop policy if exists "Allow user to see own company link" on public.company_users;
drop policy if exists "company_users manage own company (owner)" on public.company_users;
drop policy if exists "company_users read own" on public.company_users;
drop policy if exists "company_users_delete_owner" on public.company_users;
drop policy if exists "company_users_insert_owner" on public.company_users;
drop policy if exists "company_users_select_member" on public.company_users;

drop policy if exists "company_users_select_member" on public.company_users;
drop policy if exists "company_users_insert_self" on public.company_users;
drop policy if exists "company_users_manage_owner" on public.company_users;

-- Clean policies
create policy "company_users_select_member"
on public.company_users
for select
to authenticated
using (public.is_company_member(company_id));

create policy "company_users_insert_self"
on public.company_users
for insert
to authenticated
with check (user_id = auth.uid());

create policy "company_users_manage_owner"
on public.company_users
for all
to authenticated
using (public.is_company_owner(company_id))
with check (public.is_company_owner(company_id));

-- ============================================================================
-- END: fix_company_users_rls.sql
-- ============================================================================

-- ============================================================================
-- START: 095_add_settings_module.sql
-- ============================================================================
-- Kryvexis OS - Add Settings module to RBAC (Option B)
-- Safe to run multiple times.

-- Ensure role_modules exists (created in 080_role_modules.sql)

-- 1) Seed 'settings' module for all roles for all companies (idempotent)
insert into public.role_modules (company_id, role, module, enabled)
select c.id, r.role, 'settings' as module,
       case
         when r.role in ('owner','manager') then true
         when r.role in ('accounts','buyer') then true
         when r.role in ('cashier','staff') then false
         else false
       end as enabled
from public.companies c
cross join (values ('owner'),('manager'),('cashier'),('buyer'),('accounts'),('staff')) as r(role)
where not exists (
  select 1 from public.role_modules rm
  where rm.company_id = c.id and rm.role = r.role and rm.module = 'settings'
);

-- 2) Apply sensible defaults per role
update public.role_modules
set enabled = true
where role in ('owner','manager') and module = 'settings';

-- Cashier/staff: settings hidden by default (POS-first flow)
update public.role_modules
set enabled = false
where role in ('cashier','staff') and module = 'settings';

-- ============================================================================
-- END: 095_add_settings_module.sql
-- ============================================================================

-- ============================================================================
-- START: 040_add_barcode_to_products.sql
-- ============================================================================
-- Add barcode support for quick scanning
alter table public.products add column if not exists barcode text;
create index if not exists products_company_barcode_idx on public.products(company_id, barcode);

-- ============================================================================
-- END: 040_add_barcode_to_products.sql
-- ============================================================================

-- ============================================================================
-- START: 060_accounting_payables.sql
-- ============================================================================
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
drop policy if exists "accounting categories company read" on public.accounting_categories;
create policy "accounting categories company read" on public.accounting_categories
  for select using (public.is_my_company(company_id));

drop policy if exists "accounting categories company write" on public.accounting_categories;
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
drop policy if exists "supplier bills company read" on public.supplier_bills;
create policy "supplier bills company read" on public.supplier_bills
  for select using (public.is_my_company(company_id));

drop policy if exists "supplier bills company write" on public.supplier_bills;
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

-- ============================================================================
-- END: 060_accounting_payables.sql
-- ============================================================================

-- ============================================================================
-- START: 070_buyers_purchase_orders.sql
-- ============================================================================
-- 070_buyers_purchase_orders.sql
-- Kryvexis OS — Buyers "brains": suppliers + purchase orders + product supplier prefs
-- Safe to run multiple times.
create extension if not exists pgcrypto;

-- Suppliers
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  lead_time_days integer not null default 4,
  created_at timestamptz not null default now()
);

-- Add preferred supplier + ordering metadata to products
alter table public.products add column if not exists preferred_supplier_id uuid references public.suppliers(id);
alter table public.products add column if not exists target_stock integer;
alter table public.products add column if not exists pack_size integer;
alter table public.products add column if not exists min_order_qty integer;

-- Purchase orders
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  supplier_id uuid references public.suppliers(id),
  status text not null default 'draft' check (status in ('draft','sent','received','cancelled')),
  subject text,
  to_email text,
  message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  description text not null,
  qty integer not null default 1,
  unit_price numeric(12,2),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;

-- Policies (reuse helper function is_my_company)
drop policy if exists "suppliers company write" on public.suppliers;
create policy "suppliers company write" on public.suppliers
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "purchase_orders company write" on public.purchase_orders;
create policy "purchase_orders company write" on public.purchase_orders
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

drop policy if exists "purchase_order_items company write" on public.purchase_order_items;
create policy "purchase_order_items company write" on public.purchase_order_items
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

-- ============================================================================
-- END: 070_buyers_purchase_orders.sql
-- ============================================================================

-- ============================================================================
-- START: 080_role_modules.sql
-- ============================================================================
-- Kryvexis OS - Role Modules (Manager controls what each role sees)
-- Run in Supabase SQL Editor AFTER upgrade_multitenant_B.sql and fix_company_users_rls.sql

-- 1) Role module visibility table
create table if not exists public.role_modules (
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null,
  module text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, role, module)
);

-- 2) Helpers
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(cu.role, 'staff')
  from public.company_users cu
  where cu.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_company_admin(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_users cu
    where cu.company_id = p_company_id
      and cu.user_id = auth.uid()
      and cu.role in ('owner','manager')
  )
$$;

-- 3) RLS
alter table public.role_modules enable row level security;

drop policy if exists "role_modules_select_member" on public.role_modules;
create policy "role_modules_select_member"
on public.role_modules
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists "role_modules_manage_admin" on public.role_modules;
create policy "role_modules_manage_admin"
on public.role_modules
for all
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

-- 4) Seed defaults (idempotent)
-- Modules: sales, procurement, accounting, operations, insights
insert into public.role_modules (company_id, role, module, enabled)
select c.id, r.role, m.module, m.enabled
from public.companies c
cross join (
  values ('owner'),('manager'),('cashier'),('buyer'),('accounts'),('staff')
) as r(role)
cross join (
  values
    ('sales', true),
    ('procurement', true),
    ('accounting', true),
    ('operations', true),
    ('insights', true)
) as m(module, enabled)
where not exists (
  select 1
  from public.role_modules rm
  where rm.company_id = c.id and rm.role = r.role and rm.module = m.module
);

-- 5) Apply sensible defaults per role
update public.role_modules set enabled = (module in ('sales','accounting','operations','insights','procurement'))
where role in ('owner','manager');

update public.role_modules set enabled = (module in ('sales'))
where role in ('cashier','staff');

update public.role_modules set enabled = (module in ('procurement','operations'))
where role = 'buyer';

update public.role_modules set enabled = (module in ('accounting'))
where role = 'accounts';


-- ============================================================================
-- END: 080_role_modules.sql
-- ============================================================================

-- ============================================================================
-- START: upgrade_public_share_tokens.sql
-- ============================================================================
-- Adds public share tokens for quotes & invoices (UUID) + unique indexes
-- Run in Supabase SQL editor.

alter table public.quotes
  add column if not exists public_token uuid default gen_random_uuid();

alter table public.invoices
  add column if not exists public_token uuid default gen_random_uuid();

create unique index if not exists quotes_public_token_uidx on public.quotes(public_token);
create unique index if not exists invoices_public_token_uidx on public.invoices(public_token);

-- ============================================================================
-- END: upgrade_public_share_tokens.sql
-- ============================================================================

-- ============================================================================
-- START: upgrade_team_invites.sql
-- ============================================================================
-- Team invites + roles (company_users) support
-- Run in Supabase SQL editor.

create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role text not null default 'staff',
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  invited_by uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_company_invites_company on public.company_invites(company_id);
create index if not exists idx_company_invites_email on public.company_invites(email);

alter table public.company_invites enable row level security;

drop policy if exists "company_invites read company" on public.company_invites;
create policy "company_invites read company"
on public.company_invites for select
using (company_id = public.current_company_id());

drop policy if exists "company_invites manage owner" on public.company_invites;
create policy "company_invites manage owner"
on public.company_invites for all
using (
  exists (
    select 1 from public.company_users cu
    where cu.company_id = company_invites.company_id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.company_users cu
    where cu.company_id = company_invites.company_id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  )
);

-- ============================================================================
-- END: upgrade_team_invites.sql
-- ============================================================================

-- ============================================================================
-- START: upgrade_signup_phone.sql
-- ============================================================================
-- Upgrade: store signup phone (auth user metadata) into companies.phone
-- Run this in Supabase SQL editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.companies (owner_user_id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', 'My Company'),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- END: upgrade_signup_phone.sql
-- ============================================================================

-- ============================================================================
-- START: upgrade_margin.sql
-- ============================================================================
-- Kryvexis OS upgrade: Product cost + supplier mapping
-- Run once.

alter table if exists public.products
  add column if not exists cost_price numeric(12,2) not null default 0,
  add column if not exists supplier_id uuid references public.suppliers(id);

create index if not exists idx_products_supplier on public.products(supplier_id);

-- ============================================================================
-- END: upgrade_margin.sql
-- ============================================================================

-- ============================================================================
-- START: upgrade_docs.sql
-- ============================================================================
-- Kryvexis OS upgrade: PDF storage + doc columns
-- Run once in Supabase SQL Editor (after schema.sql).

-- Add document fields
alter table if exists public.invoices
  add column if not exists pdf_path text,
  add column if not exists pdf_generated_at timestamptz;

alter table if exists public.quotes
  add column if not exists pdf_path text,
  add column if not exists pdf_generated_at timestamptz;

-- Create a public bucket for PDFs (kx-docs)
-- If it already exists, this will do nothing.
insert into storage.buckets (id, name, public)
values ('kx-docs', 'kx-docs', true)
on conflict (id) do nothing;

-- NOTE: For production you may want this bucket private and use signed URLs.

-- ============================================================================
-- END: upgrade_docs.sql
-- ============================================================================

-- ============================================================================
-- START: upgrade_email_prod.sql
-- ============================================================================
-- Email production hardening: idempotency + delivery logs + (optional) indexes
-- Run this in Supabase SQL editor (or via your migration flow).

create table if not exists email_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  mode text not null check (mode in ('daily','weekly')),
  run_date date not null,
  created_at timestamptz not null default now(),
  unique(company_id, mode, run_date)
);

create table if not exists email_sends (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  recipient text,
  mode text,
  run_date date,
  status text, -- sent / failed
  error text,
  created_at timestamptz not null default now()
);

-- Helpful indexes for analytics queries
create index if not exists idx_email_sends_company_date on email_sends(company_id, run_date);
create index if not exists idx_email_runs_company_date on email_runs(company_id, run_date);

-- ============================================================================
-- END: upgrade_email_prod.sql
-- ============================================================================

COMMIT;
