-- Kryvexis OS - Membership RLS Fix
--
-- Purpose:
-- Ensure a signed-in user can always read their own company membership and the
-- companies they belong to. This prevents the "Staff + workspace = —" state.

begin;

-- company_users: self-read membership
alter table if exists public.company_users enable row level security;
drop policy if exists "company_users self read" on public.company_users;
create policy "company_users self read"
on public.company_users
for select
to authenticated
using (user_id = auth.uid());

-- company_users: admins manage members
drop policy if exists "company_users admin manage" on public.company_users;
create policy "company_users admin manage"
on public.company_users
for all
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

-- companies: members can read their company
alter table if exists public.companies enable row level security;
drop policy if exists "companies member read" on public.companies;
create policy "companies member read"
on public.companies
for select
to authenticated
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = companies.id
      and cu.user_id = auth.uid()
  )
);

commit;
