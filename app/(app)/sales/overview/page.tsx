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
  if (role === 'cashier' || role === 'staff') {
    redirect('/sales/pos')
  }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: invoices }, { data: items }, { data: products }, { data: clients }] = await Promise.all([
    supabase.from('invoices').select('id,total,issue_date').eq('company_id', companyId).limit(5000),
    supabase.from('invoice_items').select('description,qty,line_total').limit(20000),
    supabase.from('products').select('id').eq('company_id', companyId).limit(1),
    supabase.from('clients').select('id').eq('company_id', companyId).limit(1),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const todayInvoices = (invoices || []).filter((i: any) => String(i.issue_date || '').slice(0, 10) === today)
  const todayTotal = todayInvoices.reduce((a: number, i: any) => a + Number(i.total || 0), 0)
  const invoiceCount = (invoices || []).length

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

  const ranked = Array.from(itemTotals.entries()).map(([name, total]) => ({ name, total }))
  ranked.sort((a, b) => b.total - a.total)
  const top5 = ranked.slice(0, 5)
  const bottom5 = ranked.slice(-5).reverse()

  const max = Math.max(1, ...trend.map((t) => t.total))
  const hasProducts = (products || []).length > 0
  const hasClients = (clients || []).length > 0
  const totalRevenue = (invoices || []).reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0)
  const avgInvoice = invoiceCount ? totalRevenue / invoiceCount : 0
  const bestMonth = [...trend].sort((a, b) => b.total - a.total)[0]

  return (
    <PageLayout
      title="Overview"
      subtitle="Track revenue, invoice flow, and product movement from one polished command view."
      right={<span className="kx-badge">Live sales pulse</span>}
    >
      <section className="kx-card kx-gradient-card overflow-hidden p-6 md:p-7">
        <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-kx-muted">Today</div>
            <div className="mt-3 kx-stat-value">{fmtZar(todayTotal)}</div>
            <div className="mt-2 max-w-2xl text-sm text-kx-muted">
              {todayInvoices.length} invoice{todayInvoices.length === 1 ? '' : 's'} issued today, with a smoother layout tuned for faster scanning.
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="kx-badge">{invoiceCount} total invoices</span>
              <span className="kx-badge">Avg {fmtZar(avgInvoice)}</span>
              <span className="kx-badge">Best month {bestMonth?.key ?? '—'}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-kx bg-white/70 p-4 backdrop-blur-sm">
              <div className="text-xs text-kx-muted">Products loaded</div>
              <div className="mt-2 text-2xl font-semibold text-kx-fg">{hasProducts ? 'Yes' : 'No'}</div>
              <div className="mt-1 text-xs text-kx-muted">Catalog ready for selling.</div>
            </div>
            <div className="rounded-[20px] border border-kx bg-white/70 p-4 backdrop-blur-sm">
              <div className="text-xs text-kx-muted">Clients loaded</div>
              <div className="mt-2 text-2xl font-semibold text-kx-fg">{hasClients ? 'Yes' : 'No'}</div>
              <div className="mt-1 text-xs text-kx-muted">Relationships ready for quotes.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="kx-card p-5">
          <div className="text-xs text-kx-muted">Total revenue</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-kx-fg">{fmtZar(totalRevenue)}</div>
          <div className="mt-2 text-xs text-kx-muted">Across all invoices in the current workspace.</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-kx-muted">Average invoice</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-kx-fg">{fmtZar(avgInvoice)}</div>
          <div className="mt-2 text-xs text-kx-muted">Useful for pricing and sales consistency.</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-kx-muted">Best month</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-kx-fg">{bestMonth?.key ?? '—'}</div>
          <div className="mt-2 text-xs text-kx-muted">Highest invoiced total in the last six months.</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-kx-muted">Today’s invoices</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-kx-fg">{todayInvoices.length}</div>
          <div className="mt-2 text-xs text-kx-muted">How active the desk is right now.</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="kx-card p-5 md:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-kx-fg">Sales trend</div>
              <div className="mt-1 text-xs text-kx-muted">Past 6 months, scaled for quick comparison.</div>
            </div>
            <span className="kx-badge">Monthly</span>
          </div>

          <div className="mt-6 grid grid-cols-6 items-end gap-3 md:gap-4">
            {trend.map((m) => {
              const h = Math.round((m.total / max) * 180) + 14
              const label = m.key.slice(5)
              return (
                <div key={m.key} className="text-center">
                  <div className="flex min-h-[210px] items-end justify-center">
                    <div
                      className="w-full max-w-[64px] rounded-[18px] border border-[rgba(var(--kx-accent),0.12)] bg-gradient-to-t from-[rgb(var(--kx-accent))] to-[rgb(var(--kx-accent-2))] shadow-[0_18px_40px_rgba(79,70,229,0.20)]"
                      style={{ height: h }}
                      title={`${m.key}: ${fmtZar(m.total)}`}
                    />
                  </div>
                  <div className="mt-3 text-[11px] font-medium text-kx-muted">{label}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="kx-card p-5 md:p-6">
          <div className="text-sm font-semibold text-kx-fg">Movement snapshot</div>
          <div className="mt-1 text-xs text-kx-muted">Top performers vs slower movers.</div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-kx-muted">Top 5 items</div>
              <div className="space-y-2">
                {top5.length ? top5.map((x, index) => (
                  <div key={x.name} className="flex items-center justify-between gap-3 rounded-2xl border border-kx bg-kx-surface2 px-3 py-3 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--kx-accent)_/_0.12)] text-xs font-semibold text-[rgb(var(--kx-accent))]">{index + 1}</span>
                      <div className="truncate text-kx-fg">{x.name}</div>
                    </div>
                    <div className="text-kx-muted">{fmtZar(x.total)}</div>
                  </div>
                )) : <div className="text-sm text-kx-muted">No items yet.</div>}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-kx-muted">Bottom 5 items</div>
              <div className="space-y-2">
                {bottom5.length ? bottom5.map((x) => (
                  <div key={x.name} className="flex items-center justify-between gap-3 rounded-2xl border border-kx bg-kx-surface2 px-3 py-3 text-sm">
                    <div className="truncate text-kx-fg">{x.name}</div>
                    <div className="text-kx-muted">{fmtZar(x.total)}</div>
                  </div>
                )) : <div className="text-sm text-kx-muted">No items yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
