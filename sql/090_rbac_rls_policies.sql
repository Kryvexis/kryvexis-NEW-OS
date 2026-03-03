-- RBAC/RLS hardening (non-recursive) for Kryvexis OS
-- Goal: allow the signed-in user to read their own membership, and allow
-- owner/manager to administer team + module visibility without breaking the app.

-- COMPANY_USERS
alter table if exists public.company_users enable row level security;

drop policy if exists company_users_select_self on public.company_users;
create policy company_users_select_self
on public.company_users
for select
to authenticated
using (user_id = auth.uid());

-- Owner/Manager can view all members in their company
drop policy if exists company_users_select_company_admin on public.company_users;
create policy company_users_select_company_admin
on public.company_users
for select
to authenticated
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = company_users.company_id
      and cu.user_id = auth.uid()
      and cu.role in ('owner','manager')
  )
);

-- Owner/Manager can update member roles
drop policy if exists company_users_update_company_admin on public.company_users;
create policy company_users_update_company_admin
on public.company_users
for update
to authenticated
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = company_users.company_id
      and cu.user_id = auth.uid()
      and cu.role in ('owner','manager')
  )
)
with check (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = company_users.company_id
      and cu.user_id = auth.uid()
      and cu.role in ('owner','manager')
  )
);

-- ROLE_MODULES
alter table if exists public.role_modules enable row level security;

-- Any member of the company can read role module config (used for nav visibility)
drop policy if exists role_modules_select_company_member on public.role_modules;
create policy role_modules_select_company_member
on public.role_modules
for select
to authenticated
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = role_modules.company_id
      and cu.user_id = auth.uid()
  )
);

-- Owner/Manager can manage module visibility switches
drop policy if exists role_modules_upsert_company_admin on public.role_modules;
create policy role_modules_upsert_company_admin
on public.role_modules
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = role_modules.company_id
      and cu.user_id = auth.uid()
      and cu.role in ('owner','manager')
  )
);

drop policy if exists role_modules_update_company_admin on public.role_modules;
create policy role_modules_update_company_admin
on public.role_modules
for update
to authenticated
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = role_modules.company_id
      and cu.user_id = auth.uid()
      and cu.role in ('owner','manager')
  )
)
with check (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = role_modules.company_id
      and cu.user_id = auth.uid()
      and cu.role in ('owner','manager')
  )
);
