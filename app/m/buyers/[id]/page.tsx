import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";
import { suggestReorderQty } from "@/lib/buyers/recommend";
import ItemActions from "@/components/mobile/buyers/ItemActions";

export const dynamic = "force-dynamic";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function BuyerItemPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,name,sku,unit_price,stock_on_hand,low_stock_threshold")
    .eq("company_id", companyId)
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="px-4 py-6">
        <Link href="/m/buyers" className="text-sm text-blue-600">← Back</Link>
        <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm text-sm text-red-700">{error.message}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-4 py-6">
        <Link href="/m/buyers" className="text-sm text-blue-600">← Back</Link>
        <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm text-sm text-gray-700">Item not found.</div>
      </div>
    );
  }

  // Velocity: last 14 days
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 14);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id,issue_date")
    .eq("company_id", companyId)
    .gte("issue_date", iso(start))
    .limit(5000);

  const invoiceIds = (invoices || []).map((i: any) => i.id);
  let soldWindow = 0;
  if (invoiceIds.length) {
    const { data: items } = await supabase
      .from("invoice_items")
      .select("qty,product_id,invoice_id")
      .in("invoice_id", invoiceIds)
      .eq("product_id", product.id)
      .limit(20000);

    soldWindow = (items || []).reduce((a: number, it: any) => a + Number(it.qty || 0), 0);
  }

  const rec = suggestReorderQty(
    {
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock_on_hand: product.stock_on_hand,
      low_stock_threshold: product.low_stock_threshold,
    },
    { [product.id]: soldWindow },
    { windowDays: 14, leadTimeDays: 4, safetyDays: 2 }
  );

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <Link href="/m/buyers" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back
        </Link>
        <Link href="/operations/stock" className="text-sm text-blue-600 hover:text-blue-700">
          Stock
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-gray-600">Item</div>
            <h1 className="mt-1 truncate text-xl font-semibold">{product.name}</h1>
            <div className="mt-1 text-sm text-gray-600">
              {product.sku ? `SKU: ${product.sku} · ` : ""}
              {product.unit_price != null ? `Price: ${fmtZar(Number(product.unit_price || 0))}` : ""}
            </div>
          </div>

          <div className="text-right">
            <div className={`text-sm font-semibold ${Number(product.stock_on_hand || 0) <= 0 ? "text-red-600" : "text-gray-900"}`}>
              {Number(product.stock_on_hand || 0) <= 0 ? "Out" : `${Number(product.stock_on_hand || 0)} left`}
            </div>
            <div className="mt-1 text-xs text-gray-600">Reorder level: {Number(product.low_stock_threshold || 0)}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-gray-600">Sold (14d)</div>
            <div className="mt-1 text-lg font-semibold">{soldWindow}</div>
            <div className="mt-1 text-xs text-gray-500">~{rec.avgDaily.toFixed(2)}/day</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-gray-600">Suggested order</div>
            <div className="mt-1 text-lg font-semibold text-blue-700">{rec.qty}</div>
            <div className="mt-1 text-xs text-gray-500">Target: {rec.target}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-gray-600">Reason</div>
            <div className="mt-1 text-xs text-gray-700">{rec.reason}</div>
          </div>
        </div>

        <ItemActions
          product={{
            product_id: product.id,
            name: product.name,
            sku: product.sku,
            suggested_qty: rec.qty,
            unit_price: product.unit_price,
          }}
        />

        <div className="mt-4 rounded-xl border bg-amber-50 p-3 text-xs text-amber-800">
          Next upgrade: link items to preferred supplier so emails can be sent directly (Brevo + logging). For now, Review & Order uses mailto/copy.
        </div>
      </div>
    </div>
  );
}
