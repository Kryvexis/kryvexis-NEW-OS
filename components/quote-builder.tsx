'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createQuoteAction } from '@/app/(app)/quotes/actions'
import { fmtZar, isoDate } from '@/lib/format'

type Client = { id: string; name: string }
type Product = { id: string; name: string; unit_price: number; sku: string | null }

type Item = {
  product_id?: string | null
  description: string
  qty: number
  unit_price: number
  discount: number
  tax_rate: number
}

export default function QuoteBuilder({ clients, products }: { clients: Client[]; products: Product[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [clientId, setClientId] = useState(clients[0]?.id || '')
  const [issueDate, setIssueDate] = useState(isoDate())
  const [expiryDate, setExpiryDate] = useState(isoDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)))
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('Payment due on delivery. Thank you for your business.')
  const [error, setError] = useState<string | null>(null)

  const [items, setItems] = useState<Item[]>([
    { product_id: products[0]?.id || null, description: products[0]?.name || 'Item', qty: 1, unit_price: Number(products[0]?.unit_price || 0), discount: 0, tax_rate: 0.15 },
  ])

  const totals = useMemo(() => {
    let subtotal = 0
    let discount_total = 0
    let tax_total = 0
    for (const it of items) {
      const base = it.qty * it.unit_price
      const disc = Math.min(it.discount || 0, base)
      const after = Math.max(0, base - disc)
      const tax = after * (it.tax_rate || 0)
      subtotal += base
      discount_total += disc
      tax_total += tax
    }
    const total = Math.max(0, subtotal - discount_total) + tax_total
    return { subtotal, discount_total, tax_total, total }
  }, [items])

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function onPickProduct(idx: number, productId: string) {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    updateItem(idx, { product_id: p.id, description: p.name, unit_price: Number(p.unit_price || 0) })
  }

  async function onSave() {
    setError(null)
    start(async () => {
      const res = await createQuoteAction({
        client_id: clientId,
        issue_date: issueDate,
        expiry_date: expiryDate || null,
        notes: notes || null,
        terms: terms || null,
        items,
      })
      if (!res.ok) {
        setError(res.error || 'Failed')
        return
      }
      router.push(`/quotes/${res.id}`)
    })
  }

  return (
    <div className="space-y-4">
      {error && <div className="kx-card px-4 py-3 text-sm text-red-200 border-red-500/20">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="kx-card p-4 md:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Quote details</div>
              <div className="text-xs kx-muted2">Draft · totals update live</div>
            </div>
            <button className="kx-button kx-button-primary" onClick={onSave} disabled={pending || !clientId}>
              {pending ? 'Saving…' : 'Save Quote'}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="text-xs kx-muted mb-1">Client</div>
              <select className="kx-input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-xs kx-muted mb-1">Issue date</div>
                <input className="kx-input" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </label>
              <label className="block">
                <div className="text-xs kx-muted mb-1">Expiry date</div>
                <input className="kx-input" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold">Line items</div>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-[rgba(var(--kx-border),.12)]">
              <table className="w-full text-sm min-w-[860px]">
                <thead className="bg-[rgba(var(--kx-border),.06)] kx-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Item</th>
                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                    <th className="px-3 py-2 text-right font-medium">Price</th>
                    <th className="px-3 py-2 text-right font-medium">Discount</th>
                    <th className="px-3 py-2 text-right font-medium">Tax</th>
                    <th className="px-3 py-2 text-right font-medium">Line</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const base = it.qty * it.unit_price
                    const disc = Math.min(it.discount || 0, base)
                    const after = Math.max(0, base - disc)
                    const tax = after * (it.tax_rate || 0)
                    const line = after + tax
                    return (
                      <tr key={idx} className="border-t border-[rgba(var(--kx-border),.12)]">
                        <td className="px-3 py-2">
                          <div className="space-y-2">
                            <select className="kx-input" value={it.product_id || ''} onChange={(e) => onPickProduct(idx, e.target.value)}>
                              <option value="">Custom</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <input className="kx-input" value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} />
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            className="kx-input text-right"
                            type="number"
                            step="1"
                            min="1"
                            value={it.qty}
                            onChange={(e) => updateItem(idx, { qty: Math.max(1, parseInt(e.target.value || "1", 10) || 1) })}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            className="kx-input text-right opacity-60 cursor-not-allowed"
                            type="number"
                            step="0.01"
                            value={it.unit_price}
                            disabled
                            title="Price is locked. Use Discount to adjust."
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            className="kx-input text-right"
                            type="number"
                            step="0.01"
                            value={it.discount}
                            onChange={(e) => updateItem(idx, { discount: Number(e.target.value || 0) })}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <select className="kx-input text-right" value={it.tax_rate} onChange={(e) => updateItem(idx, { tax_rate: Number(e.target.value) })}>
                            <option value={0}>0%</option>
                            <option value={0.15}>15%</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">{fmtZar(line)}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            className="kx-button"
                            onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                            disabled={items.length <= 1}
                            title="Remove"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <button
                className="kx-button"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    { product_id: null, description: 'Item', qty: 1, unit_price: 0, discount: 0, tax_rate: 0.15 },
                  ])
                }
              >
                + Add line
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="text-xs kx-muted mb-1">Notes</div>
              <textarea className="kx-input min-h-[90px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <label className="block">
              <div className="text-xs kx-muted mb-1">Terms</div>
              <textarea className="kx-input min-h-[90px]" value={terms} onChange={(e) => setTerms(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="kx-card p-4 h-fit">
          <div className="text-sm font-semibold">Totals</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between kx-muted"><span>Subtotal</span><span>{fmtZar(totals.subtotal)}</span></div>
            <div className="flex items-center justify-between kx-muted"><span>Discount</span><span>- {fmtZar(totals.discount_total)}</span></div>
            <div className="flex items-center justify-between kx-muted"><span>Tax</span><span>{fmtZar(totals.tax_total)}</span></div>
            <div className="pt-2 mt-2 border-t border-[rgba(var(--kx-border),.12)] flex items-center justify-between font-semibold"><span>Total</span><span>{fmtZar(totals.total)}</span></div>
          </div>
          <div className="mt-4 text-xs kx-muted2">
            Tip: Once saved, open the quote and use <span className="font-medium">Convert → Invoice</span>.
          </div>
        </div>
      </div>
    </div>
  )
}
