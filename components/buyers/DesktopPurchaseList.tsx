"use client";

import Link from "next/link";
import { useMemo } from "react";

type Item = { product_id: string; name: string; qty: number };

export default function DesktopPurchaseList({ items }: { items: Item[] }) {
  const body = useMemo(() => [
    "Hi there,",
    "",
    "Please can you assist with the following stock order:",
    "",
    ...items.map((i) => `- ${i.name}: ${i.qty}`),
    "",
    "Kind regards,",
    "Kryvexis",
  ].join("
"), [items]);

  const mailto = `mailto:?subject=${encodeURIComponent("Stock Order Request - Kryvexis")}&body=${encodeURIComponent(body)}`;

  async function copyText() {
    try { await navigator.clipboard.writeText(`Subject: Stock Order Request - Kryvexis

${body}`); } catch {}
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/buyers" className="text-sm hover:underline">← Buyers</Link>
      </div>
      <div className="kx-card p-5">
        <div className="text-2xl font-semibold">Review &amp; Order</div>
        <div className="mt-1 text-sm kx-muted">Review your purchase list and send a supplier email.</div>
        <div className="mt-4 space-y-2">
          {items.length ? items.map((i) => <div key={i.product_id} className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.04)] p-3"><div className="font-medium">{i.name}</div><div className="text-sm kx-muted">Qty: {i.qty}</div></div>) : <div className="rounded-2xl border border-dashed border-[rgba(var(--kx-border),.16)] p-6 text-center text-sm kx-muted">Your purchase list is empty.</div>}
        </div>
        <div className="mt-4 flex gap-2">
          <a href={mailto} className="kx-button kx-button-primary">Send Email</a>
          <button type="button" onClick={copyText} className="kx-button">Copy</button>
        </div>
      </div>
    </div>
  )
}
