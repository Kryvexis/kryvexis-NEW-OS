import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'

function fmtZar(v: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(v || 0)
}

function startOfTodayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map((x) => parseInt(x, 10))
  const dt = new Date(y, m - 1, 1)
  return dt.toLocaleString('en-ZA', { month: 'short' })
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function BarChart({ series }: { series: { key: string; total: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.total))
  return (
    <div className="mt-4">
      <div className="flex items-end gap-2 h-28">
        {series.map((s) => {
          const h = clamp((s.total / max) * 100, 3, 100)
          return (
            <div key={s.key} className="flex-1 min-w-[12px]">
              <div
                className="w-full rounded-xl"
                style={{
                  height: `${h}%`,
                  background:
                    'linear-gradient(180deg, rgba(var(--kx-accent), .95), rgba(var(--kx-accent-2), .65))',
                  boxShadow: '0 16px 42px rgba(0,0,0,.35)',
                }}
                title={`${monthLabel(s.key)} • ${fmtZar(s.total)}`}
              />
              <div className="mt-2 text-[11px] kx-muted text-center">{monthLabel(s.key)}</div>
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

  // 1) Daily sales (payments today preferred; fallback to invoices today)
  const todayIso = startOfTodayISO()

  const { data: payments } = await supabase
    .from('payments')
    .select('amount,created_at')
    .eq('company_id', companyId)
    .gte('created_at', todayIso)

  const dailyFromPayments = (payments ?? []).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)

  const { data: invoicesToday } = await supabase
    .from('invoices')
    .select('total,created_at')
    .eq('company_id', companyId)
    .gte('created_at', todayIso)

  const dailyFromInvoices = (invoicesToday ?? []).reduce((s: number, inv: any) => s + (Number(inv.total) || 0), 0)

  const dailySales = dailyFromPayments > 0 ? dailyFromPayments : dailyFromInvoices

  // 2) Monthly sales series (last 6 months)
  const since = new Date()
  since.setMonth(since.getMonth() - 6)
  since.setHours(0, 0, 0, 0)

  const { data: invoicesRecent } = await supabase
    .from('invoices')
    .select('total,created_at')
    .eq('company_id', companyId)
    .gte('created_at', since.toISOString())

  const map = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    map.set(monthKey(d), 0)
  }

  for (const inv of invoicesRecent ?? []) {
    const d = new Date((inv as any).created_at)
    const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1))
    if (map.has(key)) map.set(key, (map.get(key) || 0) + (Number((inv as any).total) || 0))
  }

  const series = Array.from(map.entries()).map(([key, total]) => ({ key, total }))

  // 3) Top 5 + bottom 5 items (by revenue) - last 90 days
  const itemsSince = new Date()
  itemsSince.setDate(itemsSince.getDate() - 90)
  itemsSince.setHours(0, 0, 0, 0)

  const { data: invoiceItems } = await supabase
    .from('invoice_items')
    .select('description,product_name,quantity,unit_price,created_at')
    .eq('company_id', companyId)
    .gte('created_at', itemsSince.toISOString())
    .limit(5000)

  const byItem = new Map<string, number>()
  for (const it of invoiceItems ?? []) {
    const name = (it as any).product_name || (it as any).description || 'Item'
    const qty = Number((it as any).quantity) || 0
    const price = Number((it as any).unit_price) || 0
    const rev = qty * price
    byItem.set(name, (byItem.get(name) || 0) + rev)
  }

  const ranked = Array.from(byItem.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  const top5 = ranked.slice(0, 5)
  const bottom5 = ranked.slice(-5).reverse()

  return (
    <div className="space-y-5">
      {/* Premium header */}
      <div
        className="kx-card relative overflow-hidden rounded-[28px] border border-white/10 p-6"
        style={{
          background:
            'linear-gradient(120deg, rgba(var(--kx-accent), .22), rgba(var(--kx-accent-2), .14), rgba(255,255,255,.03))',
          boxShadow: '0 26px 90px rgba(0,0,0,.35)',
        }}
      >
        <div className="text-[11px] uppercase tracking-wider kx-muted3">Today</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight text-kx-fg">Daily sales</div>
        <div className="mt-3 text-4xl font-semibold tracking-tight">{fmtZar(dailySales)}</div>
        <div className="mt-2 text-xs kx-muted">Based on payments today (fallback to invoices).</div>
      </div>

      {/* Monthly graph */}
      <div className="kx-card rounded-[28px] border border-white/10 p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider kx-muted3">Trend</div>
            <div className="mt-1 text-lg font-semibold tracking-tight">Past months sales</div>
            <div className="mt-1 text-xs kx-muted">Last 6 months (invoiced totals)</div>
          </div>
        </div>
        <BarChart series={series} />
      </div>

      {/* Top/Bottom items */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="kx-card rounded-[28px] border border-white/10 p-6">
          <div className="text-[11px] uppercase tracking-wider kx-muted3">Top</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">Top 5 items</div>
          <div className="mt-4 space-y-2">
            {top5.length ? (
              top5.map((it) => (
                <div key={it.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(var(--kx-fg),.03)] px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium tracking-tight">{it.name}</div>
                  </div>
                  <div className="text-sm font-semibold">{fmtZar(it.revenue)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm kx-muted">No sales items yet.</div>
            )}
          </div>
        </div>

        <div className="kx-card rounded-[28px] border border-white/10 p-6">
          <div className="text-[11px] uppercase tracking-wider kx-muted3">Bottom</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">Bottom 5 items</div>
          <div className="mt-4 space-y-2">
            {bottom5.length ? (
              bottom5.map((it) => (
                <div key={it.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(var(--kx-fg),.03)] px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium tracking-tight">{it.name}</div>
                  </div>
                  <div className="text-sm font-semibold">{fmtZar(it.revenue)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm kx-muted">No sales items yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
