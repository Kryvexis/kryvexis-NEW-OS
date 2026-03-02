import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";
import { PosHeroShell } from "@/components/pos/hero-shell";
import { RightRail } from "@/components/pos/right-rail";

export const dynamic = "force-dynamic";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AccountingDashboard() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 30);

  const [
    { data: invoices, error: invErr },
    { data: expenses, error: expErr },
    { data: bills, error: billErr },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("id,total,issue_date")
      .eq("company_id", companyId)
      .gte("issue_date", iso(start30))
      .limit(5000),
    supabase
      .from("transactions")
      .select("id,amount,tx_date,category")
      .eq("company_id", companyId)
      .eq("kind", "expense")
      .gte("tx_date", iso(start30))
      .limit(8000),
    supabase
      .from("supplier_bills")
      .select("id,balance_due,total,status,due_date")
      .eq("company_id", companyId)
      .limit(8000),
  ]);

  const revenue30 = (invoices || []).reduce((a: number, i: any) => a + Number(i.total || 0), 0);
  const expenses30 = (expenses || []).reduce((a: number, t: any) => a + Number(t.amount || 0), 0);
  const profit30 = revenue30 - expenses30;

  const openBillsTotal = (bills || [])
    .filter((b: any) => !["paid", "void"].includes(String(b.status || "unpaid")))
    .reduce((a: number, b: any) => a + Number(b.balance_due ?? b.total ?? 0), 0);

  const overdue = (bills || []).filter((b: any) => {
    if (!b.due_date) return false;
    const due = new Date(String(b.due_date));
    return due < now && !["paid", "void"].includes(String(b.status || "unpaid"));
  }).length;

  const dbNeeds = [invErr, expErr, billErr].filter(Boolean).map((e: any) => e.message);

  return (
    <PosHeroShell
      title="Accounting"
      subtitle="Fast, practical accounting for real operators. Capture expenses, track payables, and keep profit visible."
      rail={
        <RightRail
          title="Quick actions"
          actions={[
            { label: "Add expense", href: "/accounting/expenses" },
            { label: "Add supplier bill", href: "/accounting/payables" },
          ]}
          items={[
            { label: "P&L", sub: "30-day + YTD view", href: "/accounting/pnl" },
            { label: "Categories", sub: "Keep reports clean", href: "/accounting/categories" },
          ]}
        />
      }
    >
      {dbNeeds.length ? (
        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Database upgrade required</div>
          <div className="mt-2 text-sm kx-muted">
            Accounting upgrades require: <span className="font-mono">sql/upgrade_full.sql</span> and{" "}
            <span className="font-mono">sql/060_accounting_payables.sql</span>.
          </div>
          <div className="mt-3 space-y-1 text-xs text-white/50">
            {dbNeeds.slice(0, 3).map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Revenue (30d)</div>
          <div className="mt-2 text-2xl font-semibold">{fmtZar(revenue30)}</div>
          <div className="mt-1 text-xs text-white/55">Invoices issued.</div>
        </div>

        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Expenses (30d)</div>
          <div className="mt-2 text-2xl font-semibold">{fmtZar(expenses30)}</div>
          <div className="mt-1 text-xs text-white/55">Captured cash out.</div>
        </div>

        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Profit (30d)</div>
          <div className="mt-2 text-2xl font-semibold">{fmtZar(profit30)}</div>
          <div className="mt-1 text-xs text-white/55">Revenue minus expenses.</div>
        </div>

        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Payables</div>
          <div className="mt-2 text-2xl font-semibold">{fmtZar(openBillsTotal)}</div>
          <div className="mt-1 text-xs text-white/55">{overdue ? `${overdue} overdue` : "No overdue bills"}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="kx-card p-6">
          <div className="text-sm font-semibold">New upgrades ✅</div>
          <div className="mt-2 text-sm kx-muted">
            These are now live in Accounting. Keep it simple and you’ll always know where money is going.
          </div>

          <div className="mt-4 grid gap-3">
            <Link className="kx-btn kx-btn-ghost justify-between" href="/accounting/expenses">
              <span>Expenses</span>
              <span className="text-xs text-white/60">Fast capture</span>
            </Link>

            <Link className="kx-btn kx-btn-ghost justify-between" href="/accounting/payables">
              <span>Supplier bills</span>
              <span className="text-xs text-white/60">Track payables</span>
            </Link>

            <Link className="kx-btn kx-btn-ghost justify-between" href="/accounting/categories">
              <span>Categories</span>
              <span className="text-xs text-white/60">Clean reporting</span>
            </Link>

            <Link className="kx-btn kx-btn-ghost justify-between" href="/accounting/pnl">
              <span>Simple P&amp;L</span>
              <span className="text-xs text-white/60">30d + YTD</span>
            </Link>
          </div>
        </div>

        <div className="kx-card p-6">
          <div className="text-sm font-semibold">Operating rules</div>
          <div className="mt-2 text-sm kx-muted">The system stays “Apple-simple” when the rules are consistent:</div>

          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-white/60">•</span>
              <span className="text-white/80">Capture expenses as they happen.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-white/60">•</span>
              <span className="text-white/80">Add supplier bills under Payables; mark paid when cash leaves.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-white/60">•</span>
              <span className="text-white/80">Keep categories broad; P&amp;L stays readable.</span>
            </li>
          </ul>
        </div>
      </div>
    </PosHeroShell>
  );
}
