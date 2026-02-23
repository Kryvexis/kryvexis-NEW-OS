-- Kryvexis OS upgrade: Product cost + supplier mapping
-- Run once.

alter table if exists public.products
  add column if not exists cost_price numeric(12,2) not null default 0,
  add column if not exists supplier_id uuid references public.suppliers(id);

create index if not exists idx_products_supplier on public.products(supplier_id);
