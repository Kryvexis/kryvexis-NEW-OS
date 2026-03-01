import { PosHeroShell } from '@/components/pos/hero-shell'
import { RightRail } from '@/components/pos/right-rail'
import Link from 'next/link'

export default function AccountingDashboard() {
  return (
    <PosHeroShell
      title="Accounting"
      subtitle="Payments, balances, POs and visibility."
      meta={}
      actions={
        <div className="flex items-center gap-2">
          <Link className="kx-btn kx-btn-secondary" href="/accounting/payments">Record payment</Link>
          <Link className="kx-btn kx-btn-secondary" href="/accounting/pos">New PO</Link>
        </div>
      }
      rail={
        <RightRail
          title="Accounting activity"
          items={[
            { label: 'Overdue invoices', sub: 'No items yet' },
            { label: 'Recent payments', sub: 'No items yet' },
          ]}
          actions={[{ label: 'View payments', href: '/accounting/payments' }]}
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="kx-card p-5">
          <div className="text-xs text-white/[0.55]">Collected (30d)</div>
          <div className="mt-2 text-2xl font-semibold">R 0,00</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-white/[0.55]">Outstanding</div>
          <div className="mt-2 text-2xl font-semibold">R 0,00</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-white/[0.55]">Overdue</div>
          <div className="mt-2 text-2xl font-semibold">R 0,00</div>
        </div>
      </div>

      <div className="kx-card p-6">
        <div className="text-sm font-semibold">Quick insights</div>
        <div className="mt-2 text-sm text-white/60">
          As you record payments and create POs, this dashboard will show cashflow, balances and reconciliation hints.
        </div>
      </div>
    </PosHeroShell>
  )
}
