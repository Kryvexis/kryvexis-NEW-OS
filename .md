# Kryvexis OS (Fresh Start) — Push to GitHub

## 1) Replace your local folder
- Best: extract this ZIP into a **new folder** (avoid leftovers)

## 2) Install + run
```bash
npm install
npm run dev
```

## 3) Supabase (fresh project)
In Supabase SQL Editor, run **one file**:
- `sql/000_bootstrap_fresh.sql`

Then log into the app and go to **Account Center**:
- Create/select a company (this sets membership + active company)

## 4) Vercel env vars
Set these in Vercel Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (if used) `SUPABASE_SERVICE_ROLE_KEY`

## 5) Git commands (fresh repo)
```bash
git init
git add .
git commit -m "Fresh foundation bootstrap: multitenant + RBAC + safe redirects"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 6) Git commands (existing repo)
```bash
git add .
git commit -m "Fresh foundation bootstrap: multitenant + RBAC + safe redirects"
git push
```
