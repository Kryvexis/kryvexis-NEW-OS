import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { recommendOrderQty } from "@/lib/buyers/recommend";
import BuyersWorkspace from "./BuyersWorkspace";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  supplier_id: string | null;
  stock_on_hand: number | null;
  low_stock_threshold: number | null;
  cost_price: number | null;
  unit_price: number | null;
};

type SupplierRow = { id: string; name: string; email: string | null };

function safeNum(v: any) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function buildEmail(input: {
  supplierName: string;
  items: Array<{ name: string; sku: string | null; qty: number }>;
}) {
  const subject = `Purchase Order Request — ${input.supplierName}`;
  const lines = input.items.map((it) => `- ${it.name}${it.sku ? ` (SKU: ${it.sku})` : ""} — Qty ${it.qty}`);
  const body =
    `Hi ${input.supplierName},\n\n` +
    `Please can you supply the following items:\n\n` +
    `${lines.join("\n")}\n\n` +
    `Delivery / Collection: Please confirm availability and ETA.\n` +
    `Payment: EFT (or cash on collection if needed).\n\n` +
    `Thanks,\nKryvexis OS Buying Team`;
  return { subject, body };
}

export default async function BuyersPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const since14 = new Date(Date.now() - 14 * 864e5).toISOString();
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();

  // Fetch: products + suppliers + recent invoice items.
  // NOTE: invoice_items may not have company_id in all schemas; we apply a created_at cutoff only.
  const [{ data: products }, { data: suppliers }, { data: items }] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,sku,supplier_id,stock_on_hand,low_stock_threshold,cost_price,unit_price,is_active")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(5000),
    supabase
      .from("suppliers")
      .select("id,name,email")
      .eq("company_id", companyId)
      .order("name", { ascending: true })
      .limit(2000),
    supabase.from("invoice_items").select("product_id,qty,created_at").gte("created_at", since30).limit(50000),
  ]);

  const prod = ((products || []) as any[]).map((p) => p as ProductRow);
  const sup = ((suppliers || []) as any[]).map((s) => s as SupplierRow);

  const sold14 = new Map<string, number>();
  const sold30 = new Map<string, number>();

  for (const row of (items || []) as any[]) {
    const pid = row.product_id as string | null;
    if (!pid) continue;
    const qty = safeNum(row.qty);
    const t = Date.parse(row.created_at || "");
    if (!Number.isFinite(t)) continue;
    if (t >= Date.parse(since30)) sold30.set(pid, (sold30.get(pid) || 0) + qty);
    if (t >= Date.parse(since14)) sold14.set(pid, (sold14.get(pid) || 0) + qty);
  }

  const rows = prod.map((p) => {
    const onHand = safeNum(p.stock_on_hand);
    const reorderLevel = safeNum(p.low_stock_threshold);
    const s14 = sold14.get(p.id) || 0;
    const s30 = sold30.get(p.id) || 0;

    const rec = recommendOrderQty({
      product: {
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock_on_hand: p.stock_on_hand,
        low_stock_threshold: p.low_stock_threshold,
      },
      sales: { product_id: p.id, qty: s14, days: 14 },
      leadTimeDays: 4,
      safetyDays: 2,
    });

    const vel = rec.velocityPerDay;
    const daysToOut = vel > 0 ? onHand / vel : null;

    const urgency: "out" | "low" | "ok" =
      onHand <= 0 ? "out" : onHand <= reorderLevel ? "low" : "ok";

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      supplier_id: p.supplier_id,
      onHand,
      reorderLevel,
      sold14: s14,
      sold30: s30,
      velocityPerDay14: vel,
      suggestedQty: rec.suggestedQty,
      daysToOut,
      urgency,
    };
  });

  // Build proposals per supplier (items with suggestedQty > 0)
  const bySupplier = new Map<string, typeof rows>();
  for (const r of rows) {
    if (!r.supplier_id) continue;
    if (r.suggestedQty <= 0) continue;
    const arr = bySupplier.get(r.supplier_id) || [];
    arr.push(r);
    bySupplier.set(r.supplier_id, arr);
  }

  const proposals = sup
    .map((s) => {
      const items = (bySupplier.get(s.id) || [])
        .slice()
        .sort((a, b) => (a.daysToOut ?? 9999) - (b.daysToOut ?? 9999))
        .slice(0, 80)
        .map((r) => ({
          product_id: r.id,
          name: r.name,
          sku: r.sku,
          onHand: r.onHand,
          reorderLevel: r.reorderLevel,
          suggestedQty: r.suggestedQty,
          daysToOut: r.daysToOut,
        }));

      if (items.length === 0) return null;

      const email = buildEmail({
        supplierName: s.name,
        items: items.map((it) => ({ name: it.name, sku: it.sku, qty: it.suggestedQty })),
      });

      const mailto = s.email
        ? `mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(
            email.body
          )}`
        : null;

      return {
        supplier: s,
        subject: email.subject,
        body: email.body,
        mailto,
        items,
      };
    })
    .filter(Boolean) as any[];

  return <BuyersWorkspace rows={rows as any} suppliers={sup as any} proposals={proposals as any} />;
}
