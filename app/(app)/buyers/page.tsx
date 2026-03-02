import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { recommendOrderQty } from "@/lib/buyers/recommend";

export const dynamic = "force-dynamic";

type P = {
  id: string;
  name: string;
  sku: string | null;
  stock_on_hand: number | null;
  low_stock_threshold: number | null;
};

export default async function BuyersWebPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const [{ data: products }, { data: items }] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,sku,stock_on_hand,low_stock_threshold,is_active")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(2000),
    supabase.from("invoice_items").select("product_id,qty,created_at").limit(50000),
  ]);

  const prod = (products || []) as P[];
  const since = Date.now() - 14 * 864e5;
  const sold = new Map<string, number>();
  for (const row of (items || []) as any[]) {
    const pid = row.product_id;
    if (!pid) continue;
    const t = Date.parse(row.created_at || "");
    if (!Number.isFinite(t) || t < since) continue;
    sold.set(pid, (sold.get(pid) || 0) + Number(row.qty || 0));
  }

  const low = prod.filter((p) => Number(p.stock_on_hand || 0) <= Number(p.low_stock_threshold || 0));
  const out = prod.filter((p) => Number(p.stock_on_hand || 0) <= 0);

  const rows = [...out, ...low.filter((p) => !out.find((o) => o.id === p.id))].slice(0, 200);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Buyers</h1>
          <div className="text-sm text-zinc-500">Low stock + reorder suggestions (14-day velocity)</div>
        </div>
        <div className="flex gap-2">
          <Link href="/operations/stock" className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
            Stock
          </Link>
          <Link href="/m/buyers" className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
            Mobile view
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-4 dark:bg-zinc-900">
          <div className="text-sm text-zinc-500">Low stock</div>
          <div className="mt-1 text-3xl font-semibold">{low.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:bg-zinc-900">
          <div className="text-sm text-zinc-500">Out of stock</div>
          <div className="mt-1 text-3xl font-semibold">{out.length}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900">
        <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-semibold text-zinc-500">
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-right">On hand</div>
          <div className="col-span-2 text-right">Reorder</div>
          <div className="col-span-2 text-right">Suggest</div>
        </div>
        {rows.map((p) => {
          const rec = recommendOrderQty({
            product: p,
            sales: { product_id: p.id, qty: sold.get(p.id) || 0, days: 14 },
            leadTimeDays: 4,
            safetyDays: 2,
          });
          return (
            <Link
              key={p.id}
              href={`/buyers/${p.id}`}
              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-950/40"
            >
              <div className="col-span-6 font-medium">{p.name}</div>
              <div className="col-span-2 text-right">{Number(p.stock_on_hand || 0)}</div>
              <div className="col-span-2 text-right">{Number(p.low_stock_threshold || 0)}</div>
              <div className="col-span-2 text-right font-semibold text-blue-600">{rec.suggestedQty}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
