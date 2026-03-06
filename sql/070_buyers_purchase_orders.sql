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
