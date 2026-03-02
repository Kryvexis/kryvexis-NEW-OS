import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";

export const dynamic = "force-dynamic";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      {children}
    </div>
  );
}

export default async function MobileSales() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const ym = today.slice(0, 7);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id,total,issue_date,status,due_date")
    .eq("company_id", companyId)
    .limit(5000);

  const inv = invoices || [];
  const salesToday = inv.filter((i: any) => String(i.issue_date || "").slice(0, 10) === today).reduce((a: number, i: any) => a + Number(i.total || 0), 0);
  const salesWeek = inv.filter((i: any) => String(i.issue_date || "").slice(0, 10) >= weekAgo).reduce((a: number, i: any) => a + Number(i.total || 0), 0);
  const salesMonth = inv.filter((i: any) => String(i.issue_date || "").slice(0, 7) === ym).reduce((a: number, i: any) => a + Number(i.total || 0), 0);

  const unpaid = inv.filter((i: any) => String(i.status || "").toLowerCase() !== "paid");
  const owed = unpaid.reduce((a: number, i: any) => a + Number(i.total || 0), 0);
  const overdue = unpaid.filter((i: any) => {
    const due = String(i.due_date || "").slice(0, 10);
    return due && due < today;
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Sales</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs text-zinc-500">Sales Today</div>
          <div className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">{fmtZar(salesToday)}</div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">This Week</div>
          <div className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">{fmtZar(salesWeek)}</div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">This Month</div>
          <div className="mt-1 text-lg font-semibold">{fmtZar(salesMonth)}</div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">Receivables</div>
          <div className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">{fmtZar(owed)}</div>
          <div className="text-xs text-zinc-500">{overdue.length} overdue</div>
        </Card>
      </div>

      <Card>
        <div className="font-semibold">Quick links</div>
        <div className="mt-3 space-y-2 text-sm">
          <Link href="/sales/overview" className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>Sales Overview</span>
            <span className="text-zinc-400">›</span>
          </Link>
          <Link href="/sales/pos" className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>New Sale (POS)</span>
            <span className="text-zinc-400">›</span>
          </Link>
          <Link href="/invoices" className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>Invoices</span>
            <span className="text-zinc-400">›</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
