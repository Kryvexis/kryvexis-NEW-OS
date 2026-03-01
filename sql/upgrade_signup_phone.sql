-- Upgrade: store signup phone (auth user metadata) into companies.phone
-- Run this in Supabase SQL editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.companies (owner_user_id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', 'My Company'),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
