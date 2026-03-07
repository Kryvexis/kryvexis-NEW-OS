'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  clearPurchaseList,
  loadPurchaseList,
  removePurchaseItem,
  savePurchaseList,
  type PurchaseListItem,
} from '@/components/mobile/buyers/purchase-list-store'

function buildEmailBody(items: PurchaseListItem[], companyName = 'Kryvexis') {
  const dateStr = new Date().toISOString().slice(0, 10)
  const lines: string[] = [
    'Hi,',
    '',
    'Please can you quote / supply the following stock order:',
    '',
    `Company: ${companyName}`,
    `Date: ${dateStr}`,
    '',
    'Items:',
  ]
  for (const it of items) {
    const sku = it.sku ? ` (${it.sku})` : ''
    lines.push(`- ${it.name}${sku} — Qty: ${it.suggested_qty}`)
  }
  lines.push('', 'Thanks,', companyName)
  return lines.join('\n')
}

function encodeMailto(to: string, subject: string, body: string) {
  const q = new URLSearchParams({ subject, body })
  return `mailto:${to}?${q.toString()}`
}

export default function DesktopPurchaseList() {
  const [items, setItems] = useState<PurchaseListItem[]>([])
  const [companyName, setCompanyName] = useState('Kryvexis')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    setItems(loadPurchaseList())
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, PurchaseListItem[]>()
    for (const it of items) {
      const key = it.supplier_id || 'unassigned'
      const arr = map.get(key) || []
      arr.push(it)
      map.set(key, arr)
    }
    return Array.from(map.entries()).map(([key, groupItems]) => {
      const supName = groupItems[0]?.supplier_name || (key === 'unassigned' ? 'Unassigned' : 'Supplier')
      const supEmail = groupItems[0]?.supplier_email || null
      const subject = `Stock Order Request - ${companyName} - ${new Date().toISOString().slice(0, 10)}`
      const body = buildEmailBody(groupItems, companyName)
      return { key, supName, supEmail, items: groupItems, subject, body }
    })
  }, [items, companyName])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] kx-muted2">Buyers</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-kx-fg">Review &amp; Order</h1>
          <p className="mt-1 text-sm kx-muted">Group your purchase list by supplier, adjust quantities, and launch supplier email drafts.</p>
        </div>
        <Link href="/buyers" className="kx-button kx-btn-ghost">← Back to Buyers</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[28px] border border-[rgba(var(--kx-border),.16)] bg-[rgba(var(--kx-surface),.88)] p-5 shadow-[var(--kx-shadow-card)]">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Email signature</div>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-[rgba(var(--kx-border),.16)] bg-[rgba(var(--kx-surface),.68)] px-4 py-3 text-sm"
            placeholder="Kryvexis"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="kx-button" type="button" onClick={() => { clearPurchaseList(); setItems([]) }}>Clear list</button>
            <Link href="/operations/suppliers" className="kx-button kx-button-primary">Manage suppliers</Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-[rgba(var(--kx-border),.16)] bg-[rgba(var(--kx-surface),.88)] p-5 shadow-[var(--kx-shadow-card)]">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Summary</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.03)] p-4">
              <div className="text-xs kx-muted">Suppliers</div>
              <div className="mt-1 text-2xl font-semibold">{grouped.length}</div>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.03)] p-4">
              <div className="text-xs kx-muted">Items</div>
              <div className="mt-1 text-2xl font-semibold">{items.length}</div>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.03)] p-4">
              <div className="text-xs kx-muted">Qty total</div>
              <div className="mt-1 text-2xl font-semibold">{items.reduce((sum, it) => sum + Number(it.suggested_qty || 0), 0)}</div>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] border border-[rgba(var(--kx-border),.16)] bg-[rgba(var(--kx-surface),.88)] p-8 text-sm kx-muted shadow-[var(--kx-shadow-card)]">
          Nothing in your purchase list yet. Go add items from <Link href="/buyers" className="text-blue-400 hover:underline">Buyers</Link>.
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((g) => (
            <div key={g.key} className="rounded-[28px] border border-[rgba(var(--kx-border),.16)] bg-[rgba(var(--kx-surface),.88)] p-5 shadow-[var(--kx-shadow-card)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xl font-semibold">{g.supName}</div>
                  <div className="mt-1 text-sm kx-muted">{g.items.length} item(s) {g.supEmail ? `• ${g.supEmail}` : '• No supplier email set'}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.supEmail ? <a href={encodeMailto(g.supEmail, g.subject, g.body)} className="kx-button kx-button-primary">Open email</a> : <span className="kx-button opacity-60 cursor-not-allowed">No email</span>}
                  <button
                    type="button"
                    className="kx-button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`Subject: ${g.subject}\n\n${g.body}`)
                      setCopied(g.key)
                      window.setTimeout(() => setCopied(null), 1800)
                    }}
                  >
                    {copied === g.key ? 'Copied' : 'Copy draft'}
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] kx-muted2">
                    <tr className="border-b border-[rgba(var(--kx-border),.12)]">
                      <th className="py-2 text-left">Item</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((it) => (
                      <tr key={it.product_id} className="border-b border-[rgba(var(--kx-border),.08)]">
                        <td className="py-3">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs kx-muted">{it.sku ? `SKU ${it.sku}` : '—'}</div>
                        </td>
                        <td className="py-3 text-right">
                          <input
                            type="number"
                            min={0}
                            value={it.suggested_qty}
                            onChange={(e) => {
                              const q = Math.max(0, Number(e.target.value || 0))
                              const next = items.map((x) => x.product_id === it.product_id ? { ...x, suggested_qty: q } : x)
                              setItems(next)
                              savePurchaseList(next)
                            }}
                            className="w-24 rounded-xl border border-[rgba(var(--kx-border),.14)] bg-[rgba(var(--kx-surface),.68)] px-3 py-2 text-right"
                          />
                        </td>
                        <td className="py-3 text-right">
                          <button className="text-sm text-red-400 hover:text-red-300" type="button" onClick={() => setItems(removePurchaseItem(it.product_id))}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.03)] p-4 text-sm whitespace-pre-wrap">
                <div className="mb-2 text-xs uppercase tracking-[0.12em] kx-muted2">Draft email</div>
                <div className="text-xs kx-muted mb-2">Subject: {g.subject}</div>
                {g.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
