-- 110_bootstrap_workspace_rpc.sql
-- Create a first workspace for the currently authenticated user.
-- Uses SECURITY DEFINER so it can create rows even when RLS blocks direct inserts.

create or replace function public.bootstrap_workspace(company_name text default 'Kryvexis Workspace')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_company uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- If the user already has membership, reuse their oldest workspace
  select cu.company_id into v_company
  from public.company_users cu
  where cu.user_id = v_uid
  order by cu.created_at asc
  limit 1;

  if v_company is not null then
    return v_company;
  end if;

  -- Create company + link as owner
  insert into public.companies(name)
  values (coalesce(nullif(company_name, ''), 'Kryvexis Workspace'))
  returning id into v_company;

  insert into public.company_users(company_id, user_id, role)
  values (v_company, v_uid, 'owner');

  return v_company;
end;
$$;

-- Allow authenticated users to call it
grant execute on function public.bootstrap_workspace(text) to authenticated;
