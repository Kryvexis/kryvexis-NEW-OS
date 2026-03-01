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
