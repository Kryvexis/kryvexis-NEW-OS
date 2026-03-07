import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { recommendOrderQty } from "@/lib/buyers/recommend";
import { Page } from "@/components/ui/page";
import { Card } from "@/components/card";

type P = {
  id: string;
  name: string;
  sku: string | null;
  stock_on_hand: number | null;
  low_stock_threshold: number | null;
};

type SearchParams = {
  q?: string;
  tab?: string;
};

export const dynamic = "force-dynamic";

function statTone(kind: "critical" | "warning" | "info") {
  if (kind === "critical") return "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300";
  if (kind === "warning") return "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300";
  return "border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-surface),.76)] text-kx-fg";
}

export default async function BuyersWebPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const tab = String(sp.tab || "all");
  const q = String(sp.q || "").trim().toLowerCase();

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

  const enriched = prod.map((p) => {
    const onHand = Number(p.stock_on_hand || 0);
    const reorderLevel = Number(p.low_stock_threshold || 0);
    const rec = recommendOrderQty({
      product: p,
      sales: { product_id: p.id, qty: sold.get(p.id) || 0, days: 14 },
      leadTimeDays: 4,
      safetyDays: 2,
    });
    const status = onHand <= 0 ? "out" : onHand <= reorderLevel ? "low" : "ok";
    return {
      ...p,
      onHand,
      reorderLevel,
      sold14d: sold.get(p.id) || 0,
      suggestedQty: rec.suggestedQty,
      reason: rec.reason,
      status,
    };
  });

  const filtered = enriched.filter((p) => {
    if (tab === "out" && p.status !== "out") return false;
    if (tab === "low" && p.status !== "low") return false;
    if (tab === "watch" && p.status === "ok") return false;
    if (!q) return true;
    return [p.name, p.sku || ""].join(" ").toLowerCase().includes(q);
  });

  const rows = filtered
    .sort((a, b) => {
      const severityA = a.status === "out" ? 0 : a.status === "low" ? 1 : 2;
      const severityB = b.status === "out" ? 0 : b.status === "low" ? 1 : 2;
      if (severityA !== severityB) return severityA - severityB;
      if (b.sold14d !== a.sold14d) return b.sold14d - a.sold14d;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 300);

  const low = enriched.filter((p) => p.status === "low");
  const out = enriched.filter((p) => p.status === "out");
  const watch = enriched.filter((p) => p.status !== "ok");
  const totalSuggested = watch.reduce((sum, p) => sum + Number(p.suggestedQty || 0), 0);

  return (
    <Page
      title="Buyers"
      subtitle="Procurement cockpit for low stock, out-of-stock lines, and reorder signals."
      action={
        <div className="flex flex-wrap gap-2">
          <Link href="/operations/stock" className="kx-button kx-button-primary">Open stock</Link>
          <Link href="/m/buyers/purchase-list" className="kx-button kx-btn-ghost">Review &amp; order</Link>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-[28px] border border-[rgba(var(--kx-border),.16)] bg-[linear-gradient(135deg,rgba(var(--kx-accent),.12),rgba(var(--kx-accent),.04)_45%,rgba(var(--kx-surface),.96)_85%)] p-5 shadow-[var(--kx-shadow-card)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] kx-muted2">Procurement desk</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-kx-fg">Reorder ahead of stock-outs</h2>
              <p className="mt-2 max-w-2xl text-sm kx-muted">
                Prioritise fast-selling items, monitor stock pressure, and jump straight into review order flows.
              </p>
            </div>
            <form className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search item or SKU"
                className="min-w-[220px] rounded-2xl border border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-surface),.82)] px-4 py-3 text-sm text-kx-fg outline-none ring-0 placeholder:text-kx-fg/40"
              />
              <input type="hidden" name="tab" value={tab} />
              <button className="kx-button kx-button-primary">Search</button>
            </form>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Card className={statTone("critical")}>
              <div className="text-xs font-semibold uppercase tracking-[0.16em]">Out of stock</div>
              <div className="mt-2 text-3xl font-semibold">{out.length}</div>
              <div className="mt-1 text-sm opacity-80">Immediate replenishment needed</div>
            </Card>
            <Card className={statTone("warning")}>
              <div className="text-xs font-semibold uppercase tracking-[0.16em]">Low stock</div>
              <div className="mt-2 text-3xl font-semibold">{low.length}</div>
              <div className="mt-1 text-sm opacity-80">Below reorder threshold</div>
            </Card>
            <Card>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Watchlist</div>
              <div className="mt-2 text-3xl font-semibold">{watch.length}</div>
              <div className="mt-1 text-sm kx-muted">Items needing procurement attention</div>
            </Card>
            <Card>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Suggested qty</div>
              <div className="mt-2 text-3xl font-semibold">{totalSuggested}</div>
              <div className="mt-1 text-sm kx-muted">Combined 14-day reorder guidance</div>
            </Card>
          </div>
        </div>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Actions</div>
          <div className="mt-3 grid gap-2">
            <Link href="/operations/products" className="rounded-2xl border border-[rgba(var(--kx-border),.14)] px-4 py-3 text-sm font-medium hover:bg-kx-surface2">Open products</Link>
            <Link href="/operations/suppliers" className="rounded-2xl border border-[rgba(var(--kx-border),.14)] px-4 py-3 text-sm font-medium hover:bg-kx-surface2">Open suppliers</Link>
            <Link href="/operations/stock" className="rounded-2xl border border-[rgba(var(--kx-border),.14)] px-4 py-3 text-sm font-medium hover:bg-kx-surface2">Stock movements</Link>
            <Link href="/m/buyers/purchase-list" className="rounded-2xl border border-[rgba(var(--kx-border),.14)] px-4 py-3 text-sm font-medium hover:bg-kx-surface2">Review &amp; order</Link>
          </div>
          <div className="mt-4 rounded-2xl border border-[rgba(var(--kx-border),.14)] bg-[rgba(var(--kx-surface),.58)] p-4 text-sm kx-muted">
            Suggested quantity is derived from the last 14 days of sales velocity with 4 lead-time days and 2 safety days.
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["all", `All (${enriched.length})`],
          ["out", `Out (${out.length})`],
          ["low", `Low (${low.length})`],
          ["watch", `Watch (${watch.length})`],
        ].map(([value, label]) => {
          const active = tab === value;
          const href = q ? `/buyers?tab=${value}&q=${encodeURIComponent(q)}` : `/buyers?tab=${value}`;
          return (
            <Link
              key={value}
              href={href}
              className={
                "rounded-full border px-4 py-2 text-sm font-medium transition " +
                (active
                  ? "border-transparent bg-[rgb(var(--kx-accent))] text-white"
                  : "border-[rgba(var(--kx-border),.16)] bg-[rgba(var(--kx-surface),.72)] text-kx-fg/80 hover:bg-kx-surface2")
              }
            >
              {label}
            </Link>
          );
        })}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-12 gap-2 border-b border-[rgba(var(--kx-border),.12)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] kx-muted2">
          <div className="col-span-4">Item</div>
          <div className="col-span-2 text-right">On hand</div>
          <div className="col-span-2 text-right">Reorder</div>
          <div className="col-span-2 text-right">Sold 14d</div>
          <div className="col-span-2 text-right">Suggest</div>
        </div>

        {rows.map((p) => (
          <Link
            key={p.id}
            href={`/buyers/${p.id}`}
            className="grid grid-cols-12 gap-2 border-b border-[rgba(var(--kx-border),.08)] px-4 py-4 text-sm transition hover:bg-kx-surface2"
          >
            <div className="col-span-4 min-w-0">
              <div className="truncate font-semibold text-kx-fg">{p.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs kx-muted">
                <span>{p.sku || "No SKU"}</span>
                <span
                  className={
                    "rounded-full px-2 py-0.5 font-semibold " +
                    (p.status === "out"
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                      : p.status === "low"
                        ? "bg-amber-500/12 text-amber-700 dark:text-amber-300"
                        : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300")
                  }
                >
                  {p.status === "out" ? "Out" : p.status === "low" ? "Low" : "Healthy"}
                </span>
              </div>
            </div>
            <div className="col-span-2 text-right font-medium">{p.onHand}</div>
            <div className="col-span-2 text-right">{p.reorderLevel}</div>
            <div className="col-span-2 text-right">{p.sold14d}</div>
            <div className="col-span-2 text-right font-semibold" style={{ color: `rgb(var(--kx-accent))` }}>
              {p.suggestedQty}
            </div>
          </Link>
        ))}

        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="text-lg font-semibold text-kx-fg">No matching items</div>
            <div className="mt-2 text-sm kx-muted">Try a different search or switch back to the full watchlist.</div>
          </div>
        ) : null}
      </Card>
    </Page>
  );
}
