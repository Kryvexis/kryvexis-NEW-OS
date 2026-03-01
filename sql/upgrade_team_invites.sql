-- Team invites + roles (company_users) support
-- Run in Supabase SQL editor.

create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role text not null default 'staff',
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  invited_by uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_company_invites_company on public.company_invites(company_id);
create index if not exists idx_company_invites_email on public.company_invites(email);

alter table public.company_invites enable row level security;

drop policy if exists "company_invites read company" on public.company_invites;
create policy "company_invites read company"
on public.company_invites for select
using (company_id = public.current_company_id());

drop policy if exists "company_invites manage owner" on public.company_invites;
create policy "company_invites manage owner"
on public.company_invites for all
using (
  exists (
    select 1 from public.company_users cu
    where cu.company_id = company_invites.company_id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.company_users cu
    where cu.company_id = company_invites.company_id
      and cu.user_id = auth.uid()
      and cu.role = 'owner'
  )
);
