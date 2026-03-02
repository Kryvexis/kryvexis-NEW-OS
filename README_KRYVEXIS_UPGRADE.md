# Kryvexis OS — Indigo Enterprise + Daily Emails + Import Fix

This ZIP includes:
- Next.js 15 build fix for share pages (`params` typing).
- Daily Email Cron endpoint (multi-tenant): Sales + Profit + Overdue + Low stock.
- Vercel cron schedule (`vercel.json`).
- Supabase SQL fix for the `company_users` RLS recursion error.

---

## 1) Vercel environment variables (required)

Add these in **Vercel → Project Settings → Environment Variables**:

### Share links + Daily emails
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase **service_role** key (server-only)
- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL

### Daily emails (Brevo)
- `BREVO_API_KEY` = your Brevo API key
- `EMAIL_FROM` = `kryvexissolutions@gmail.com`

### Cron security
- `CRON_SECRET` = any long random string (keep secret)

Optional:
- `KX_TIMEZONE` = `Africa/Johannesburg` (default is already SA)

Then **Redeploy**.

---

## 2) Supabase: fix import recursion error

If your import station shows:
> infinite recursion detected in policy for relation "company_users"

Run this file in Supabase SQL editor:

- `sql/fix_company_users_rls.sql`

---

## 3) Daily email endpoint (manual test)

After deploy, test in browser (replace SECRET):

`https://YOUR_DOMAIN/api/cron/daily-email?secret=SECRET&dryRun=1`

- `dryRun=1` means it will **NOT** send emails (safe test).
Remove `dryRun=1` to actually send.

Vercel will also run it daily because of `vercel.json`.

---

## 4) One-line git push

```bash
git add . && git commit -m "Indigo: share fix + daily emails + import RLS fix" && git push
```

---

## 4) Accounting upgrades (Expenses, Payables, Categories, P&L)

To enable the new Accounting features (supplier bills, categories, and P&L links), run this file in Supabase SQL editor:

- `sql/060_accounting_payables.sql`

Then redeploy (or just refresh) and visit:
- `/accounting/payables`
- `/accounting/expenses`
- `/accounting/categories`
- `/accounting/pnl`
