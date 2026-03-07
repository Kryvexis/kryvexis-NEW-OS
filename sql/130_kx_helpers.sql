-- Optional helper RPC used by the app for schema-safe feature detection.
create or replace function public.kx_list_columns(p_table text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'columns', coalesce(jsonb_agg(column_name order by ordinal_position), '[]'::jsonb)
  )
  from information_schema.columns
  where table_schema = 'public'
    and table_name = p_table;
$$;

grant execute on function public.kx_list_columns(text) to anon, authenticated, service_role;
