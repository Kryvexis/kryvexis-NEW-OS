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
