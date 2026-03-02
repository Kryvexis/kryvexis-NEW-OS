'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardSub, CardTitle } from '@/components/card'

type Supplier = { id: string; name: string; email: string | null }
type BuyerRow = {
  id: string
  name: string
  sku: string | null
  supplier_id: string | null
  onHand: number
  reorderLevel: number
  sold14: number
  sold30: number
  velocityPerDay14: number
  suggestedQty: number
  daysToOut: number | null
  urgency: 'out' | 'low' | 'ok'
}

type Proposal = {
  supplier: Supplier
  subject: string
  body: string
  mailto: string | null
  items: Array<{
    product_id: string
    name: string
    sku: string | null
    onHand: number
    reorderLevel: number
    suggestedQty: number
    daysToOut: number | null
  }>
}

function fmtDays(n: number | null) {
  if (n == null || !Number.isFinite(n)) return '—'
  if (n <= 0) return '0'
  if (n < 1) return '<1'
  return String(Math.round(n))
}

function classForUrgency(u: BuyerRow['urgency']) {
  if (u === 'out') return 'text-red-400'
  if (u === 'low') return 'text-amber-300'
  return 'text-emerald-300'
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = React.useState(false)
  return (
    <button
      type="button"
      className="kx-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setOk(true)
          setTimeout(() => setOk(false), 1200)
        } catch {
          // ignore
        }
      }}
    >
      {ok ? 'Copied ✅' : label}
    </button>
  )
}

export default function BuyersWorkspace({
  rows,
  suppliers,
  proposals,
}: {
  rows: BuyerRow[]
  suppliers: Supplier[]
  proposals: Proposal[]
}) {
  const [tab, setTab] = React.useState<'overview' | 'low' | 'forecast' | 'proposals' | 'email'>('overview')

  const low = rows.filter((r) => r.urgency === 'low')
  const out = rows.filter((r) => r.urgency === 'out')
  const soon = rows.filter((r) => (r.daysToOut ?? 9999) <= 10).sort((a, b) => (a.daysToOut ?? 9999) - (b.daysToOut ?? 9999))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xl font-semibold">Buyers</div>
          <div className="text-sm kx-muted">Procurement workspace: low stock, stock-out prediction, smart reorder proposals, and supplier-ready emails.</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/suppliers" className="kx-btn">
            Suppliers
          </Link>
          <Link href="/operations/stock" className="kx-btn">
            Stock
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          ['overview', 'Overview'],
          ['low', 'Low stock'],
          ['forecast', 'Out-of-stock forecast'],
          ['proposals', 'Reorder proposals'],
          ['email', 'Email center'],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={'rounded-xl border px-3 py-2 text-sm transition ' + (tab === k ? 'border-white/15 bg-[rgba(var(--kx-border),.10)] text-[rgba(var(--kx-fg),.92)]' : 'border-[rgba(var(--kx-fg),.12)] bg-[rgba(var(--kx-fg),.05)] text-[rgba(var(--kx-fg),.92)]/80 hover:bg-[rgba(var(--kx-fg),.10)] hover:text-[rgba(var(--kx-fg),.92)]')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <CardSub>Low stock</CardSub>
          <div className="mt-1 text-2xl font-semibold">{low.length}</div>
        </Card>
        <Card className="p-4">
          <CardSub>Out of stock</CardSub>
          <div className="mt-1 text-2xl font-semibold">{out.length}</div>
        </Card>
        <Card className="p-4">
          <CardSub>Stock-out in ≤ 10 days</CardSub>
          <div className="mt-1 text-2xl font-semibold">{soon.length}</div>
        </Card>
        <Card className="p-4">
          <CardSub>Suppliers</CardSub>
          <div className="mt-1 text-2xl font-semibold">{suppliers.length}</div>
        </Card>
      </div>

      {tab === 'overview' && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardTitle>Smart insights</CardTitle>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.04)] px-3 py-2">
                <span className="font-semibold">{soon.length}</span> items are predicted to stock-out within <span className="font-semibold">10 days</span>.
              </div>
              <div className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.04)] px-3 py-2">
                <span className="font-semibold">{out.length}</span> items are currently <span className="font-semibold">out of stock</span>.
              </div>
              <div className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.04)] px-3 py-2">
                {proposals.length > 0 ? (
                  <>
                    <span className="font-semibold">{proposals.length}</span> supplier proposals are ready. Open <span className="font-semibold">Email center</span> to send.
                  </>
                ) : (
                  <>No proposals yet — add supplier emails and ensure products have a supplier assigned.</>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Next actions</CardTitle>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.04)] px-3 py-2">
                Review <span className="font-semibold">Out-of-stock forecast</span> and confirm reorder quantities.
              </div>
              <div className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.04)] px-3 py-2">
                Open <span className="font-semibold">Reorder proposals</span> to group items per supplier (auto-built).
              </div>
              <div className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.04)] px-3 py-2">
                Send supplier emails via <span className="font-semibold">Open email</span> (mailto) or <span className="font-semibold">Copy</span>.
              </div>
            </div>
          </Card>
        </div>
      )}

      {(tab === 'low' || tab === 'forecast') && (
        <Card>
          <div className="flex items-end justify-between gap-3">
            <div>
              <CardTitle>{tab === 'low' ? 'Low stock list' : 'Out-of-stock forecast'}</CardTitle>
              <CardSub className="mt-1">
                {tab === 'low'
                  ? 'Items at or below reorder level (plus out-of-stock).'
                  : 'Predicts stock-out based on 14-day sales velocity (lead 4d + safety 2d).'}
              </CardSub>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs kx-muted3">
                <tr className="border-b border-[rgba(var(--kx-border),.12)]">
                  <th className="py-2 text-left font-semibold">Item</th>
                  <th className="py-2 text-right font-semibold">On hand</th>
                  <th className="py-2 text-right font-semibold">Reorder</th>
                  <th className="py-2 text-right font-semibold">Sold 14d</th>
                  <th className="py-2 text-right font-semibold">Suggest</th>
                  <th className="py-2 text-right font-semibold">Days to out</th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'low'
                  ? rows.filter((r) => r.urgency !== 'ok')
                  : soon
                ).slice(0, 250).map((r) => (
                  <tr key={r.id} className="border-b border-[rgba(var(--kx-border),.10)] hover:bg-[rgba(var(--kx-fg),.03)]">
                    <td className="py-2">
                      <Link className="font-medium hover:underline" href={`/buyers/${r.id}`}>
                        {r.name}
                      </Link>
                      <div className="text-xs kx-muted">{r.sku ? `SKU ${r.sku}` : '—'}</div>
                    </td>
                    <td className={'py-2 text-right font-semibold ' + classForUrgency(r.urgency)}>{r.onHand}</td>
                    <td className="py-2 text-right">{r.reorderLevel}</td>
                    <td className="py-2 text-right">{r.sold14}</td>
                    <td className="py-2 text-right font-semibold">{r.suggestedQty}</td>
                    <td className="py-2 text-right">{fmtDays(r.daysToOut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'proposals' && (
        <div className="grid gap-3">
          {proposals.length === 0 ? (
            <Card>
              <CardTitle>No proposals available</CardTitle>
              <CardSub className="mt-1">To auto-build proposals, ensure products have a supplier assigned and suppliers have emails.</CardSub>
            </Card>
          ) : (
            proposals.map((p) => (
              <Card key={p.supplier.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>{p.supplier.name}</CardTitle>
                    <CardSub className="mt-1">{p.supplier.email || 'No email on supplier (add one in Suppliers)'}</CardSub>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.mailto ? (
                      <a className="kx-btn-primary" href={p.mailto}>
                        Open email
                      </a>
                    ) : (
                      <span className="kx-btn opacity-60 cursor-not-allowed">Open email</span>
                    )}
                    <CopyButton text={`${p.subject}\n\n${p.body}`} label="Copy email" />
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs kx-muted3">
                      <tr className="border-b border-[rgba(var(--kx-border),.12)]">
                        <th className="py-2 text-left font-semibold">Item</th>
                        <th className="py-2 text-right font-semibold">On hand</th>
                        <th className="py-2 text-right font-semibold">Reorder</th>
                        <th className="py-2 text-right font-semibold">Suggest</th>
                        <th className="py-2 text-right font-semibold">Days to out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.items.map((it) => (
                        <tr key={it.product_id} className="border-b border-[rgba(var(--kx-border),.10)] hover:bg-[rgba(var(--kx-fg),.03)]">
                          <td className="py-2">
                            <Link className="font-medium hover:underline" href={`/buyers/${it.product_id}`}>
                              {it.name}
                            </Link>
                            <div className="text-xs kx-muted">{it.sku ? `SKU ${it.sku}` : '—'}</div>
                          </td>
                          <td className="py-2 text-right">{it.onHand}</td>
                          <td className="py-2 text-right">{it.reorderLevel}</td>
                          <td className="py-2 text-right font-semibold">{it.suggestedQty}</td>
                          <td className="py-2 text-right">{fmtDays(it.daysToOut)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'email' && (
        <div className="grid gap-3">
          <Card>
            <CardTitle>Email center</CardTitle>
            <CardSub className="mt-1">
              Emails are generated automatically per supplier. Use <span className="font-semibold">Open email</span> to launch your email app with the draft,
              or <span className="font-semibold">Copy</span> to paste anywhere.
            </CardSub>
          </Card>

          {proposals.map((p) => (
            <Card key={'email-' + p.supplier.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>{p.supplier.name}</CardTitle>
                  <CardSub className="mt-1">{p.supplier.email || 'No email on supplier (add one in Suppliers)'}</CardSub>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.mailto ? (
                    <a className="kx-btn-primary" href={p.mailto}>
                      Open email
                    </a>
                  ) : (
                    <span className="kx-btn opacity-60 cursor-not-allowed">Open email</span>
                  )}
                  <CopyButton text={`Subject: ${p.subject}\n\n${p.body}`} label="Copy draft" />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.03)] p-3 text-sm whitespace-pre-wrap">
                <div className="text-xs kx-muted3 mb-2">Subject: {p.subject}</div>
                {p.body}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
