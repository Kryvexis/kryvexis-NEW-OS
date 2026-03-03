import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { recommendOrderQty } from "@/lib/buyers/recommend";
import { Page } from "@/components/ui/page";
import { Card } from "@/components/card";

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
    <Page
      title="Buyers"
      subtitle="Low stock + reorder suggestions (14-day velocity)"
      action={<Link href="/operations/stock" className="kx-button kx-button-primary">Open stock</Link>}
      // Keep mobile shortcut, but make it quiet.
    >
      <div className="flex items-center justify-end">
        <Link href="/m/buyers" className="kx-button kx-btn-ghost">Open mobile view</Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="text-sm kx-muted">Low stock</div>
          <div className="mt-1 text-3xl font-semibold">{low.length}</div>
        </Card>
        <Card>
          <div className="text-sm kx-muted">Out of stock</div>
          <div className="mt-1 text-3xl font-semibold">{out.length}</div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold kx-muted2">
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
              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-kx-surface2"
            >
              <div className="col-span-6 font-medium">{p.name}</div>
              <div className="col-span-2 text-right">{Number(p.stock_on_hand || 0)}</div>
              <div className="col-span-2 text-right">{Number(p.low_stock_threshold || 0)}</div>
              <div className="col-span-2 text-right font-semibold" style={{ color: `rgb(var(--kx-accent))` }}>
                {rec.suggestedQty}
              </div>
            </Link>
          );
        })}
      </Card>
    </Page>
  );
}
