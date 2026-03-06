KRYVEXIS UI UPLIFT PATCH (best-effort bundle)

What is included
- middleware.ts
  Adds active-company fallback role resolution. If the active company cookie is missing,
  middleware now resolves the first membership from company_users and writes the company cookies.
  This prevents owner/manager users from being treated as staff and getting redirected from /buyers to /sales/pos.

- app/(app)/buyers/page.tsx
  Replaces the current compact buyers list with a stronger procurement cockpit:
  * hero summary band
  * search field
  * tab filters (all / out / low / watch)
  * action panel
  * richer row states and badges
  * better information density

- components/nav/MobileNav.tsx
  Replaces the flat mobile nav with grouped modules so the OS feels more like a full product,
  not a thin admin menu.

Why these files
The repo already exposes Buyers, Products, Suppliers, Operations, Reports, Import Center, and Account Center in navigation and role gating, but the live UI is still surfacing a thinner shell and middleware only trusts active-company cookies for role lookup. The current buyers page also exists but is still relatively light-weight compared with the rest of the system.

What this does NOT include
- a full desktop sidebar rewrite (I do not have the exact current desktop sidebar component path from the repo snapshot available here)
- POS server wiring for draft/discount/print/return/scan flows
- database migrations

Recommended order to apply
1. Replace middleware.ts
2. Replace app/(app)/buyers/page.tsx
3. Replace components/nav/MobileNav.tsx
4. Redeploy
5. Test /buyers, account-center, and mobile menu

Manual test list
- Sign in as owner
- Open /buyers directly
- Confirm no redirect to /sales/pos
- Confirm buyers hero, cards, filters, and actions render
- Open mobile menu and verify grouped sections and visibility by role

Notes
This is a best-effort patch bundle created from the repo paths and code patterns visible in the connected GitHub search results. If your local repo has a different desktop sidebar component, merge the same visual grouping approach there as well.
