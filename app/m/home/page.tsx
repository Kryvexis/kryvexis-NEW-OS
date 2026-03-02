import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";
import { Home as HomeIcon, Package, ReceiptText, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      {children}
    </div>
  );
}

function StatRow({
  icon,
  title,
  value,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-50 text-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-200">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-zinc-500">{title}</div>
        <div className="mt-0.5 text-lg font-semibold truncate">{value}</div>
        {note ? <div className="mt-0.5 text-xs text-zinc-500">{note}</div> : null}
      </div>
      <span className="text-zinc-400">›</span>
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

  // Top seller from invoice_items is computed on desktop dashboard; keep mobile lightweight.
  const topStockRisk = low[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Home</h1>
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
          Desktop view
        </Link>
      </div>

      {/* KPI stack (simple + scannable) */}
      <div className="space-y-2">
        <StatRow icon={<HomeIcon className="h-5 w-5" />} title="Revenue" value={fmtZar(salesMonth)} note="This month" />
        <StatRow icon={<Package className="h-5 w-5" />} title="Low stock" value={`${low.length} items`} note={topStockRisk ? `${topStockRisk.name} low` : "All good"} />
        <StatRow icon={<ReceiptText className="h-5 w-5" />} title="Unpaid invoices" value={`${unpaid.length}`} note={`${overdue.length} past due`} />
        <StatRow icon={<AlertTriangle className="h-5 w-5" />} title="Today" value={fmtZar(salesToday)} note="Sales today" />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div className="font-semibold">Smart insights</div>
          <Link href="/m/buyers" className="text-sm text-blue-600 hover:underline">
            Stock
          </Link>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <Link href="/m/sales" className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>{overdue.length} overdue invoices</span>
            <span className="text-zinc-400">›</span>
          </Link>
          <Link href="/m/buyers" className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>{low.length} items low in stock</span>
            <span className="text-zinc-400">›</span>
          </Link>
          <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950/40">
            <span>{fmtZar(owed)} owed</span>
            <span className="text-zinc-400">•</span>
          </div>
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
