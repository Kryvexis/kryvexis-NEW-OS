import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { getCurrentUserRole } from '@/lib/roles'
import { redirect } from 'next/navigation'
import { Page as PageLayout } from '@/components/ui/page'

function monthKey(d: string) {
  return String(d || '').slice(0, 7)
}

export default async function SalesOverview() {
  const role = await getCurrentUserRole()
  if (role === 'cashier' || role === 'staff') redirect('/sales/pos')

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: invoices }, { data: items }, { data: clients }] = await Promise.all([
    supabase.from('invoices').select('id,total,issue_date').eq('company_id', companyId).limit(5000),
    supabase.from('invoice_items').select('description,qty,line_total').limit(20000),
    supabase.from('clients').select('id').eq('company_id', companyId).limit(5000),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const todayInvoices = (invoices || []).filter((i: any) => String(i.issue_date || '').slice(0, 10) === today)
  const todayTotal = todayInvoices.reduce((a: number, i: any) => a + Number(i.total || 0), 0)
  const totalInvoices = (invoices || []).length
  const totalClients = (clients || []).length

  const months: { key: string; total: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const key = d.toISOString().slice(0, 7)
    months.push({ key, total: 0 })
  }
  const map = new Map(months.map((m) => [m.key, 0]))
  for (const inv of invoices || []) {
    const k = monthKey(inv.issue_date)
    if (map.has(k)) map.set(k, (map.get(k) || 0) + Number(inv.total || 0))
  }
  const trend = months.map((m) => ({ ...m, total: map.get(m.key) || 0 }))

  const itemTotals = new Map<string, number>()
  for (const it of items || []) {
    const name = String(it.description || '').trim() || 'Item'
    itemTotals.set(name, (itemTotals.get(name) || 0) + Number(it.line_total || 0))
  }
  const ranked = Array.from(itemTotals.entries()).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total)
  const top5 = ranked.slice(0, 5)
  const bottom5 = ranked.slice(-5).reverse()
  const max = Math.max(1, ...trend.map((t) => t.total))

  return (
    <PageLayout title="Sales Overview" subtitle="Today’s revenue, recent momentum, and your strongest and weakest movers.">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="kx-card p-5 md:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-kx-muted">Today revenue</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-kx-fg">{fmtZar(todayTotal)}</div>
          <div className="mt-2 text-sm text-kx-muted">Total value of invoices issued today.</div>
        </div>
        <div className="kx-card p-5 md:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-kx-muted">Invoices</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-kx-fg">{totalInvoices}</div>
          <div className="mt-2 text-sm text-kx-muted">Total invoices in this workspace.</div>
        </div>
        <div className="kx-card p-5 md:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-kx-muted">Active clients</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-kx-fg">{totalClients}</div>
          <div className="mt-2 text-sm text-kx-muted">Clients available for quoting and billing.</div>
        </div>
        <div className="kx-card p-5 md:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-kx-muted">Items tracked</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-kx-fg">{ranked.length}</div>
          <div className="mt-2 text-sm text-kx-muted">Distinct line items sold so far.</div>
        </div>

        <div className="kx-card p-5 md:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-kx-fg">6 month trend</div>
              <div className="mt-1 text-sm text-kx-muted">Monthly invoiced totals.</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-6 items-end gap-4">
            {trend.map((m) => {
              const h = Math.round((m.total / max) * 130) + 14
              return (
                <div key={m.key} className="flex flex-col items-center gap-2">
                  <div className="flex h-[150px] items-end">
                    <div className="w-10 rounded-2xl border border-[rgb(var(--kx-accent)/0.18)] bg-[linear-gradient(180deg,rgba(var(--kx-accent),0.92),rgba(var(--kx-accent-2),0.78))] shadow-[0_16px_36px_rgba(59,130,246,0.18)]" style={{ height: h }} />
                  </div>
                  <div className="text-[11px] text-kx-muted">{m.key.slice(5)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="kx-card p-5 md:col-span-2">
          <div className="text-lg font-semibold text-kx-fg">Top 5 items</div>
          <div className="mt-1 text-sm text-kx-muted">Your strongest movers by invoiced value.</div>
          <div className="mt-5 space-y-3">
            {top5.length ? top5.map((x, i) => (
              <div key={x.name} className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--kx-border),0.10)] bg-[rgba(255,255,255,0.7)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold" style={{ background: "rgb(var(--kx-accent) / 0.14)", color: "rgb(var(--kx-accent-2))" }}>{i + 1}</div>
                  <div className="truncate text-sm font-medium text-kx-fg">{x.name}</div>
                </div>
                <div className="text-sm text-kx-muted">{fmtZar(x.total)}</div>
              </div>
            )) : <div className="text-sm text-kx-muted">No items yet.</div>}
          </div>
        </div>

        <div className="kx-card p-5 md:col-span-4">
          <div className="text-lg font-semibold text-kx-fg">Bottom 5 items</div>
          <div className="mt-1 text-sm text-kx-muted">Products or services with the lowest invoiced value.</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bottom5.length ? bottom5.map((x) => (
              <div key={x.name} className="rounded-2xl border border-[rgba(var(--kx-border),0.10)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
                <div className="truncate text-sm font-medium text-kx-fg">{x.name}</div>
                <div className="mt-1 text-sm text-kx-muted">{fmtZar(x.total)}</div>
              </div>
            )) : <div className="text-sm text-kx-muted">No items yet.</div>}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
