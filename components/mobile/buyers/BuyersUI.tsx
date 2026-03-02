"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearPurchaseList,
  loadPurchaseList,
  removePurchaseItem,
  PurchaseListItem,
} from "./purchase-list-store";
import { fmtZar } from "@/lib/format";

export type BuyersTab = "low" | "out" | "recent";

export type BuyersRow = {
  id: string;
  name: string;
  sku?: string | null;
  stock_on_hand: number;
  low_stock_threshold: number;
  unit_price?: number | null;
  suggested_qty: number;
  reason: string;
  sold_window: number;
  window_days: number;
  avg_daily: number;
  supplier_id?: string | null;
  supplier_name?: string | null;
  supplier_email?: string | null;
};

function TabLink({ href, active, children }: { href: string; active: boolean; children: any }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm ${
        active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function BuyersUI({
  tab,
  rows,
}: {
  tab: BuyersTab;
  rows: BuyersRow[];
}) {
  const [purchaseList, setPurchaseList] = useState<PurchaseListItem[]>([]);

  useEffect(() => {
    setPurchaseList(loadPurchaseList());
  }, []);

  const counts = useMemo(() => {
    const low = rows.filter((r) => r.stock_on_hand > 0 && r.stock_on_hand <= r.low_stock_threshold).length;
    const out = rows.filter((r) => r.stock_on_hand <= 0).length;
    return { low, out };
  }, [rows]);

  const grouped = useMemo(() => {
    const map = new Map<string, PurchaseListItem[]>();
    for (const it of purchaseList) {
      const key = it.supplier_id || "unassigned";
      const arr = map.get(key) || [];
      arr.push(it);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const supName = items[0]?.supplier_name || (key === "unassigned" ? "Unassigned" : "Supplier");
      const supEmail = items[0]?.supplier_email || null;
      return { key, supName, supEmail, items };
    });
  }, [purchaseList]);

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Buyers</h1>
        <Link href="/operations/stock" className="text-sm text-blue-600 hover:text-blue-700">
          Full stock →
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <TabLink href="/m/buyers?tab=low" active={tab === "low"}>
          Low Stock
        </TabLink>
        <TabLink href="/m/buyers?tab=out" active={tab === "out"}>
          Out of Stock
        </TabLink>
        <TabLink href="/m/buyers?tab=recent" active={tab === "recent"}>
          Recently Reordered
        </TabLink>
      </div>

      {/* Purchase List */}
      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Purchase list</div>
            <div className="text-xs text-gray-600">Items you’re planning to order.</div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/m/buyers/purchase-list"
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white"
            >
              Review & Order
            </Link>
            <button
              type="button"
              onClick={() => {
                clearPurchaseList();
                setPurchaseList([]);
              }}
              className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-900"
            >
              Clear
            </button>
          </div>
        </div>

        {purchaseList.length ? (
          <div className="mt-3 space-y-2">
            {grouped.slice(0, 2).map((g) => (
              <div key={g.key} className="rounded-xl border bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{g.supName}</div>
                  <div className="text-xs text-gray-600">{g.items.length} item(s)</div>
                </div>
                <div className="mt-2 space-y-2">
                  {g.items.slice(0, 3).map((it) => (
                    <div key={it.product_id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="truncate">{it.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-gray-700">× {it.suggested_qty}</div>
                        <button
                          className="text-xs text-red-600"
                          onClick={() => setPurchaseList(removePurchaseItem(it.product_id))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {g.items.length > 3 ? (
                    <div className="text-xs text-gray-600">+ {g.items.length - 3} more…</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-gray-600">No items yet. Add from the list below 👇</div>
        )}
      </div>

      {/* List */}
      {tab === "recent" ? (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Recently reordered</div>
          <div className="mt-2 text-sm text-gray-700">
            Coming next: once purchase orders are logged, we’ll show the last 30 days of supplier orders here.
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="text-sm font-semibold">{tab === "out" ? "Out of stock" : "Low stock"}</div>
            <div className="text-xs text-gray-600">
              {tab === "out" ? counts.out : counts.low} item(s)
            </div>
          </div>

          <div className="divide-y">
            {rows.length ? (
              rows.map((r) => (
                <Link
                  key={r.id}
                  href={`/m/buyers/${r.id}`}
                  className="block px-4 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{r.name}</div>
                      <div className="mt-0.5 text-xs text-gray-600">
                        {r.sku ? `SKU: ${r.sku} · ` : ""}
                        Sold {r.sold_window} in {r.window_days}d
                      </div>
                      <div className="mt-1 text-xs text-gray-500 line-clamp-1">{r.reason}</div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-semibold ${r.stock_on_hand <= 0 ? "text-red-600" : "text-gray-900"}`}>
                        {r.stock_on_hand <= 0 ? "Out" : `${r.stock_on_hand} left`}
                      </div>
                      <div className="mt-1 text-xs text-blue-700">Suggest: {r.suggested_qty || 0}</div>
                      {r.unit_price != null ? (
                        <div className="mt-1 text-[11px] text-gray-500">{fmtZar(Number(r.unit_price || 0))}</div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-10 text-sm text-gray-600">No items here.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
