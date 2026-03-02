// app/m/buyers/page.tsx
// Next.js 15.5.x typegen can type `searchParams` as a Promise in generated PageProps.

import BuyersUI, { type BuyersRow, type BuyersTab } from "@/components/mobile/buyers/BuyersUI";
import { requireCompanyId } from "@/lib/kx";
import { createClient } from "@/lib/supabase/server";
import { suggestReorderQty } from "@/lib/buyers/recommend";

export const dynamic = "force-dynamic";

type SearchParams = {
  tab?: string | string[];
};

function getTab(sp: SearchParams): BuyersTab {
  const raw = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const t = (raw ?? "low").toLowerCase();
  if (t === "out") return "out";
  if (t === "recent") return "recent";
  return "low";
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function BuyersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const tab = getTab(sp);

  const supabase = await createClient();
  const companyId = await requireCompanyId();

  // Pull product list (cap for mobile)
  const { data: products } = await supabase
    .from("products")
    .select(
      "id,name,sku,unit_price,stock_on_hand,low_stock_threshold,is_active,created_at"
    )
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(600);

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 14);

  // Load invoice ids for last 14 days, then aggregate item qty per product
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id,issue_date")
    .eq("company_id", companyId)
    .gte("issue_date", iso(start))
    .limit(5000);

  const invoiceIds = (invoices || []).map((i: any) => i.id);
  const velocity: Record<string, number> = {};

  if (invoiceIds.length) {
    const { data: items } = await supabase
      .from("invoice_items")
      .select("product_id,qty,invoice_id")
      .in("invoice_id", invoiceIds)
      .limit(20000);

    for (const it of items || []) {
      const pid = String((it as any).product_id || "");
      if (!pid) continue;
      velocity[pid] = (velocity[pid] || 0) + Number((it as any).qty || 0);
    }
  }

  const all = (products || []).map((p: any) => {
    const rec = suggestReorderQty(
      {
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock_on_hand: p.stock_on_hand,
        low_stock_threshold: p.low_stock_threshold,
      },
      velocity,
      { windowDays: 14, leadTimeDays: 4, safetyDays: 2 }
    );

    const row: BuyersRow = {
      id: p.id,
      name: String(p.name || ""),
      sku: p.sku ?? null,
      stock_on_hand: Number(p.stock_on_hand ?? 0),
      low_stock_threshold: Number(p.low_stock_threshold ?? 0),
      unit_price: p.unit_price ?? null,
      suggested_qty: rec.qty,
      reason: rec.reason,
      sold_window: rec.soldWindow,
      window_days: rec.windowDays,
      avg_daily: rec.avgDaily,
    };
    return row;
  });

  const lowRows = all
    .filter((r) => r.stock_on_hand > 0 && r.stock_on_hand <= Math.max(0, r.low_stock_threshold))
    .sort((a, b) => a.stock_on_hand - b.stock_on_hand)
    .slice(0, 120);

  const outRows = all
    .filter((r) => r.stock_on_hand <= 0)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 120);

  const rows = tab === "out" ? outRows : tab === "low" ? lowRows : [];

  return <BuyersUI tab={tab} rows={rows} />;
}
