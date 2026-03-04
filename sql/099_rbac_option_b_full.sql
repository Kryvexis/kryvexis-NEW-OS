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
