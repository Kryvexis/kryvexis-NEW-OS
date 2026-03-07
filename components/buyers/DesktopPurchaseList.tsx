'use client'

import { useMemo, useState } from 'react'

type Item = { product_id: string; name: string; qty: number }

export default function DesktopPurchaseList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [copied, setCopied] = useState(false)

  const body = useMemo(
    () => [
      'Hi there,',
      '',
      'Please can you assist with the following stock order:',
      '',
      ...items.map((i) => `- ${i.name}: ${i.qty}`),
      '',
      'Kind regards,',
      'Kryvexis',
    ].join('\n'),
    [items]
  )

  const mailto = useMemo(
    () => `mailto:?subject=${encodeURIComponent('Stock Order Request - Kryvexis')}&body=${encodeURIComponent(body)}`,
    [body]
  )

  function clearList() {
    document.cookie = `kx_purchase_list=${encodeURIComponent(JSON.stringify([]))}; path=/; max-age=0`
    setItems([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-kx-fg">Review &amp; Order</h1>
          <p className="mt-1 text-sm kx-muted">Review your purchase list, copy the order, or open your email client with the draft.</p>
        </div>
        <button className="kx-button" onClick={clearList}>Clear</button>
      </div>

      <div className="grid gap-3">
        {items.length === 0 ? <div className="rounded-3xl border border-dashed border-[rgba(var(--kx-border),.14)] p-10 text-center text-sm kx-muted">Your purchase list is empty.</div> : null}
        {items.map((i) => (
          <div key={i.product_id} className="rounded-3xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-surface),.82)] p-4">
            <div className="font-medium text-kx-fg">{i.name}</div>
            <div className="mt-1 text-sm kx-muted">Qty: {i.qty}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={mailto} className="kx-button kx-button-primary">Open email</a>
        <button
          className="kx-button"
          onClick={async () => {
            await navigator.clipboard.writeText(`Subject: Stock Order Request - Kryvexis\n\n${body}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? 'Copied ✅' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
