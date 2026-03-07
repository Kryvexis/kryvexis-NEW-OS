"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/card";
import { Page } from "@/components/ui/page";
import {
  clearPurchaseList,
  loadPurchaseList,
  removePurchaseItem,
  savePurchaseList,
  PurchaseListItem,
} from "@/components/mobile/buyers/purchase-list-store";

function buildEmailBody(items: PurchaseListItem[], companyName = "Kryvexis") {
  const dateStr = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push("Hi,");
  lines.push("");
  lines.push("Please can you quote / supply the following stock order:");
  lines.push("");
  lines.push(`Company: ${companyName}`);
  lines.push(`Date: ${dateStr}`);
  lines.push("");
  lines.push("Items:");
  for (const it of items) {
    const sku = it.sku ? ` (${it.sku})` : "";
    lines.push(`- ${it.name}${sku} — Qty: ${it.suggested_qty}`);
  }
  lines.push("");
  lines.push("Thanks,");
  lines.push(companyName);
  return lines.join("\n");
}

function encodeMailto(to: string, subject: string, body: string) {
  const q = new URLSearchParams({ subject, body });
  return `mailto:${to}?${q.toString()}`;
}

export default function DesktopPurchaseList() {
  const [items, setItems] = useState<PurchaseListItem[]>([]);
  const [companyName, setCompanyName] = useState("Kryvexis");

  useEffect(() => {
    setItems(loadPurchaseList());
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, PurchaseListItem[]>();
    for (const it of items) {
      const key = it.supplier_id || "unassigned";
      const arr = map.get(key) || [];
      arr.push(it);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([key, groupItems]) => {
      const supName = groupItems[0]?.supplier_name || (key === "unassigned" ? "Unassigned" : "Supplier");
      const supEmail = groupItems[0]?.supplier_email || null;
      return { key, supName, supEmail, items: groupItems };
    });
  }, [items]);

  const emails = useMemo(() => {
    return grouped.map((g) => {
      const subject = `Stock Order Request - ${companyName} - ${new Date().toISOString().slice(0, 10)}`;
      const body = buildEmailBody(g.items, companyName);
      return { ...g, subject, body };
    });
  }, [grouped, companyName]);

  return (
    <Page
      title="Review & Order"
      subtitle="Check your purchase list, update quantities, and send supplier-ready orders."
      action={<Link href="/buyers" className="kx-button kx-btn-ghost">Back to Buyers</Link>}
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Order setup</div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="text-sm font-medium text-kx-fg">Company name</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-surface),.82)] px-4 py-3 text-sm text-kx-fg outline-none placeholder:text-kx-fg/40"
                placeholder="Kryvexis"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  clearPurchaseList();
                  setItems([]);
                }}
                className="kx-button kx-btn-ghost"
              >
                Clear list
              </button>
              <Link href="/suppliers" className="kx-button kx-button-primary">
                Open suppliers
              </Link>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Summary</div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-surface),.56)] p-4">
              <div className="text-xs uppercase tracking-[0.16em] kx-muted2">Lines</div>
              <div className="mt-2 text-3xl font-semibold text-kx-fg">{items.length}</div>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-surface),.56)] p-4">
              <div className="text-xs uppercase tracking-[0.16em] kx-muted2">Suppliers</div>
              <div className="mt-2 text-3xl font-semibold text-kx-fg">{grouped.length}</div>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-surface),.56)] p-4">
              <div className="text-xs uppercase tracking-[0.16em] kx-muted2">Suggested qty</div>
              <div className="mt-2 text-3xl font-semibold text-kx-fg">{items.reduce((sum, it) => sum + Number(it.suggested_qty || 0), 0)}</div>
            </div>
          </div>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="text-lg font-semibold text-kx-fg">Your purchase list is empty</div>
          <div className="mt-2 text-sm kx-muted">Add items from Buyers, then come back here to prepare your order.</div>
          <div className="mt-4">
            <Link href="/buyers" className="kx-button kx-button-primary">Open Buyers</Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {emails.map((g) => (
            <Card key={g.key}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-lg font-semibold text-kx-fg">{g.supName}</div>
                  <div className="mt-1 text-sm kx-muted">{g.items.length} item(s){g.supEmail ? ` • ${g.supEmail}` : ""}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.supEmail ? (
                    <a href={encodeMailto(g.supEmail, g.subject, g.body)} className="kx-button kx-button-primary">
                      Send Email
                    </a>
                  ) : (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                      No supplier email
                    </div>
                  )}
                  <button
                    className="kx-button kx-btn-ghost"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`Subject: ${g.subject}\n\n${g.body}`);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {g.items.map((it) => (
                  <div key={it.product_id} className="grid gap-3 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-surface),.44)] px-4 py-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-kx-fg">{it.name}</div>
                      <div className="mt-1 text-xs kx-muted">{it.sku ? `SKU: ${it.sku}` : "No SKU"}</div>
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={it.suggested_qty}
                      onChange={(e) => {
                        const q = Math.max(0, Number(e.target.value || 0));
                        const next = items.map((x) => (x.product_id === it.product_id ? { ...x, suggested_qty: q } : x));
                        setItems(next);
                        savePurchaseList(next);
                      }}
                      className="w-24 rounded-xl border border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-surface),.82)] px-3 py-2 text-sm text-kx-fg"
                    />
                    <button
                      className="text-sm font-medium text-rose-600"
                      onClick={() => setItems(removePurchaseItem(it.product_id))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Subject</div>
                  <div className="mt-2 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-surface),.44)] px-4 py-3 text-sm text-kx-fg">
                    {g.subject}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Email body</div>
                  <textarea
                    readOnly
                    value={g.body}
                    className="mt-2 min-h-[220px] w-full rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-surface),.44)] px-4 py-3 text-sm text-kx-fg"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
