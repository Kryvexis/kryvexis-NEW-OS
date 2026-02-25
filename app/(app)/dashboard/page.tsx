import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { Card } from '@/components/card'
import { fmtZar } from '@/lib/format'

function monthKey(iso?: string | null) {
  if (!iso) return ''
  return iso.slice(0, 7) // YYYY-MM
}
function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, (m || 1) - 1, 1)
  return d.toLocaleString('en-ZA', { month: 'short' })
}

export default async function Page() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: invoices }, { data: quotes }, { data: payments }, { data: clients }, { data: activity }] = await Promise.all([
    supabase.from('invoices').select('id,number,total,balance_due,status,issue_date,due_date,client_id, clients(name)').eq('company_id', companyId).limit(2000),
    supabase.from('quotes').select('id,number,total,status,issue_date,client_id, clients(name)').eq('company_id', companyId).limit(2000),
    supabase.from('payments').select('id,amount,payment_date,invoice_id').eq('company_id', companyId).limit(5000),
    supabase.from('clients').select('id,name').eq('company_id', companyId).limit(5000),
    supabase.from('activity_logs').select('id,action,entity_type,entity_id,created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(20),
  ])

  const totalInvoiced = (invoices || []).reduce((a, i) => a + Number(i.total || 0), 0)
  const outstanding = (invoices || []).reduce((a, i) => a + Number(i.balance_due || 0), 0)
  const collected = (payments || []).reduce((a, p) => a + Number(p.amount || 0), 0)

  const openQuotes = (quotes || []).filter((q) => !['Rejected', 'Expired'].includes(String(q.status || ''))).length
  const paidInvoices = (invoices || []).filter((i) => String(i.status) === 'Paid').length

  // Top clients (by invoiced total)
  const clientName = new Map((clients || []).map((c) => [c.id, c.name]))
  const byClient = new Map<string, number>()
  for (const inv of invoices || []) {
    const k = String(inv.client_id || '')
    if (!k) continue
    byClient.set(k, (byClient.get(k) || 0) + Number(inv.total || 0))
  }
  const topClients = Array.from(byClient.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, total]) => ({ id, name: clientName.get(id) || 'Client', total }))

  // Revenue trend (last 6 months)
  const months = (() => {
    const keys = new Set<string>()
    for (const inv of invoices || []) keys.add(monthKey(inv.issue_date))
    const sorted = Array.from(keys).filter(Boolean).sort()
    return sorted.slice(-6)
  })()
  const revenueByMonth = months.map((k) => {
    const sum = (invoices || [])
      .filter((i) => monthKey(i.issue_date) === k)
      .reduce((a, i) => a + Number(i.total || 0), 0)
    return { key: k, label: monthLabel(k), value: sum }
  })
  const maxRev = Math.max(1, ...revenueByMonth.map((m) => m.value))

  // Status breakdown
  const statusCounts = new Map<string, number>()
  for (const inv of invoices || []) {
    const s = String(inv.status || 'Draft')
    statusCounts.set(s, (statusCounts.get(s) || 0) + 1)
  }
  const statusList = Array.from(statusCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)

  // Outstanding invoices list
  const outstandingList = (invoices || [])
    .filter((i) => Number(i.balance_due || 0) > 0.01)
    .sort((a, b) => Number(b.balance_due || 0) - Number(a.balance_due || 0))
    .slice(0, 8)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xl font-semibold">Dashboard</div>
          <div className="text-sm text-[rgba(var(--kx-fg),..60)]">Command center: sales, income, and performance.</div>
        </div>
        <div className="flex gap-2">
          <Link href="/quotes/new" className="kx-button">New Quote</Link>
          <Link href="/invoices/new" className="kx-button">New Invoice</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <div className="text-xs text-[rgba(var(--kx-fg),..55)]">Revenue Invoiced</div>
          <div className="mt-1 text-2xl font-semibold">{fmtZar(totalInvoiced)}</div>
        </Card>
        <Card>
          <div className="text-xs text-[rgba(var(--kx-fg),..55)]">Collected</div>
          <div className="mt-1 text-2xl font-semibold">{fmtZar(collected)}</div>
        </Card>
        <Card>
          <div className="text-xs text-[rgba(var(--kx-fg),..55)]">Outstanding</div>
          <div className="mt-1 text-2xl font-semibold">{fmtZar(outstanding)}</div>
        </Card>
        <Card>
          <div className="text-xs text-[rgba(var(--kx-fg),..55)]">Open Quotes / Paid Invoices</div>
          <div className="mt-1 text-2xl font-semibold">{openQuotes} / {paidInvoices}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Revenue trend</div>
              <div className="text-xs text-[rgba(var(--kx-fg),..55)]">Last {revenueByMonth.length} months</div>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-3 h-40">
            {revenueByMonth.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="w-full bg-white/25" style={{ height: `${Math.max(6, Math.round((m.value / maxRev) * 140))}px` }} />
                </div>
                <div className="text-[11px] text-[rgba(var(--kx-fg),..55)]">{m.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Invoice status</div>
          <div className="mt-3 space-y-2">
            {statusList.map(([s, c]) => (
              <div key={s} className="flex items-center justify-between text-sm">
                <span className="text-[rgba(var(--kx-fg),..70)]">{s}</span>
                <span className="font-semibold">{c}</span>
              </div>
            ))}
            {!statusList.length && <div className="text-sm text-[rgba(var(--kx-fg),..55)]">No invoices yet.</div>}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card>
          <div className="text-sm font-semibold">Top clients</div>
          <div className="mt-3 space-y-2">
            {topClients.map((c) => (
              <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">
                <span className="text-sm text-[rgba(var(--kx-fg),..80)]">{c.name}</span>
                <span className="text-sm font-semibold">{fmtZar(c.total)}</span>
              </Link>
            ))}
            {!topClients.length && <div className="text-sm text-[rgba(var(--kx-fg),..55)]">No clients yet.</div>}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Outstanding invoices</div>
              <div className="text-xs text-[rgba(var(--kx-fg),..55)]">Highest balances</div>
            </div>
            <Link href="/invoices" className="kx-button">View all</Link>
          </div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-[rgba(var(--kx-fg),..70)]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Invoice</th>
                  <th className="px-3 py-2 text-left font-semibold">Client</th>
                  <th className="px-3 py-2 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {outstandingList.map((i:any) => (
                  <tr key={i.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2">
                      <Link className="underline-offset-2 hover:underline" href={`/invoices/${i.id}`}>{i.number || 'Invoice'}</Link>
                    </td>
                    <td className="px-3 py-2 text-[rgba(var(--kx-fg),..70)]">{i.clients?.name || '—'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmtZar(Number(i.balance_due || 0))}</td>
                  </tr>
                ))}
                {!outstandingList.length && (
                  <tr><td className="px-3 py-3 text-sm text-[rgba(var(--kx-fg),..55)]" colSpan={3}>No outstanding invoices.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold">Recent activity</div>
        <div className="mt-3 space-y-2">
          {(activity || []).map((a:any) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-sm text-[rgba(var(--kx-fg),..80)]">{a.action} · <span className="text-[rgba(var(--kx-fg),..55)]">{a.entity_type}</span></div>
              <div className="text-xs text-[rgba(var(--kx-fg),..55)]">{String(a.created_at || '').slice(0, 19).replace('T', ' ')}</div>
            </div>
          ))}
          {(!activity || activity.length===0) && <div className="text-sm text-[rgba(var(--kx-fg),..55)]">No activity yet.</div>}
        </div>
      </Card>
    </div>
  )
}
