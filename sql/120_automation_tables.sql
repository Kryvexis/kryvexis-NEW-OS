create extension if not exists pgcrypto;

create table if not exists public.company_email_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  daily_enabled boolean not null default true,
  weekly_enabled boolean not null default true,
  overdue_enabled boolean not null default true,
  recipients_json jsonb,
  timezone text default 'Africa/Johannesburg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  recipient text,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_events_company_created on public.email_events(company_id, created_at desc);
create index if not exists idx_email_events_entity on public.email_events(entity_type, entity_id);
