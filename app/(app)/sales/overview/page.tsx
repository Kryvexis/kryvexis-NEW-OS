import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { getCurrentUserRole } from '@/lib/roles'
import { redirect } from 'next/navigation'
import { Page as PageLayout } from '@/components/ui/page'

function monthKey(d: string) {
  return String(d || '').slice(0, 7) // YYYY-MM
}

export default async function SalesOverview() {
  const role = await getCurrentUserRole()
  if (role === 'cashier' || role === 'staff') {
    redirect('/sales/pos')
  }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: invoices }, { data: items }, { data: products }, { data: clients }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id,total,issue_date')
      .eq('company_id', companyId)
      .limit(5000),
    supabase
      .from('invoice_items')
      .select('description,qty,line_total')
      .limit(20000),
    supabase.from('products').select('id').eq('company_id', companyId).limit(1),
    supabase.from('clients').select('id').eq('company_id', companyId).limit(1),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const todayTotal = (invoices || [])
    .filter((i: any) => String(i.issue_date || '').slice(0, 10) === today)
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  // Past 6 months totals
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

  // Top/bottom items by sales total (line_total)
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

  return (
    <PageLayout title="Overview" subtitle="Today’s sales, the last 6 months, and what’s moving.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="kx-card p-5 md:col-span-1">
          <div className="text-xs text-kx-muted">Today</div>
          <div className="mt-2 text-3xl font-semibold text-kx-fg">{fmtZar(todayTotal)}</div>
          <div className="mt-1 text-xs text-kx-muted">Total invoices issued today.</div>
        </div>

        <div className="kx-card p-5 md:col-span-2">
          <div className="text-sm font-semibold text-kx-fg">Sales trend</div>
          <div className="mt-1 text-xs text-kx-muted">Past 6 months (invoiced total).</div>
          <div className="mt-4 grid grid-cols-6 gap-3 items-end">
            {trend.map((m) => {
              const h = Math.round((m.total / max) * 80) + 6
              const label = m.key.slice(5)
              return (
                <div key={m.key} className="text-center">
                  <div
                    className="mx-auto w-full max-w-[46px] rounded-xl bg-[rgba(var(--kx-fg),.06)] border border-[rgba(var(--kx-border),.18)]"
                    style={{ height: h }}
                  />
                  <div className="mt-2 text-[11px] text-kx-muted">{label}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="kx-card p-5 md:col-span-1">
          <div className="text-sm font-semibold text-kx-fg">Top 5 items</div>
          <div className="mt-3 space-y-2">
            {top5.length ? top5.map((x) => (
              <div key={x.name} className="flex items-center justify-between gap-3 text-sm">
                <div className="truncate text-kx-fg">{x.name}</div>
                <div className="text-kx-muted">{fmtZar(x.total)}</div>
              </div>
            )) : <div className="text-sm text-kx-muted">No items yet.</div>}
          </div>
        </div>

        <div className="kx-card p-5 md:col-span-2">
          <div className="text-sm font-semibold text-kx-fg">Bottom 5 items</div>
          <div className="mt-3 space-y-2">
            {bottom5.length ? bottom5.map((x) => (
              <div key={x.name} className="flex items-center justify-between gap-3 text-sm">
                <div className="truncate text-kx-fg">{x.name}</div>
                <div className="text-kx-muted">{fmtZar(x.total)}</div>
              </div>
            )) : <div className="text-sm text-kx-muted">No items yet.</div>}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
