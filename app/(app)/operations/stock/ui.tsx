"use client";

import { useMemo, useState } from "react";
import { adjustStockAction } from "@/app/(app)/products/actions";

type P = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  type: string;
  unit_price: number | null;
  stock_on_hand: number | null;
  low_stock_threshold: number | null;
  is_active: boolean | null;
};

function fmtZar(n: number) {
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `R ${n.toFixed(2)}`;
  }
}

export default function StockUI({ products }: { products: P[] }) {
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) =>
      [p.name, p.sku || "", p.barcode || ""].join(" ").toLowerCase().includes(s)
    );
  }, [products, q]);

  const low = useMemo(() => {
    return filtered.filter((p) => {
      const on = Number(p.stock_on_hand || 0);
      const thr = Number(p.low_stock_threshold || 0);
      return p.type === "product" && p.is_active !== false && on <= thr;
    });
  }, [filtered]);

  async function adjust(id: string, delta: number) {
    setBusyId(id);
    setToast(null);
    const res = await adjustStockAction(id, delta);
    setBusyId(null);
    setToast(res.ok ? "Stock updated." : res.error ?? "Something went wrong.");
    // We don't have live revalidation here; user can refresh if needed.
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-6">
        <div className="text-2xl font-semibold">Stock</div>
        <div className="text-sm text-[rgba(var(--kx-muted),1)]">
          See what’s low, and quickly adjust stock when you receive or sell items.
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, SKU or barcode…"
            className="w-full sm:max-w-md rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
          {toast && (
            <div className="text-sm text-[rgba(var(--kx-muted),1)]">{toast}</div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-3xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-5">
          <div className="text-sm font-semibold">Low stock</div>
          <div className="text-xs text-[rgba(var(--kx-muted),1)]">
            Products at or below the reorder point.
          </div>
          <div className="mt-3 space-y-2">
            {low.length === 0 ? (
              <div className="text-sm text-[rgba(var(--kx-muted),1)]">All good.</div>
            ) : (
              low.slice(0, 20).map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[rgba(var(--kx-border),.10)] bg-black/20 p-3"
                >
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="mt-1 text-xs text-[rgba(var(--kx-muted),1)]">
                    On hand: <b>{Number(p.stock_on_hand || 0)}</b> · Reorder: {Number(p.low_stock_threshold || 0)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-5">
          <div className="text-sm font-semibold">Quick adjustments</div>
          <div className="text-xs text-[rgba(var(--kx-muted),1)]">
            Use + to receive stock, − to reduce stock. (Refresh the page to see updated totals.)
          </div>

          <div className="mt-3 divide-y divide-[rgba(var(--kx-border),.10)]">
            {filtered
              .filter((p) => p.type === "product" && p.is_active !== false)
              .slice(0, 60)
              .map((p) => {
                const on = Number(p.stock_on_hand || 0);
                return (
                  <div key={p.id} className="py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-[rgba(var(--kx-muted),1)]">
                        On hand: <b>{on}</b>
                        {p.barcode ? ` · Barcode: ${p.barcode}` : ""}
                        {p.sku ? ` · SKU: ${p.sku}` : ""}
                      </div>
                    </div>

                    <div className="hidden sm:block text-xs text-[rgba(var(--kx-muted),1)] w-28 text-right">
                      {fmtZar(Number(p.unit_price || 0))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjust(p.id, -1)}
                        disabled={busyId === p.id}
                        className="h-9 w-10 rounded-xl border border-[rgba(var(--kx-border),.14)] bg-black/25 text-sm hover:bg-black/35 disabled:opacity-60"
                        aria-label="Decrease stock"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => adjust(p.id, +1)}
                        disabled={busyId === p.id}
                        className="h-9 w-10 rounded-xl bg-[rgba(var(--kx-accent),.18)] text-sm font-semibold hover:bg-[rgba(var(--kx-accent),.26)] disabled:opacity-60"
                        aria-label="Increase stock"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}

            {filtered.length === 0 && (
              <div className="py-8 text-sm text-[rgba(var(--kx-muted),1)]">No products found.</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-5">
        <div className="text-sm font-semibold">Stock value (simple)</div>
        <div className="text-xs text-[rgba(var(--kx-muted),1)]">
          This is a quick estimate: unit price × stock on hand.
        </div>
        <div className="mt-2 text-2xl font-semibold">
          {fmtZar(
            filtered
              .filter((p) => p.type === "product" && p.is_active !== false)
              .reduce(
                (sum, p) =>
                  sum + Number(p.unit_price || 0) * Number(p.stock_on_hand || 0),
                0
              )
          )}
        </div>
      </div>
    </div>
  );
}
