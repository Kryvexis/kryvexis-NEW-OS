import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { QuickStart } from '@/components/quickstart'
import { recommendOrderQty } from '@/lib/buyers/recommend'

type ProductRow = {
  id: string
  name: string
  sku: string | null
  stock_on_hand: number | null
  low_stock_threshold: number | null
}

type InvoiceRow = {
  id: string
  total: number | null
  issue_date: string | null
  due_date: string | null
  status: string | null
  client_id: string | null
  balance_due: number | null
  client_name?: string
}

function monthKey(d: string) {
  return String(d || '').slice(0, 7) // YYYY-MM
}

export default async function SalesOverview() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: invoices }, { data: items }, { data: products }, { data: clients }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id,total,issue_date,due_date,status,client_id,balance_due, clients(name)')
      .eq('company_id', companyId)
      .limit(5000),
    supabase
      .from('invoice_items')
      .select('description,qty,line_total,product_id,created_at')
      .limit(20000),
    supabase
      .from('products')
      .select('id,name,sku,stock_on_hand,low_stock_threshold,is_active')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(2500),
    supabase.from('clients').select('id').eq('company_id', companyId).limit(1),
  ])

  const today = new Date().toISOString().slice(0, 10)

  const inv: InvoiceRow[] = ((invoices || []) as any[]).map((x) => ({
    id: x.id,
    total: x.total,
    issue_date: x.issue_date,
    due_date: x.due_date,
    status: x.status,
    client_id: x.client_id,
    balance_due: x.balance_due,
    client_name: x?.clients?.name ?? '',
  }))

  const prod = (products || []) as unknown as ProductRow[]

  const todayTotal = inv
    .filter((i) => String(i.issue_date || '').slice(0, 10) === today)
    .reduce((a, i) => a + Number(i.total || 0), 0)

  const ym = today.slice(0, 7)
  const monthTotal = inv
    .filter((i) => String(i.issue_date || '').slice(0, 7) === ym)
    .reduce((a, i) => a + Number(i.total || 0), 0)

  const unpaid = inv.filter((i) => !['paid', 'void'].includes(String(i.status || 'unpaid').toLowerCase()))
  const overdue = unpaid.filter((i) => {
    const due = String(i.due_date || '').slice(0, 10)
    return Boolean(due) && due < today
  })

  const lowStock = prod.filter((p) => Number(p.stock_on_hand || 0) <= Number(p.low_stock_threshold || 0))

  // Top seller by invoiced value (line_total)
  const itemTotals = new Map<string, { total: number; qty: number }>()
  for (const it of (items || []) as any[]) {
    const name = String(it.description || '').trim() || 'Item'
    const cur = itemTotals.get(name) || { total: 0, qty: 0 }
    itemTotals.set(name, { total: cur.total + Number(it.line_total || 0), qty: cur.qty + Number(it.qty || 0) })
  }
  const ranked = Array.from(itemTotals.entries()).map(([name, v]) => ({ name, total: v.total, qty: v.qty }))
  ranked.sort((a, b) => b.total - a.total)
  const topSeller = ranked[0]

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

  const top5 = ranked.slice(0, 5)
  const bottom5 = ranked.slice(-5).reverse()

  const max = Math.max(1, ...trend.map((t) => t.total))
  const hasProducts = (prod || []).length > 0
  const hasClients = (clients || []).length > 0

  // Restock suggestion based on 14-day velocity
  const since = Date.now() - 14 * 864e5
  const sold14 = new Map<string, number>()
  for (const row of (items || []) as any[]) {
    const pid = row.product_id
    if (!pid) continue
    const t = Date.parse(row.created_at || '')
    if (!Number.isFinite(t) || t < since) continue
    sold14.set(pid, (sold14.get(pid) || 0) + Number(row.qty || 0))
  }
  const restockCandidates = [...lowStock]
    .sort((a, b) => Number(a.stock_on_hand || 0) - Number(b.stock_on_hand || 0))
    .slice(0, 6)
    .map((p) => {
      const rec = recommendOrderQty({
        product: p,
        sales: { product_id: p.id, qty: sold14.get(p.id) || 0, days: 14 },
        leadTimeDays: 4,
        safetyDays: 2,
      })
      return { p, rec }
    })

  // At-risk clients (no invoice in 30 days)
  const lastByClient = new Map<string, string>()
  for (const i of inv) {
    const cid = i.client_id
    const d = String(i.issue_date || '').slice(0, 10)
    if (!cid || !d) continue
    const cur = lastByClient.get(cid)
    if (!cur || d > cur) lastByClient.set(cid, d)
  }
  const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
  const atRiskRows = Array.from(lastByClient.entries())
    .filter(([, last]) => last && last <= cutoff)
    .slice(0, 24)
    .map(([client_id, last]) => {
      const name = inv.find((x) => x.client_id === client_id)?.client_name || 'Client'
      return { client_id, client_name: name, last }
    })
    .sort((a, b) => (a.last < b.last ? -1 : 1))
    .slice(0, 4)

  return (
    <PosHeroShell title="Dashboard" subtitle="Simple on the surface. Smart underneath.">
      <QuickStart hasProducts={hasProducts} hasClients={hasClients} />

      {/* KPI row */}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="kx-card p-5">
          <div className="text-xs kx-muted">Revenue</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{fmtZar(monthTotal)}</div>
          <div className="mt-1 text-xs kx-muted2">This month</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs kx-muted">Low stock</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{lowStock.length}</div>
          <div className="mt-1 text-xs kx-muted2">Items need restock</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs kx-muted">Unpaid invoices</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{unpaid.length}</div>
          <div className="mt-1 text-xs kx-muted2">{overdue.length} past due</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs kx-muted">Top seller</div>
          <div className="mt-1 truncate text-2xl font-semibold tracking-tight">{topSeller?.name || '—'}</div>
          <div className="mt-1 text-xs kx-muted2">{topSeller ? `${topSeller.qty} sold` : 'No sales yet'}</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* Insights */}
        <div className="kx-card p-5 lg:col-span-5">
          <div className="text-sm font-semibold">Intelligent insights</div>
          <div className="mt-1 text-xs kx-muted2">Quick actions to keep you ahead.</div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between gap-3 rounded-kx border bg-kx-surface2 px-4 py-3" style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}>
              <div className="min-w-0">
                <div className="text-sm font-medium">{overdue.length} overdue invoices</div>
                <div className="text-xs kx-muted2">Follow up to improve cashflow.</div>
              </div>
              <div className="kx-chip">Payments</div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-kx border bg-kx-surface2 px-4 py-3" style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}>
              <div className="min-w-0">
                <div className="text-sm font-medium">{lowStock.length} items low in stock</div>
                <div className="text-xs kx-muted2">Avoid stock-outs with quick reorder.</div>
              </div>
              <div className="kx-chip">Stock</div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-kx border bg-kx-surface2 px-4 py-3" style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}>
              <div className="min-w-0">
                <div className="text-sm font-medium">{atRiskRows.length} clients at risk</div>
                <div className="text-xs kx-muted2">No orders in 30+ days.</div>
              </div>
              <div className="kx-chip">Clients</div>
            </div>
          </div>
        </div>

        {/* Sales performance */}
        <div className="kx-card p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Sales performance</div>
              <div className="mt-1 text-xs kx-muted2">Past 6 months (invoiced total).</div>
            </div>
            <div className="kx-chip">This month: {fmtZar(monthTotal)}</div>
          </div>
          <div className="mt-4 grid grid-cols-6 items-end gap-3">
            {trend.map((m) => {
              const h = Math.round((m.total / max) * 88) + 8
              const label = m.key.slice(5)
              return (
                <div key={m.key} className="text-center">
                  <div
                    className="mx-auto w-full max-w-[52px] rounded-xl border bg-white/[0.06]"
                    style={{ height: h, borderColor: 'rgb(var(--kx-border) / 0.14)' }}
                    title={`${m.key}: ${fmtZar(m.total)}`}
                  />
                  <div className="mt-2 text-[11px] kx-muted2">{label}</div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            <div className="rounded-kx border bg-kx-surface2 p-4" style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}>
              <div className="text-xs kx-muted2">Today</div>
              <div className="mt-1 text-lg font-semibold">{fmtZar(todayTotal)}</div>
            </div>
            <div className="rounded-kx border bg-kx-surface2 p-4" style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}>
              <div className="text-xs kx-muted2">Top product</div>
              <div className="mt-1 truncate text-lg font-semibold">{topSeller?.name || '—'}</div>
            </div>
          </div>
        </div>

        {/* Restock prediction */}
        <div className="kx-card p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Restock prediction</div>
              <div className="mt-1 text-xs kx-muted2">Suggested order quantities based on 14-day velocity.</div>
            </div>
            <div className="kx-chip">Lead time 4d</div>
          </div>

          <div className="mt-4 space-y-2">
            {restockCandidates.length ? (
              restockCandidates.map(({ p, rec }) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-kx border bg-kx-surface2 px-4 py-3"
                  style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs kx-muted2">
                      On hand: <b>{Number(p.stock_on_hand || 0)}</b> · Reorder: {Number(p.low_stock_threshold || 0)} · 14d sold: {sold14.get(p.id) || 0}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs kx-muted2">Suggest</div>
                    <div className="text-base font-semibold" style={{ color: 'rgb(var(--kx-accent) / 0.95)' }}>
                      {rec.suggestedQty}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-kx border bg-kx-surface2 px-4 py-6 text-sm kx-muted2" style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}>
                Nothing low in stock right now 🎉
              </div>
            )}
          </div>
        </div>

        {/* Client alerts */}
        <div className="kx-card p-5 lg:col-span-5">
          <div className="text-sm font-semibold">Client alerts</div>
          <div className="mt-1 text-xs kx-muted2">Follow-ups that protect revenue.</div>
          <div className="mt-4 space-y-2">
            {atRiskRows.length ? (
              atRiskRows.map((c) => (
                <div
                  key={c.client_id}
                  className="flex items-center justify-between gap-3 rounded-kx border bg-kx-surface2 px-4 py-3"
                  style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.client_name}</div>
                    <div className="text-xs kx-muted2">Follow up · last order {c.last}</div>
                  </div>
                  <div className="kx-chip">At risk</div>
                </div>
              ))
            ) : (
              <div className="rounded-kx border bg-kx-surface2 px-4 py-6 text-sm kx-muted2" style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}>
                No at-risk clients detected.
              </div>
            )}

            {overdue.slice(0, 3).map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-3 rounded-kx border bg-kx-surface2 px-4 py-3"
                style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{i.client_name || 'Invoice'} overdue</div>
                  <div className="text-xs kx-muted2">
                    Due {String(i.due_date || '').slice(0, 10) || '—'} · Balance {fmtZar(Number(i.balance_due ?? i.total ?? 0))}
                  </div>
                </div>
                <div className="kx-chip">Overdue</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top/Bottom items (compact) */}
        <div className="kx-card p-5 lg:col-span-6">
          <div className="text-sm font-semibold">Top items</div>
          <div className="mt-3 space-y-2">
            {top5.length ? (
              top5.map((x) => (
                <div key={x.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="truncate">{x.name}</div>
                  <div className="kx-muted2">{fmtZar(x.total)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm kx-muted2">No items yet.</div>
            )}
          </div>
        </div>

        <div className="kx-card p-5 lg:col-span-6">
          <div className="text-sm font-semibold">Bottom items</div>
          <div className="mt-3 space-y-2">
            {bottom5.length ? (
              bottom5.map((x) => (
                <div key={x.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="truncate">{x.name}</div>
                  <div className="kx-muted2">{fmtZar(x.total)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm kx-muted2">No items yet.</div>
            )}
          </div>
        </div>
      </div>
    </PosHeroShell>
  )
}
