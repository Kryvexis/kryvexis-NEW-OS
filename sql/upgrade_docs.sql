-- Kryvexis OS upgrade: PDF storage + doc columns
-- Run once in Supabase SQL Editor (after schema.sql).

-- Add document fields
alter table if exists public.invoices
  add column if not exists pdf_path text,
  add column if not exists pdf_generated_at timestamptz;

alter table if exists public.quotes
  add column if not exists pdf_path text,
  add column if not exists pdf_generated_at timestamptz;

-- Create a public bucket for PDFs (kx-docs)
-- If it already exists, this will do nothing.
insert into storage.buckets (id, name, public)
values ('kx-docs', 'kx-docs', true)
on conflict (id) do nothing;

-- NOTE: For production you may want this bucket private and use signed URLs.
