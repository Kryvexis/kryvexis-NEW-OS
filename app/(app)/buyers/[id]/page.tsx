import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { recommendOrderQty } from "@/lib/buyers/recommend";
import { fmtZar } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BuyersItemWeb({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();
  const { id } = await params;

  const [{ data: product }, { data: items }] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,sku,unit_price,stock_on_hand,low_stock_threshold")
      .eq("company_id", companyId)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("invoice_items").select("product_id,qty,created_at").eq("product_id", id).limit(5000),
  ]);

  if (!product) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center text-sm text-zinc-500 dark:bg-zinc-900">
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

  const rec = recommendOrderQty({ product, sales: { product_id: id, qty, days: 14 }, leadTimeDays: 4, safetyDays: 2 });

  return (
    <div className="space-y-4">
      <Link href="/buyers" className="text-sm text-blue-600 hover:underline">
        ← Buyers
      </Link>

      <div className="rounded-2xl border bg-white p-5 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <div className="mt-1 text-sm text-zinc-500">
              {product.sku ? `SKU: ${product.sku}` : "—"} • Price: {fmtZar(Number(product.unit_price || 0))}
            </div>
          </div>
          <div className="flex gap-2">
            <form action="/m/buyers/purchase-list" method="get">
              <input type="hidden" name="added" value="1" />
            </form>
            <form action={async (fd: FormData) => {
              'use server'
              const { addToPurchaseListAction } = await import('@/app/m/buyers/purchase-list/actions')
              await addToPurchaseListAction(fd)
            }}>
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="name" value={product.name} />
              <input type="hidden" name="suggested_qty" value={String(rec.suggestedQty || 1)} />
              <button className="rounded-xl border border-blue-600/20 bg-blue-600/10 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">Add to Purchase List</button>
            </form>
            <Link href="/buyers/purchase-list" className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
              Review & Order
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
            <div className="text-xs text-zinc-500">In stock</div>
            <div className="mt-1 text-2xl font-semibold">{Number(product.stock_on_hand || 0)}</div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
            <div className="text-xs text-zinc-500">Reorder level</div>
            <div className="mt-1 text-2xl font-semibold">{Number(product.low_stock_threshold || 0)}</div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
            <div className="text-xs text-zinc-500">Sold 14d</div>
            <div className="mt-1 text-2xl font-semibold">{qty}</div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-blue-600/15 bg-blue-600/5 p-4">
          <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Suggested order: {rec.suggestedQty}</div>
          <div className="mt-1 text-sm text-zinc-500">{rec.reason}</div>
        </div>
      </div>
    </div>
  );
}
