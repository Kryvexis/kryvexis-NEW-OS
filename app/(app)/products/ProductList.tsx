"use client";

import Link from "next/link";
import LimitedList from "@/components/lists/LimitedList";
import { fmtZar } from "@/lib/format";
import { deleteProductAction } from "./actions";

type ProductRow = {
  id: string;
  name: string;
  sku?: string | null;
  type?: string | null;
  unit_price?: number | null;
  cost_price?: number | null;
  supplier_name?: string | null;
};

export default function ProductList({ products }: { products: ProductRow[] }) {
  return (
    <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] overflow-hidden">
      <div className="p-4 border-b border-[rgba(var(--kx-border),.12)]">
        <div className="text-sm font-semibold">All items</div>
        <div className="text-xs kx-muted2 mt-1">Showing max 5 by default. Use search + View more.</div>
      </div>

      <div className="p-4">
        <LimitedList
          items={products || []}
          searchKeys={["name", "sku", "type"]}
          placeholder="Type e.g. W…"
          emptyText="No products yet."
          render={(p) => {
            const sell = Number(p.unit_price ?? 0);
            const cost = Number(p.cost_price ?? 0);
            const margin = sell - cost;

            return (
              <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 px-3 py-3">
                  <div className="md:col-span-4">
                    <div className="text-sm font-medium text-[rgba(var(--kx-fg),.92)]/90">{p.name}</div>
                    <div className="text-xs kx-muted2">{p.type ?? "—"}{p.sku ? ` · ${p.sku}` : ""}</div>
                  </div>
                  <div className="md:col-span-2 text-xs kx-muted md:text-right">Sell: {fmtZar(sell)}</div>
                  <div className="md:col-span-2 text-xs kx-muted md:text-right">Cost: {fmtZar(cost)}</div>
                  <div className="md:col-span-2 text-xs font-semibold text-[rgba(var(--kx-fg),.92)]/85 md:text-right">Margin: {fmtZar(margin)}</div>
                  <div className="md:col-span-2 text-xs kx-muted md:text-right">{p.supplier_name ?? "—"}</div>
                </div>
                <div className="px-3 pb-3 flex items-center justify-end gap-2">
                  <Link
                    href={`/products/${p.id}`}
                    className="rounded-lg border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] px-3 py-1.5 text-xs text-[rgba(var(--kx-fg),.82)] hover:bg-[rgba(var(--kx-border),.10)]"
                  >
                    Edit
                  </Link>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-100 hover:bg-red-500/15"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
