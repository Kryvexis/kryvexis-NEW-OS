-- 1) Tables
create table if not exists public.company_users (
  user_id uuid not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null check (role in ('owner','manager','cashier','staff','buyer','accounts')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.role_modules (
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null check (role in ('owner','manager','cashier','staff','buyer','accounts')),
  module text not null check (module in ('sales','procurement','accounting','operations','insights','settings')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint role_modules_unique unique (company_id, role, module)
);

alter table public.company_users enable row level security;
alter table public.role_modules enable row level security;

drop policy if exists company_users_select_self on public.company_users;
create policy company_users_select_self on public.company_users for select to authenticated using (user_id = auth.uid());

drop policy if exists company_users_select_same_company on public.company_users;
create policy company_users_select_same_company on public.company_users for select to authenticated using (
  exists (select 1 from public.company_users me where me.company_id = company_users.company_id and me.user_id = auth.uid())
);

drop policy if exists company_users_update_admin on public.company_users;
create policy company_users_update_admin on public.company_users for update to authenticated using (
  exists (select 1 from public.company_users me where me.company_id = company_users.company_id and me.user_id = auth.uid() and me.role in ('owner','manager'))
) with check (
  exists (select 1 from public.company_users me where me.company_id = company_users.company_id and me.user_id = auth.uid() and me.role in ('owner','manager'))
);

drop policy if exists company_users_insert_admin on public.company_users;
create policy company_users_insert_admin on public.company_users for insert to authenticated with check (
  user_id = auth.uid() or exists (select 1 from public.company_users me where me.company_id = company_users.company_id and me.user_id = auth.uid() and me.role in ('owner','manager'))
);

drop policy if exists role_modules_select_company on public.role_modules;
create policy role_modules_select_company on public.role_modules for select to authenticated using (
  exists (select 1 from public.company_users me where me.company_id = role_modules.company_id and me.user_id = auth.uid())
);

drop policy if exists role_modules_insert_admin on public.role_modules;
create policy role_modules_insert_admin on public.role_modules for insert to authenticated with check (
  exists (select 1 from public.company_users me where me.company_id = role_modules.company_id and me.user_id = auth.uid() and me.role in ('owner','manager'))
);

drop policy if exists role_modules_update_admin on public.role_modules;
create policy role_modules_update_admin on public.role_modules for update to authenticated using (
  exists (select 1 from public.company_users me where me.company_id = role_modules.company_id and me.user_id = auth.uid() and me.role in ('owner','manager'))
) with check (
  exists (select 1 from public.company_users me where me.company_id = role_modules.company_id and me.user_id = auth.uid() and me.role in ('owner','manager'))
);

insert into public.role_modules (company_id, role, module, enabled)
select c.id, roles.role, mods.module,
  case
    when roles.role in ('owner','manager') then true
    when roles.role in ('cashier','staff') then mods.module in ('sales','settings')
    when roles.role = 'buyer' then mods.module in ('procurement','operations','settings')
    when roles.role = 'accounts' then mods.module in ('accounting','settings')
    else false
  end as enabled
from public.companies c
cross join (values ('owner'),('manager'),('cashier'),('staff'),('buyer'),('accounts')) as roles(role)
cross join (values ('sales'),('procurement'),('accounting'),('operations'),('insights'),('settings')) as mods(module)
on conflict (company_id, role, module)
do update set enabled = excluded.enabled, updated_at = now();
