import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { ChevronRight } from 'lucide-react'

function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

function sum(xs: any[], key: string) {
  return xs.reduce((a, x) => a + Number(x?.[key] || 0), 0)
}

export default async function MobileHome() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const today = new Date()
  const todayKey = iso(today)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  const weekStartKey = iso(weekStart)

  const monthKey = todayKey.slice(0, 7)

  const [{ data: invoices }, { data: products }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id,total,balance_due,status,issue_date,due_date, clients(name)')
      .eq('company_id', companyId)
      .limit(5000),
    supabase
      .from('products')
      .select('id,name,type,stock_on_hand,low_stock_threshold,is_active')
      .eq('company_id', companyId)
      .limit(5000),
  ])

  const inv = invoices || []
  const prods = (products || []).filter((p: any) => p.type === 'product' && p.is_active !== false)

  const salesToday = inv
    .filter((i: any) => String(i.issue_date || '').slice(0, 10) === todayKey)
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  const salesWeek = inv
    .filter((i: any) => {
      const d = String(i.issue_date || '').slice(0, 10)
      return d >= weekStartKey && d <= todayKey
    })
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  const salesMonth = inv
    .filter((i: any) => String(i.issue_date || '').slice(0, 7) === monthKey)
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  const owed = inv
    .filter((i: any) => Number(i.balance_due || 0) > 0 && !['Paid', 'Void', 'Draft'].includes(String(i.status || '')))
    .reduce((a: number, i: any) => a + Number(i.balance_due || 0), 0)

  const unpaidCount = inv.filter((i: any) => Number(i.balance_due || 0) > 0 && !['Paid', 'Void'].includes(String(i.status || ''))).length
  const overdueCount = inv.filter((i: any) => {
    const due = String(i.due_date || '').slice(0, 10)
    return due && due < todayKey && Number(i.balance_due || 0) > 0 && !['Paid', 'Void'].includes(String(i.status || ''))
  }).length

  const low = prods.filter((p: any) => Number(p.stock_on_hand || 0) <= Number(p.low_stock_threshold || 0))
  const out = prods.filter((p: any) => Number(p.stock_on_hand || 0) <= 0)
  const lowTop = low.slice(0, 3)

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] kx-muted">Home</div>
          <div className="kx-h1">Overview</div>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-float)] grid place-items-center">
          <span className="text-xs font-semibold">KX</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Kpi label="Sales Today" value={fmtZar(salesToday)} tone="good" />
        <Kpi label="This Week" value={fmtZar(salesWeek)} tone="brand" />
        <Kpi label="This Month" value={fmtZar(salesMonth)} />
        <Kpi label="Owed" value={fmtZar(owed)} tone="bad" />
      </div>

      {/* Stock overview */}
      <Section
        title="Stock Overview"
        right={<Link className="kx-muted text-sm" href="/m/buyers">See all</Link>}
      >
        <Link
          href="/m/buyers"
          className="block rounded-3xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-card)] p-4"
          style={{ border: '1px solid rgb(var(--kx-border) / 0.06)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Low Stock: {low.length}</div>
              <div className="mt-2 h-2 w-full max-w-[220px] rounded-full bg-black/5 overflow-hidden">
                <div className="h-full rounded-full bg-[rgb(var(--kx-accent))]" style={{ width: `${Math.min(100, (low.length / Math.max(1, prods.length)) * 100)}%` }} />
              </div>
              <div className="mt-2 text-xs kx-muted">Out of stock: {out.length}</div>
            </div>
            <ChevronRight className="h-5 w-5 kx-muted" />
          </div>

          <div className="mt-4 space-y-2">
            {lowTop.length === 0 ? (
              <div className="text-sm kx-muted">All good 🎉</div>
            ) : (
              lowTop.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl bg-black/5 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs kx-muted">Only {Number(p.stock_on_hand || 0)} left</div>
                  </div>
                  <span className="text-xs font-semibold text-[rgb(var(--kx-accent))]">Restock</span>
                </div>
              ))
            )}
          </div>
        </Link>
      </Section>

      {/* Alerts */}
      <Section title="Alerts">
        <div className="rounded-3xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-card)]"
          style={{ border: '1px solid rgb(var(--kx-border) / 0.06)' }}>
          <AlertRow href="/sales/invoices" label="Unpaid Invoices" value={String(unpaidCount)} />
          <Divider />
          <AlertRow href="/m/buyers" label="Items Low in Stock" value={String(low.length)} />
          <Divider />
          <AlertRow href="/sales/invoices" label="Overdue Invoices" value={String(overdueCount)} />
        </div>
      </Section>

      {/* Primary action (also accessible via + FAB) */}
      <div className="mt-6">
        <Link
          href="/sales/pos"
          className="block w-full rounded-3xl bg-[rgb(var(--kx-accent))] text-white text-center font-semibold py-4 shadow-[var(--kx-shadow-float)]"
        >
          + New Sale
        </Link>
      </div>

      <div className="h-10" />
    </div>
  )
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'brand' }) {
  const color =
    tone === 'good'
      ? 'text-emerald-600'
      : tone === 'bad'
        ? 'text-rose-600'
        : tone === 'brand'
          ? 'text-[rgb(var(--kx-accent))]'
          : 'text-[rgb(var(--kx-fg))]'
  return (
    <div
      className="rounded-3xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-card)] p-4"
      style={{ border: '1px solid rgb(var(--kx-border) / 0.06)' }}
    >
      <div className="text-xs kx-muted">{label}</div>
      <div className={`mt-2 text-xl font-semibold ${color}`}>{value}</div>
    </div>
  )
}

function Section({ title, right, children }: { title: string; right?: any; children: any }) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        {right}
      </div>
      {children}
    </div>
  )
}

function AlertRow({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3">
      <div className="text-sm">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{value}</span>
        <ChevronRight className="h-4 w-4 kx-muted" />
      </div>
    </Link>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgb(var(--kx-border) / 0.06)' }} />
}
