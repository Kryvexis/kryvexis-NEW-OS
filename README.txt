Kryvexis active-company cookie hotfix

Replace:
app/(app)/account-center/workspace-bootstrap.tsx

Why:
The current Create / Link Workspace flow calls supabase.rpc("bootstrap_workspace") and then
POST /api/company/active as two separate steps. In production, the active-company cookie is not
sticking consistently, so middleware falls back to role = staff and redirects /buyers to /sales/pos.

This patch changes the button to call POST /api/company/bootstrap instead, so workspace creation
and active-company cookie persistence happen in a single server-side flow.

After replacing the file:
1. commit
2. push
3. redeploy
4. sign out / sign back in or create/link workspace again
5. verify browser cookies now include kx_active_company_id
