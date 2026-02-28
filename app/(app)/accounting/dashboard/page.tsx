import Link from 'next/link'
import ModuleTabs from '@/components/module-tabs'
import { accountingTabs } from '../tabs'

export default function AccountingDashboard() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={accountingTabs} />

      <div className="kx-card p-5">
        <div className="text-xl font-semibold">Accounting</div>
        <div className="text-sm kx-muted">Payments, balances, and purchase flow.</div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link href="/accounting/payments" className="kx-card p-4">
            <div className="text-sm font-semibold">Payments</div>
            <div className="text-xs kx-muted mt-1">Capture and track settlements.</div>
          </Link>
          <Link href="/accounting/pos" className="kx-card p-4">
            <div className="text-sm font-semibold">Purchase Orders</div>
            <div className="text-xs kx-muted mt-1">Create POs & manage supplier spend.</div>
          </Link>
          <Link href="/accounting/accounts" className="kx-card p-4">
            <div className="text-sm font-semibold">Accounts</div>
            <div className="text-xs kx-muted mt-1">Balances, statements, and ledger.</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
