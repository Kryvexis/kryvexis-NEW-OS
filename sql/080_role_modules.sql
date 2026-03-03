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

