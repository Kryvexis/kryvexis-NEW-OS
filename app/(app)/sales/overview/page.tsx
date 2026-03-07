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

  const [{ data: invoices }, { data: items }] = await Promise.all([
    supabase.from('invoices').select('id,total,issue_date').eq('company_id', companyId).limit(5000),
    supabase.from('invoice_items').select('description,line_total').limit(20000),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const todayTotal = (invoices || [])
    .filter((i: any) => String(i.issue_date || '').slice(0, 10) === today)
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  const months: { key: string; total: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    months.push({ key: d.toISOString().slice(0, 7), total: 0 })
  }

  const totals = new Map<string, number>(months.map((m) => [m.key, 0]))
  for (const inv of invoices || []) {
    const key = monthKey(inv.issue_date)
    if (totals.has(key)) totals.set(key, (totals.get(key) || 0) + Number(inv.total || 0))
  }
  const trend = months.map((m) => ({ key: m.key, total: totals.get(m.key) || 0 }))
  const max = Math.max(1, ...trend.map((m) => m.total))

  const itemTotals = new Map<string, number>()
  for (const item of items || []) {
    const name = String(item.description || '').trim() || 'Item'
    itemTotals.set(name, (itemTotals.get(name) || 0) + Number(item.line_total || 0))
  }
  const ranked = Array.from(itemTotals.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)

  const topFive = ranked.slice(0, 5)
  const bottomFive = ranked.slice(-5).reverse()

  return (
    <PageLayout
      title="Sales Overview"
      subtitle="Today’s revenue, recent momentum, and your strongest and weakest movers."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <section className="kx-card p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-kx-muted">Today revenue</div>
          <div className="mt-3 text-3xl font-semibold text-kx-fg">{fmtZar(todayTotal)}</div>
          <div className="mt-2 text-sm text-kx-muted">Total value of invoices issued today.</div>
        </section>

        <section className="kx-card p-5 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-kx-fg">6 month trend</div>
              <div className="mt-1 text-xs text-kx-muted">Monthly invoiced totals.</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-6 items-end gap-3">
            {trend.map((month) => {
              const height = Math.round((month.total / max) * 96) + 10
              const label = month.key.slice(5)
              return (
                <div key={month.key} className="text-center">
                  <div
                    className="mx-auto w-full max-w-[48px] rounded-xl border border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-fg),.06)]"
                    style={{ height }}
                  />
                  <div className="mt-2 text-[11px] text-kx-muted">{label}</div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="kx-card p-5">
          <div className="text-sm font-semibold text-kx-fg">Top 5 items</div>
          <div className="mt-3 space-y-2">
            {topFive.length ? (
              topFive.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="truncate text-kx-fg">{entry.name}</div>
                  <div className="text-kx-muted">{fmtZar(entry.total)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-kx-muted">No items yet.</div>
            )}
          </div>
        </section>

        <section className="kx-card p-5 md:col-span-2">
          <div className="text-sm font-semibold text-kx-fg">Bottom 5 items</div>
          <div className="mt-3 space-y-2">
            {bottomFive.length ? (
              bottomFive.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="truncate text-kx-fg">{entry.name}</div>
                  <div className="text-kx-muted">{fmtZar(entry.total)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-kx-muted">No items yet.</div>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
