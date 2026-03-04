-- Kryvexis OS - Add Settings module to RBAC (Option B)
-- Safe to run multiple times.

-- Ensure role_modules exists (created in 080_role_modules.sql)

-- 1) Seed 'settings' module for all roles for all companies (idempotent)
insert into public.role_modules (company_id, role, module, enabled)
select c.id, r.role, 'settings' as module,
       case
         when r.role in ('owner','manager') then true
         when r.role in ('accounts','buyer') then true
         when r.role in ('cashier','staff') then false
         else false
       end as enabled
from public.companies c
cross join (values ('owner'),('manager'),('cashier'),('buyer'),('accounts'),('staff')) as r(role)
where not exists (
  select 1 from public.role_modules rm
  where rm.company_id = c.id and rm.role = r.role and rm.module = 'settings'
);

-- 2) Apply sensible defaults per role
update public.role_modules
set enabled = true
where role in ('owner','manager') and module = 'settings';

-- Cashier/staff: settings hidden by default (POS-first flow)
update public.role_modules
set enabled = false
where role in ('cashier','staff') and module = 'settings';
