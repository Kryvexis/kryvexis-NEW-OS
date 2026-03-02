import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { recommendOrderQty } from "@/lib/buyers/recommend";

export const dynamic = "force-dynamic";

type SearchParams = { tab?: string };
type P = {
  id: string;
  name: string;
  sku: string | null;
  stock_on_hand: number | null;
  low_stock_threshold: number | null;
};

export default async function BuyersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const tab = String(sp.tab || "low");

  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const [{ data: products }, { data: items }] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,sku,stock_on_hand,low_stock_threshold")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(800),
    supabase
      .from("invoice_items")
      .select("product_id,qty,created_at")
      .limit(20000),
  ]);

  const prod = (products || []) as P[];
  const it = items || [];

  // sales over last 14 days per product
  const since = Date.now() - 14 * 864e5;
  const sold = new Map<string, number>();
  for (const row of it as any[]) {
    const pid = row.product_id;
    if (!pid) continue;
    const t = Date.parse(row.created_at || "");
    if (!Number.isFinite(t) || t < since) continue;
    sold.set(pid, (sold.get(pid) || 0) + Number(row.qty || 0));
  }

  const low = prod.filter((p) => Number(p.stock_on_hand || 0) <= Number(p.low_stock_threshold || 0));
  const out = prod.filter((p) => Number(p.stock_on_hand || 0) <= 0);

  const shown = tab === "out" ? out : low;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Buyers</h1>
        <Link href="/operations/stock" className="text-sm text-zinc-500 hover:underline">
          Full stock
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-black/5 bg-white p-2 text-sm dark:border-white/10 dark:bg-zinc-900">
        <Link href="/m/buyers?tab=low" className={"rounded-xl px-2 py-2 text-center " + (tab !== "out" ? "bg-blue-600 text-white" : "text-zinc-500")}>Low Stock</Link>
        <Link href="/m/buyers?tab=out" className={"rounded-xl px-2 py-2 text-center " + (tab === "out" ? "bg-blue-600 text-white" : "text-zinc-500")}>Out</Link>
        <Link href="/m/buyers?tab=recent" className="rounded-xl px-2 py-2 text-center text-zinc-400">Recent</Link>
      </div>

      <div className="space-y-2">
        {shown.map((p) => {
          const rec = recommendOrderQty({
            product: p,
            sales: { product_id: p.id, qty: sold.get(p.id) || 0, days: 14 },
            leadTimeDays: 4,
            safetyDays: 2,
          });
          return (
            <Link
              key={p.id}
              href={`/m/buyers/${p.id}`}
              className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{p.name}</div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {Number(p.stock_on_hand || 0)} left • Suggest{" "}
                  <span className="font-semibold text-blue-600">{rec.suggestedQty}</span>
                </div>
              </div>
              <span className="text-zinc-400">›</span>
            </Link>
          );
        })}
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-900">
            Nothing here 🎉
          </div>
        ) : null}
      </div>

      <Link
        href="/m/buyers/purchase-list"
        className="block rounded-2xl bg-blue-600 px-4 py-4 text-center font-semibold text-white shadow-lg"
      >
        Review & Order
      </Link>
    </div>
  );
}
