import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { Card } from '@/components/card'

type MonthPoint = { key: string; label: string; total: number }

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function monthLabel(d: Date) {
  return d.toLocaleString('en-ZA', { month: 'short' })
}

function Bars({ points }: { points: MonthPoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.total))
  return (
    <div className="mt-3">
      <div className="grid grid-cols-6 gap-3 items-end">
        {points.map((p) => {
          const h = Math.max(6, Math.round((p.total / max) * 64))
          return (
            <div key={p.key} className="text-center">
              <div
                className="rounded-xl kx-softBorder"
                style={{
                  height: `${h}px`,
                  background:
                    'linear-gradient(135deg, rgba(var(--kx-accent),0.55), rgba(var(--kx-accent-2),0.35))',
                }}
                title={`${p.label}: ${fmtZar(p.total)}`}
              />
              <div className="mt-2 text-xs kx-muted">{p.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function SalesOverview() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  // Pull recent invoices + items so we can build an "enterprise SaaS" overview without placeholders.
  const since = new Date()
  since.setMonth(since.getMonth() - 6)

  const [{ data: invoices }, { data: items }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id,total,issue_date,status')
      .eq('company_id', companyId)
      .gte('issue_date', since.toISOString().slice(0, 10))
      .limit(5000),
    supabase
      .from('invoice_items')
      .select('description,qty,unit_price,invoice_id, invoices(issue_date, company_id)')
      .limit(20000),
  ])

  // Defensive filters (invoice_items select joins, but RLS may still return extra rows depending on policies).
  const safeInvoices = (invoices || []).filter((i: any) => i && i.issue_date)
  const invById = new Map<string, any>()
  for (const i of safeInvoices) invById.set(i.id, i)

  const today = new Date().toISOString().slice(0, 10)
  const dailyTotal = safeInvoices
    .filter((i: any) => String(i.issue_date).slice(0, 10) === today && String(i.status || '') !== 'Voided')
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  // Past 6 months totals
  const points: MonthPoint[] = []
  for (let k = 5; k >= 0; k--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - k)
    points.push({ key: monthKey(d), label: monthLabel(d), total: 0 })
  }
  const idx = new Map(points.map((p, i) => [p.key, i]))

  for (const i of safeInvoices) {
    const d = new Date(String(i.issue_date))
    const key = monthKey(d)
    const at = idx.get(key)
    if (at === undefined) continue
    if (String(i.status || '') === 'Voided') continue
    points[at].total += Number(i.total || 0)
  }

  // Top/Bottom items by revenue (qty * unit_price) in last 6 months
  const itemAgg = new Map<string, { desc: string; revenue: number; qty: number }>()
  for (const it of items || []) {
    const invId = (it as any).invoice_id
    const inv = invById.get(invId)
    if (!inv) continue
    const desc = String((it as any).description || '').trim() || 'Item'
    const qty = Number((it as any).qty || 0)
    const unit = Number((it as any).unit_price || 0)
    const revenue = qty * unit
    const cur = itemAgg.get(desc) || { desc, revenue: 0, qty: 0 }
    cur.revenue += revenue
    cur.qty += qty
    itemAgg.set(desc, cur)
  }
  const ranked = Array.from(itemAgg.values()).sort((a, b) => b.revenue - a.revenue)
  const top5 = ranked.slice(0, 5)
  const bottom5 = ranked.slice(-5).reverse()

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kx-h1">Overview</div>
          <div className="kx-sub">Daily sales + trends + product movement.</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="kx-cardTitle">Today</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(dailyTotal)}</div>
          <div className="mt-1 text-sm kx-muted">Total invoices issued today.</div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="kx-cardTitle">Sales trend</div>
          <div className="mt-1 text-sm kx-muted">Past 6 months (invoiced total).</div>
          <Bars points={points} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="kx-cardTitle">Top 5 items</div>
          <div className="mt-3 grid gap-2">
            {top5.length === 0 ? (
              <div className="kx-muted text-sm">No items yet.</div>
            ) : (
              top5.map((it) => (
                <div key={it.desc} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate">{it.desc}</div>
                    <div className="text-xs kx-muted">{Math.round(it.qty)} sold</div>
                  </div>
                  <div className="shrink-0 font-medium">{fmtZar(it.revenue)}</div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="kx-cardTitle">Bottom 5 items</div>
          <div className="mt-3 grid gap-2">
            {bottom5.length === 0 ? (
              <div className="kx-muted text-sm">No items yet.</div>
            ) : (
              bottom5.map((it) => (
                <div key={it.desc} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate">{it.desc}</div>
                    <div className="text-xs kx-muted">{Math.round(it.qty)} sold</div>
                  </div>
                  <div className="shrink-0 font-medium">{fmtZar(it.revenue)}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
