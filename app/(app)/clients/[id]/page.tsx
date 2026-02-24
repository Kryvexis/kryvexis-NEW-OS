import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/card'
import { fmtZar } from '@/lib/format'

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params

  const supabase = await createClient();

  // ... keep everything else the same

  const since = new Date()
  since.setMonth(since.getMonth() - 3)
  const sinceIso = since.toISOString().slice(0, 10)

  const [{ data: client }, { data: invoices }, { data: quotes }] = await Promise.all([
  supabase.from('clients').select('*').eq('id', id).maybeSingle(),
  supabase.from('invoices').select('id,number,status,issue_date,total,balance_due').eq('client_id', id).order('issue_date', { ascending: false }).limit(200),
  supabase.from('quotes').select('id,number,status,issue_date,total').eq('client_id', id).order('issue_date', { ascending: false }).limit(200),
  ])

  const invoiceIds = (invoices || []).map((i) => i.id)
  const { data: invItems } = invoiceIds.length
    ? await supabase.from('invoice_items').select('description,qty,line_total,invoice_id').in('invoice_id', invoiceIds)
    : { data: [] as any[] }

  const last3mInvoices = (invoices || []).filter((i) => (i.issue_date || '') >= sinceIso)
  const spent3m = last3mInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0)
  const outstanding = (invoices || []).reduce((sum, i) => sum + Number(i.balance_due || 0), 0)
  const lifetime = (invoices || []).reduce((sum, i) => sum + Number(i.total || 0), 0)
  const orderCount = (invoices || []).length
  const avgOrder = orderCount ? lifetime / orderCount : 0
  const lastPurchase = (invoices || []).find((i) => i.issue_date)?.issue_date || null
  const prodMap = new Map<string, number>()
  for (const it of (invItems || []) as any[]) {
    const name = String(it.description || 'Item')
    prodMap.set(name, (prodMap.get(name) || 0) + Number(it.line_total || 0))
  }
  const topProducts = Array.from(prodMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight">{client?.name || 'Client'}</div>
          <div className="text-sm text-white/60">Purchase history summary (last 3 months) + invoices/quotes.</div>
        </div>
        <div className="flex items-center gap-2"><Link href={`/quotes/new?clientId=${id}`} className="kx-button">New Quote</Link>
                                                 <Link href={`/invoices/new?clientId=${id}`} className="kx-button">New Invoice</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <div className="text-xs text-white/55">Spent (last 3 months)</div>
          <div className="text-2xl font-semibold mt-1">{fmtZar(spent3m)}</div>
          <div className="text-xs text-white/55 mt-2">Since {sinceIso}</div>
        </Card>
        <Card>
          <div className="text-xs text-white/55">Outstanding</div>
          <div className="text-2xl font-semibold mt-1">{fmtZar(outstanding)}</div>
          <div className="text-xs text-white/55 mt-2">Across all invoices</div>
        </Card>
        <Card>
          <div className="text-xs text-white/55">Contact</div>
          <div className="mt-2 text-sm text-white/80">{client?.email || '—'}</div>
          <div className="text-sm text-white/80">{client?.phone || '—'}</div>
        </Card>
        <Card>
          <div className="text-xs text-white/55">Lifetime value</div>
          <div className="text-2xl font-semibold mt-1">{fmtZar(lifetime)}</div>
          <div className="text-xs text-white/55 mt-2">{orderCount} invoice(s)</div>
        </Card>
        <Card>
          <div className="text-xs text-white/55">Avg order value</div>
          <div className="text-2xl font-semibold mt-1">{fmtZar(avgOrder)}</div>
          <div className="text-xs text-white/55 mt-2">Across all invoices</div>
        </Card>
        <Card>
          <div className="text-xs text-white/55">Last purchase</div>
          <div className="text-2xl font-semibold mt-1">{lastPurchase || '—'}</div>
          <div className="text-xs text-white/55 mt-2">Most recent invoice date</div>
        </Card>
      </div>

            <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Top purchased items</div>
            <div className="text-xs text-white/55">By invoice line totals</div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {topProducts.map(([name, total]) => (
            <div key={name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-sm text-white/80">{name}</div>
              <div className="text-sm font-semibold">{fmtZar(total)}</div>
            </div>
          ))}
          {!topProducts.length && <div className="text-sm text-white/55">No line items yet.</div>}
        </div>
      </Card>

<div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm font-semibold">Invoices</div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Number</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoices || []).map((i) => (
                  <tr key={i.id} className="border-t border-white/10">
                    <td className="px-4 py-2"><Link className="text-white hover:underline" href={`/invoices/${i.id}`}>{i.number}</Link></td>
                    <td className="px-4 py-2 text-white/70">{i.status}</td>
                    <td className="px-4 py-2 text-white/70">{i.issue_date}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmtZar(Number(i.total || 0))}</td>
                  </tr>
                ))}
                {!invoices?.length && (
                  <tr>
                    <td className="px-4 py-6 text-white/60" colSpan={4}>No invoices yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Quotes</div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Number</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(quotes || []).map((q) => (
                  <tr key={q.id} className="border-t border-white/10">
                    <td className="px-4 py-2"><Link className="text-white hover:underline" href={`/quotes/${q.id}`}>{q.number}</Link></td>
                    <td className="px-4 py-2 text-white/70">{q.status}</td>
                    <td className="px-4 py-2 text-white/70">{q.issue_date}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmtZar(Number(q.total || 0))}</td>
                  </tr>
                ))}
                {!quotes?.length && (
                  <tr>
                    <td className="px-4 py-6 text-white/60" colSpan={4}>No quotes yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
