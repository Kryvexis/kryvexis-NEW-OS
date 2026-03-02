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

export default async function MobileHome() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: invoices }, { data: products }] = await Promise.all([
    supabase.from("invoices").select("id,total,issue_date,status,due_date").eq("company_id", companyId).limit(5000),
    supabase
      .from("products")
      .select("id,name,stock_on_hand,low_stock_threshold")
      .eq("company_id", companyId)
      .order("name", { ascending: true })
      .limit(500),
  ]);

  const inv = invoices || [];
  const prod = products || [];

  const salesToday = inv
    .filter((i: any) => String(i.issue_date || "").slice(0, 10) === today)
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0);

  // week = last 7 days
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const salesWeek = inv
    .filter((i: any) => String(i.issue_date || "").slice(0, 10) >= weekAgo)
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0);

  // month = this YYYY-MM
  const ym = today.slice(0, 7);
  const salesMonth = inv
    .filter((i: any) => String(i.issue_date || "").slice(0, 7) === ym)
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0);

  const unpaid = inv.filter((i: any) => String(i.status || "").toLowerCase() !== "paid");
  const owed = unpaid.reduce((a: number, i: any) => a + Number(i.total || 0), 0);

  const low = prod.filter((p: any) => Number(p.stock_on_hand || 0) <= Number(p.low_stock_threshold || 0));
  const out = prod.filter((p: any) => Number(p.stock_on_hand || 0) <= 0);

  const overdue = unpaid.filter((i: any) => {
    const due = String(i.due_date || "").slice(0, 10);
    return due && due < today;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Home</h1>
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
          Desktop view
        </Link>
      </div>

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
          <div className="text-xs text-zinc-500">Owed</div>
          <div className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">{fmtZar(owed)}</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div className="font-semibold">Stock Overview</div>
          <Link href="/m/buyers" className="text-sm text-blue-600 hover:underline">
            See all
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
            <div className="text-xs text-zinc-500">Low Stock</div>
            <div className="mt-1 text-lg font-semibold">{low.length}</div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
            <div className="text-xs text-zinc-500">Out of Stock</div>
            <div className="mt-1 text-lg font-semibold">{out.length}</div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {low.slice(0, 3).map((p: any) => (
            <Link
              key={p.id}
              href={`/m/buyers/${p.id}`}
              className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-zinc-500">Only {Number(p.stock_on_hand || 0)} left</div>
              </div>
              <span className="text-blue-600">›</span>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <div className="font-semibold">Alerts</div>
        <div className="mt-3 space-y-2 text-sm">
          <Link href="/m/sales" className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>{unpaid.length} Unpaid invoices</span>
            <span className="text-zinc-400">›</span>
          </Link>
          <Link href="/m/buyers" className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>{low.length} Items low in stock</span>
            <span className="text-zinc-400">›</span>
          </Link>
          <Link href="/m/sales" className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>{overdue.length} Overdue invoices</span>
            <span className="text-zinc-400">›</span>
          </Link>
        </div>
      </Card>

      <Link
        href="/sales/pos"
        className="block rounded-2xl bg-emerald-600 px-4 py-4 text-center font-semibold text-white shadow-lg"
      >
        + New Sale
      </Link>
    </div>
  );
}
