import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";
import { PosHeroShell } from "@/components/pos/hero-shell";

export const dynamic = "force-dynamic";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function PnLPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 30);

  const startYTD = new Date(now.getFullYear(), 0, 1);

  const [
    { data: invoices30, error: invErr30 },
    { data: invoicesYtd, error: invErrYtd },
    { data: exp30, error: expErr30 },
    { data: expYtd, error: expErrYtd },
    { data: billsOpen, error: billErr },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("id,total,issue_date,status")
      .eq("company_id", companyId)
      .gte("issue_date", iso(start30))
      .limit(5000),
    supabase
      .from("invoices")
      .select("id,total,issue_date,status")
      .eq("company_id", companyId)
      .gte("issue_date", iso(startYTD))
      .limit(5000),
    supabase
      .from("transactions")
      .select("id,amount,category,tx_date")
      .eq("company_id", companyId)
      .eq("kind", "expense")
      .gte("tx_date", iso(start30))
      .limit(8000),
    supabase
      .from("transactions")
      .select("id,amount,category,tx_date")
      .eq("company_id", companyId)
      .eq("kind", "expense")
      .gte("tx_date", iso(startYTD))
      .limit(20000),
    supabase
      .from("supplier_bills")
      .select("id,balance_due,total,status")
      .eq("company_id", companyId)
      .limit(8000),
  ]);

  const revenue30 = (invoices30 || []).reduce((a: number, i: any) => a + Number(i.total || 0), 0);
  const revenueYtd = (invoicesYtd || []).reduce((a: number, i: any) => a + Number(i.total || 0), 0);

  const expenses30 = (exp30 || []).reduce((a: number, t: any) => a + Number(t.amount || 0), 0);
  const expensesYtd = (expYtd || []).reduce((a: number, t: any) => a + Number(t.amount || 0), 0);

  const profit30 = revenue30 - expenses30;
  const profitYtd = revenueYtd - expensesYtd;

  const openBillsTotal = (billsOpen || [])
    .filter((b: any) => !["paid", "void"].includes(String(b.status || "unpaid")))
    .reduce((a: number, b: any) => a + Number(b.balance_due ?? b.total ?? 0), 0);

  const byCat30 = new Map<string, number>();
  for (const t of exp30 || []) {
    const k = String((t as any).category || "Uncategorised");
    byCat30.set(k, (byCat30.get(k) || 0) + Number((t as any).amount || 0));
  }
  const topCats30 = [...byCat30.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const dbErrors = [invErr30, invErrYtd, expErr30, expErrYtd, billErr].filter(Boolean).map((e: any) => e.message);

  return (
    <PosHeroShell title="P&L" subtitle="Simple profit & loss. Designed for speed and clarity — not accounting complexity.">
      {dbErrors.length ? (
        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Database upgrade required</div>
          <div className="mt-2 text-sm kx-muted">
            P&amp;L needs invoices + expenses tables. Run <span className="font-mono">sql/upgrade_full.sql</span> and <span className="font-mono">sql/060_accounting_payables.sql</span>.
          </div>
          <div className="mt-3 space-y-1 text-xs text-white/50">
            {dbErrors.slice(0, 3).map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Revenue (last 30 days)</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(revenue30)}</div>
          <div className="mt-1 text-xs text-white/55">Based on invoices issued.</div>
        </div>

        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Expenses (last 30 days)</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(expenses30)}</div>
          <div className="mt-1 text-xs text-white/55">Based on expenses captured (cash out).</div>
        </div>

        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Profit (last 30 days)</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(profit30)}</div>
          <div className="mt-1 text-xs text-white/55">Revenue minus expenses.</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Revenue (YTD)</div>
          <div className="mt-2 text-2xl font-semibold">{fmtZar(revenueYtd)}</div>
          <div className="mt-1 text-xs text-white/55">From {iso(startYTD)} to today.</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Expenses (YTD)</div>
          <div className="mt-2 text-2xl font-semibold">{fmtZar(expensesYtd)}</div>
          <div className="mt-1 text-xs text-white/55">From {iso(startYTD)} to today.</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Profit (YTD)</div>
          <div className="mt-2 text-2xl font-semibold">{fmtZar(profitYtd)}</div>
          <div className="mt-1 text-xs text-white/55">Keep it simple and track trends.</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Top expense categories (last 30 days)</div>
          {topCats30.length ? (
            <div className="mt-3 space-y-2">
              {topCats30.map(([name, amt]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <div className="text-white/80">{name}</div>
                  <div className="font-medium">{fmtZar(amt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm kx-muted">No expense data yet.</div>
          )}
        </div>

        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Open supplier bills</div>
          <div className="mt-2 text-sm kx-muted">
            Supplier bills don’t count as expenses until marked paid (cash basis). This keeps P&amp;L honest for small businesses.
          </div>
          <div className="mt-4 text-2xl font-semibold">{fmtZar(openBillsTotal)}</div>
          <div className="mt-1 text-xs text-white/55">Outstanding payables.</div>
        </div>
      </div>
    </PosHeroShell>
  );
}
