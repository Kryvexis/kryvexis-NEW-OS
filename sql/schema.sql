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
create policy "company owner read" on public.companies
  for select using (owner_user_id = auth.uid());
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
create policy "clients company read" on public.clients
  for select using (public.is_my_company(company_id));
create policy "clients company write" on public.clients
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

create policy "products company read" on public.products
  for select using (public.is_my_company(company_id));
create policy "products company write" on public.products
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

create policy "tax company read" on public.tax_rates
  for select using (public.is_my_company(company_id));
create policy "tax company write" on public.tax_rates
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

create policy "quotes company read" on public.quotes
  for select using (public.is_my_company(company_id));
create policy "quotes company write" on public.quotes
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

create policy "quote_items read" on public.quote_items
  for select using (exists(select 1 from public.quotes q where q.id = quote_id and public.is_my_company(q.company_id)));
create policy "quote_items write" on public.quote_items
  for all using (exists(select 1 from public.quotes q where q.id = quote_id and public.is_my_company(q.company_id)))
  with check (exists(select 1 from public.quotes q where q.id = quote_id and public.is_my_company(q.company_id)));

create policy "invoices company read" on public.invoices
  for select using (public.is_my_company(company_id));
create policy "invoices company write" on public.invoices
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

create policy "invoice_items read" on public.invoice_items
  for select using (exists(select 1 from public.invoices i where i.id = invoice_id and public.is_my_company(i.company_id)));
create policy "invoice_items write" on public.invoice_items
  for all using (exists(select 1 from public.invoices i where i.id = invoice_id and public.is_my_company(i.company_id)))
  with check (exists(select 1 from public.invoices i where i.id = invoice_id and public.is_my_company(i.company_id)));

create policy "payments company read" on public.payments
  for select using (public.is_my_company(company_id));
create policy "payments company write" on public.payments
  for all using (public.is_my_company(company_id)) with check (public.is_my_company(company_id));

create policy "activity company read" on public.activity_logs
  for select using (public.is_my_company(company_id));
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
