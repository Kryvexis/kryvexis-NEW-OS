-- Add barcode support for quick scanning
alter table public.products add column if not exists barcode text;
create index if not exists products_company_barcode_idx on public.products(company_id, barcode);
