'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { clearPurchaseList, loadPurchaseList, removePurchaseItem, savePurchaseList, type PurchaseListItem } from '@/components/mobile/buyers/purchase-list-store'
import { fmtZar } from '@/lib/format'

export default function DesktopPurchaseList() {
  const [items, setItems] = useState<PurchaseListItem[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const sync = () => setItems(loadPurchaseList())
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('kx:purchase-list-updated', sync as EventListener)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('kx:purchase-list-updated', sync as EventListener)
    }
  }, [])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.suggested_qty || 0) * Number(item.unit_price || 0), 0),
    [items]
  )

  const draft = useMemo(() => {
    if (!items.length) return 'No items in the purchase list.'
    return [
      'Hello,',
      '',
      'Please prepare the following order:',
      '',
      ...items.map((item, index) => `${index + 1}. ${item.name}${item.sku ? ` (${item.sku})` : ''} - Qty ${Number(item.suggested_qty || 0)}`),
      '',
      'Regards,',
      'Kryvexis'
    ].join('\n')
  }, [items])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Buyers</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-kx-fg">Review &amp; order</h1>
          <p className="mt-2 max-w-2xl text-sm kx-muted">Review your shared purchase list, tweak quantities, then copy or email the supplier order.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="kx-button"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(draft)
                setCopied(true)
                setTimeout(() => setCopied(false), 1200)
              } catch {}
            }}
          >
            {copied ? 'Copied' : 'Copy order draft'}
          </button>
          <a
            className="kx-button kx-button-primary"
            href={`mailto:?subject=${encodeURIComponent('Purchase order request — Kryvexis')}&body=${encodeURIComponent(draft)}`}
          >
            Email supplier
          </a>
          <button
            className="kx-button"
            type="button"
            onClick={() => {
              clearPurchaseList()
              setItems([])
            }}
          >
            Clear list
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_.9fr]">
        <div className="kx-card overflow-hidden p-0">
          <div className="grid grid-cols-12 gap-2 border-b border-[rgba(var(--kx-border),.12)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] kx-muted2">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit</div>
            <div className="col-span-2 text-right">Line</div>
            <div className="col-span-1 text-right">&nbsp;</div>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-sm kx-muted">Your purchase list is empty. Add products from the Buyers screens.</div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="grid grid-cols-12 gap-2 border-b border-[rgba(var(--kx-border),.08)] px-4 py-4 text-sm">
                <div className="col-span-5 min-w-0">
                  <div className="truncate font-semibold text-kx-fg">{item.name}</div>
                  <div className="mt-1 text-xs kx-muted">{item.sku || 'No SKU'}</div>
                </div>
                <div className="col-span-2 text-right">
                  <input
                    type="number"
                    min={1}
                    value={Number(item.suggested_qty || 0)}
                    onChange={(e) => {
                      const next = items.map((row) => row.product_id === item.product_id ? { ...row, suggested_qty: Math.max(1, Number(e.target.value || 1)) } : row)
                      savePurchaseList(next)
                      setItems(next)
                    }}
                    className="w-20 rounded-xl border border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-surface),.7)] px-3 py-2 text-right"
                  />
                </div>
                <div className="col-span-2 text-right">{fmtZar(Number(item.unit_price || 0))}</div>
                <div className="col-span-2 text-right font-semibold">{fmtZar(Number(item.suggested_qty || 0) * Number(item.unit_price || 0))}</div>
                <div className="col-span-1 text-right">
                  <button
                    className="text-xs text-rose-400 hover:text-rose-300"
                    type="button"
                    onClick={() => {
                      const next = removePurchaseItem(item.product_id)
                      setItems(next)
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="kx-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Summary</div>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="kx-muted">Lines</span><span>{items.length}</span></div>
              <div className="flex items-center justify-between"><span className="kx-muted">Estimated total</span><span className="font-semibold">{fmtZar(total)}</span></div>
            </div>
          </div>
          <div className="kx-card">
            <div className="text-sm font-semibold">Order draft</div>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-[rgba(var(--kx-surface),.72)] p-4 text-xs text-kx-fg/80">{draft}</pre>
          </div>
          <Link href="/buyers" className="kx-button">Back to buyers</Link>
        </div>
      </div>
    </div>
  )
}
