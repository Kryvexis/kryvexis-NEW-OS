-- Adds public share tokens for quotes & invoices (UUID) + unique indexes
-- Run in Supabase SQL editor.

alter table public.quotes
  add column if not exists public_token uuid default gen_random_uuid();

alter table public.invoices
  add column if not exists public_token uuid default gen_random_uuid();

create unique index if not exists quotes_public_token_uidx on public.quotes(public_token);
create unique index if not exists invoices_public_token_uidx on public.invoices(public_token);
