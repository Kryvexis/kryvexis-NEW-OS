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

  const [{ data: invoices }, { data: items }, { data: products }, { data: clients }] = await Promise.all([
    supabase.from('invoices').select('id,total,issue_date').eq('company_id', companyId).limit(5000),
    supabase.from('invoice_items').select('description,qty,line_total').limit(20000),
    supabase.from('products').select('id').eq('company_id', companyId).limit(1),
    supabase.from('clients').select('id').eq('company_id', companyId).limit(1),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const todayInvoices = (invoices || []).filter((i: any) => String(i.issue_date || '').slice(0, 10) === today)
  const todayTotal = todayInvoices.reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  const months: { key: string; total: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const key = d.toISOString().slice(0, 7)
    months.push({ key, total: 0 })
  }
  const map = new Map(months.map((m) => [m.key, 0]))
  for (const inv of invoices || []) {
    const k = monthKey((inv as any).issue_date)
    if (map.has(k)) map.set(k, (map.get(k) || 0) + Number((inv as any).total || 0))
  }
  const trend = months.map((m) => ({ ...m, total: map.get(m.key) || 0 }))

  const itemTotals = new Map<string, number>()
  for (const it of items || []) {
    const name = String((it as any).description || '').trim() || 'Item'
    itemTotals.set(name, (itemTotals.get(name) || 0) + Number((it as any).line_total || 0))
  }
  const ranked = Array.from(itemTotals.entries()).map(([name, total]) => ({ name, total }))
  ranked.sort((a, b) => b.total - a.total)
  const top5 = ranked.slice(0, 5)
  const bottom5 = ranked.slice(-5).reverse()

  const monthMax = Math.max(1, ...trend.map((t) => t.total))
  const priorTotal = trend.slice(0, -1).at(-1)?.total || 0
  const currentMonthTotal = trend.at(-1)?.total || 0
  const growthPct = priorTotal > 0 ? Math.round(((currentMonthTotal - priorTotal) / priorTotal) * 100) : 0
  const hasProducts = (products || []).length > 0
  const hasClients = (clients || []).length > 0

  return (
    <PageLayout title="Sales Overview" subtitle="A cleaner pulse on revenue, momentum, and what is moving through the business." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="kx-stat-card">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Today revenue</div>
          <div className="mt-3 text-3xl font-semibold text-kx-fg">{fmtZar(todayTotal)}</div>
          <div className="mt-2 text-sm kx-muted">{todayInvoices.length} invoice{todayInvoices.length === 1 ? '' : 's'} issued today.</div>
        </div>
        <div className="kx-stat-card">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">This month</div>
          <div className="mt-3 text-3xl font-semibold text-kx-fg">{fmtZar(currentMonthTotal)}</div>
          <div className="mt-2 text-sm" style={{ color: growthPct >= 0 ? 'rgb(var(--kx-success))' : 'rgb(var(--kx-danger))' }}>
            {growthPct >= 0 ? '+' : ''}{growthPct}% vs last month
          </div>
        </div>
        <div className="kx-stat-card">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Catalog status</div>
          <div className="mt-3 text-3xl font-semibold text-kx-fg">{hasProducts ? 'Live' : 'Empty'}</div>
          <div className="mt-2 text-sm kx-muted">{hasProducts ? 'Products are ready to sell.' : 'Add products to unlock richer reporting.'}</div>
        </div>
        <div className="kx-stat-card">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Client base</div>
          <div className="mt-3 text-3xl font-semibold text-kx-fg">{hasClients ? 'Active' : 'Starting'}</div>
          <div className="mt-2 text-sm kx-muted">{hasClients ? 'Client records are available for sales flows.' : 'Create clients to track relationship revenue.'}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="kx-card p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-kx-fg">Revenue trend</div>
              <div className="mt-1 text-sm kx-muted">Past 6 months invoiced total.</div>
            </div>
            <span className="kx-badge">6 month view</span>
          </div>
          <div className="mt-6 grid grid-cols-6 items-end gap-3">
            {trend.map((m, index) => {
              const h = Math.round((m.total / monthMax) * 150) + 14
              const label = m.key.slice(5)
              const active = index === trend.length - 1
              return (
                <div key={m.key} className="text-center">
                  <div className="mx-auto flex h-[180px] w-full max-w-[58px] items-end rounded-[22px] bg-[rgba(var(--kx-border),.08)] p-1.5">
                    <div
                      className="w-full rounded-[18px]"
                      style={{
                        height: h,
                        background: active
                          ? 'linear-gradient(180deg, rgb(var(--kx-accent)), rgb(var(--kx-accent-2)))'
                          : 'linear-gradient(180deg, rgb(var(--kx-accent) / 0.34), rgb(var(--kx-accent-2) / 0.18))',
                      }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] font-medium kx-muted">{label}</div>
                  <div className="mt-1 text-[11px] text-kx-fg/70">{fmtZar(m.total)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="kx-card p-5 md:p-6">
          <div className="text-sm font-semibold text-kx-fg">Momentum snapshot</div>
          <div className="mt-4 space-y-4">
            <div className="rounded-[22px] bg-[rgba(var(--kx-accent),.08)] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--kx-accent-2))]">Current month</div>
              <div className="mt-2 text-2xl font-semibold text-kx-fg">{fmtZar(currentMonthTotal)}</div>
              <div className="mt-1 text-sm kx-muted">Keep this pace to close the month strongly.</div>
            </div>
            <div className="rounded-[22px] border border-[rgba(var(--kx-border),.12)] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] kx-muted2">Best seller set</div>
              <div className="mt-2 text-sm text-kx-fg">{top5[0]?.name || 'No item data yet'}</div>
              <div className="mt-1 text-sm kx-muted">{top5[0] ? `${fmtZar(top5[0].total)} in tracked sales` : 'Add invoice items to populate this section.'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="kx-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-kx-fg">Top 5 items</div>
            <span className="kx-badge">Best performers</span>
          </div>
          <div className="mt-4 space-y-3">
            {top5.length ? top5.map((x, idx) => (
              <div key={x.name} className="flex items-center justify-between gap-3 rounded-[20px] border border-[rgba(var(--kx-border),.10)] bg-[rgba(var(--kx-surface-2),.68)] px-4 py-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[rgb(var(--kx-accent)/0.10)] text-[rgb(var(--kx-accent-2))] font-semibold">{idx + 1}</div>
                  <div className="truncate font-medium text-kx-fg">{x.name}</div>
                </div>
                <div className="text-kx-muted">{fmtZar(x.total)}</div>
              </div>
            )) : <div className="text-sm kx-muted">No items yet.</div>}
          </div>
        </div>

        <div className="kx-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-kx-fg">Bottom 5 items</div>
            <span className="kx-badge">Needs attention</span>
          </div>
          <div className="mt-4 space-y-3">
            {bottom5.length ? bottom5.map((x) => (
              <div key={x.name} className="flex items-center justify-between gap-3 rounded-[20px] border border-[rgba(var(--kx-border),.10)] bg-[rgba(var(--kx-surface-2),.68)] px-4 py-3 text-sm">
                <div className="truncate font-medium text-kx-fg">{x.name}</div>
                <div className="text-kx-muted">{fmtZar(x.total)}</div>
              </div>
            )) : <div className="text-sm kx-muted">No items yet.</div>}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
