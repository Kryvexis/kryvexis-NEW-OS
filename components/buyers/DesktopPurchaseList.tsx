"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Item = { product_id: string; name: string; qty: number };

export default function DesktopPurchaseList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const body = useMemo(() => [
    "Hi there,",
    "",
    "Please can you assist with the following stock order:",
    "",
    ...items.map((i) => `- ${i.name}: ${i.qty}`),
    "",
    "Kind regards,",
    "Kryvexis",
  ].join("\n"), [items]);
  const mailto = `mailto:?subject=${encodeURIComponent("Stock Order Request - Kryvexis")}&body=${encodeURIComponent(body)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] kx-muted2">Buyers</div>
          <h1 className="text-2xl font-semibold text-kx-fg">Review &amp; Order</h1>
        </div>
        <Link href="/buyers" className="kx-button kx-btn-ghost">Back to Buyers</Link>
      </div>

      <div className="rounded-3xl border border-[rgba(var(--kx-border),.14)] bg-[rgba(var(--kx-surface),.72)] p-5 shadow-[var(--kx-shadow-card)]">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(var(--kx-border),.18)] p-8 text-center text-sm kx-muted">
            Your purchase list is empty. Add items from Buyers first.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.product_id} className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-surface),.64)] px-4 py-3">
                <div>
                  <div className="font-medium text-kx-fg">{i.name}</div>
                  <div className="text-xs kx-muted2">Qty: {i.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) => {
                      const next = items.map((x) => x.product_id === i.product_id ? { ...x, qty: Math.max(1, Number(e.target.value || 1)) } : x);
                      setItems(next);
                    }}
                    className="w-24 rounded-xl border border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-surface),.82)] px-3 py-2 text-sm text-kx-fg"
                  />
                  <button className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-200" onClick={() => setItems(items.filter((x) => x.product_id !== i.product_id))}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <a href={mailto} className="kx-button kx-button-primary">Send Email</a>
          <button className="kx-button kx-btn-ghost" onClick={async () => { try { await navigator.clipboard.writeText(`Subject: Stock Order Request - Kryvexis\n\n${body}`); } catch {} }}>Copy</button>
        </div>
      </div>
    </div>
  );
}
