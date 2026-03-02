"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearPurchaseList,
  loadPurchaseList,
  removePurchaseItem,
  savePurchaseList,
  PurchaseListItem,
} from "./purchase-list-store";

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

export default function PurchaseListUI() {
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
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-600">Buyers</div>
          <h1 className="text-xl font-semibold">Review & Order</h1>
        </div>
        <Link href="/m/buyers" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back
        </Link>
      </div>

      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Company name (for email signature)</div>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Kryvexis"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              clearPurchaseList();
              setItems([]);
            }}
            className="rounded-xl bg-gray-100 px-3 py-2 text-sm"
          >
            Clear list
          </button>
          <Link href="/operations/suppliers" className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white">
            Manage suppliers
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-4 shadow-sm text-sm text-gray-700">
          Nothing in your purchase list yet. Go add items from <Link className="text-blue-600" href="/m/buyers">Buyers</Link>.
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((g) => (
            <div key={g.key} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{g.supName}</div>
                  <div className="mt-0.5 text-xs text-gray-600">{g.items.length} item(s)</div>
                </div>
                {g.supEmail ? (
                  <a
                    href={encodeMailto(g.supEmail, g.subject, g.body)}
                    className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white"
                  >
                    Send Email
                  </a>
                ) : (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                    No supplier email
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {g.items.map((it) => (
                  <div key={it.product_id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-gray-600">{it.sku ? `SKU: ${it.sku}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        value={it.suggested_qty}
                        onChange={(e) => {
                          const q = Math.max(0, Number(e.target.value || 0));
                          const next = items.map((x) =>
                            x.product_id === it.product_id ? { ...x, suggested_qty: q } : x
                          );
                          setItems(next);
                          savePurchaseList(next);
                        }}
                        className="w-20 rounded-xl border px-2 py-1 text-sm"
                      />
                      <button
                        className="text-xs text-red-600"
                        onClick={() => setItems(removePurchaseItem(it.product_id))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-600">Subject</div>
                <div className="mt-1 rounded-xl border bg-gray-50 px-3 py-2 text-sm">{g.subject}</div>

                <div className="mt-3 text-xs text-gray-600">Email body</div>
                <textarea
                  readOnly
                  value={g.body}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm min-h-[180px]"
                />

                <div className="mt-2 flex gap-2">
                  <button
                    className="rounded-xl bg-gray-100 px-3 py-2 text-sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`Subject: ${g.subject}\n\n${g.body}`);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
