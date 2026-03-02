import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { recommendOrderQty } from "@/lib/buyers/recommend";
import { fmtZar } from "@/lib/format";
import { addToPurchaseListAction } from "@/app/m/buyers/purchase-list/actions";

export const dynamic = "force-dynamic";

export default async function BuyerItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const [{ data: product }, { data: items }] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,sku,unit_price,stock_on_hand,low_stock_threshold")
      .eq("company_id", companyId)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("invoice_items")
      .select("product_id,qty,created_at")
      .eq("product_id", id)
      .limit(5000),
  ]);

  if (!product) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-6 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-900">
        Item not found
      </div>
    );
  }

  const since = Date.now() - 14 * 864e5;
  let qty = 0;
  for (const r of (items || []) as any[]) {
    const t = Date.parse(r.created_at || "");
    if (Number.isFinite(t) && t >= since) qty += Number(r.qty || 0);
  }

  const rec = recommendOrderQty({
    product,
    sales: { product_id: id, qty, days: 14 },
    leadTimeDays: 4,
    safetyDays: 2,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/m/buyers" className="text-blue-600 hover:underline">
          ← Buyers
        </Link>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="text-lg font-semibold">{product.name}</div>
        <div className="mt-1 text-sm text-zinc-500">
          {product.sku ? `SKU: ${product.sku}` : "—"} • Price: {fmtZar(Number(product.unit_price || 0))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
            <div className="text-xs text-zinc-500">In stock</div>
            <div className="mt-1 text-lg font-semibold">{Number(product.stock_on_hand || 0)}</div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
            <div className="text-xs text-zinc-500">Reorder lvl</div>
            <div className="mt-1 text-lg font-semibold">{Number(product.low_stock_threshold || 0)}</div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
            <div className="text-xs text-zinc-500">Sold 14d</div>
            <div className="mt-1 text-lg font-semibold">{qty}</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-600/15 bg-blue-600/5 p-3 text-sm">
          <div className="font-semibold text-blue-700 dark:text-blue-300">Suggested order: {rec.suggestedQty}</div>
          <div className="mt-1 text-xs text-zinc-500">{rec.reason}</div>
        </div>

        <form action={addToPurchaseListAction} className="mt-4">
          <input type="hidden" name="product_id" value={product.id} />
          <input type="hidden" name="name" value={product.name} />
          <input type="hidden" name="suggested_qty" value={String(rec.suggestedQty)} />
          <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg">
            Add to Purchase List
          </button>
        </form>
      </div>

      <Link href="/m/buyers/purchase-list" className="block rounded-2xl bg-zinc-900 px-4 py-3 text-center font-semibold text-white dark:bg-zinc-800">
        Review & Order
      </Link>
    </div>
  );
}
