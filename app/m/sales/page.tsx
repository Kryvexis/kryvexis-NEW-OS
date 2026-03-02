import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { ChevronRight } from 'lucide-react'

function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function MobileSales() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const today = new Date()
  const todayKey = iso(today)
  const monthKey = todayKey.slice(0, 7)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  const weekStartKey = iso(weekStart)

  const [{ data: invoices }, { data: clients }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id,total,balance_due,status,issue_date,due_date')
      .eq('company_id', companyId)
      .limit(5000),
    supabase.from('clients').select('id').eq('company_id', companyId).limit(5000),
  ])

  const inv = invoices || []
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

  const unpaid = inv.filter((i: any) => Number(i.balance_due || 0) > 0 && !['Paid', 'Void'].includes(String(i.status || '')))
  const unpaidTotal = unpaid.reduce((a: number, i: any) => a + Number(i.balance_due || 0), 0)

  const overdue = inv.filter((i: any) => {
    const due = String(i.due_date || '').slice(0, 10)
    return due && due < todayKey && Number(i.balance_due || 0) > 0 && !['Paid', 'Void'].includes(String(i.status || ''))
  })
  const overdueTotal = overdue.reduce((a: number, i: any) => a + Number(i.balance_due || 0), 0)

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] kx-muted">Sales</div>
          <div className="kx-h1">Insights</div>
        </div>
        <Link href="/sales/overview" className="text-sm font-semibold text-[rgb(var(--kx-accent))]">
          Full view
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Kpi label="Today" value={fmtZar(salesToday)} tone="good" />
        <Kpi label="This Week" value={fmtZar(salesWeek)} tone="brand" />
        <Kpi label="This Month" value={fmtZar(salesMonth)} />
        <Kpi label="Clients" value={String((clients || []).length)} />
      </div>

      <div className="mt-6 rounded-3xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-card)]"
        style={{ border: '1px solid rgb(var(--kx-border) / 0.06)' }}>
        <Row href="/sales/invoices" label="Receivables (Unpaid)" meta={`${unpaid.length} invoices`} value={fmtZar(unpaidTotal)} />
        <Divider />
        <Row href="/sales/invoices" label="Overdue" meta={`${overdue.length} invoices`} value={fmtZar(overdueTotal)} />
        <Divider />
        <Row href="/sales/clients" label="Clients" meta="Top buyers, dormant buyers" value="Open" />
        <Divider />
        <Row href="/sales/quotes" label="Quotes" meta="Draft → convert to invoices" value="Open" />
      </div>

      <div className="mt-5 rounded-3xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-card)] p-4"
        style={{ border: '1px solid rgb(var(--kx-border) / 0.06)' }}>
        <div className="text-sm font-semibold">Next up: Genius Sales</div>
        <div className="mt-1 text-sm kx-muted">
          We’ll add “top sellers”, “dead stock”, and “non-buyers” summaries optimized for mobile.
        </div>
      </div>

      <div className="h-10" />
    </div>
  )
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'brand' }) {
  const color =
    tone === 'good'
      ? 'text-emerald-600'
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

function Row({ href, label, meta, value }: { href: string; label: string; meta?: string; value: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{label}</div>
        {meta ? <div className="text-xs kx-muted truncate">{meta}</div> : null}
      </div>
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
