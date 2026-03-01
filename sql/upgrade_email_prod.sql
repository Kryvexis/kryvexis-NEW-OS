-- Email production hardening: idempotency + delivery logs + (optional) indexes
-- Run this in Supabase SQL editor (or via your migration flow).

create table if not exists email_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  mode text not null check (mode in ('daily','weekly')),
  run_date date not null,
  created_at timestamptz not null default now(),
  unique(company_id, mode, run_date)
);

create table if not exists email_sends (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  recipient text,
  mode text,
  run_date date,
  status text, -- sent / failed
  error text,
  created_at timestamptz not null default now()
);

-- Helpful indexes for analytics queries
create index if not exists idx_email_sends_company_date on email_sends(company_id, run_date);
create index if not exists idx_email_runs_company_date on email_runs(company_id, run_date);
