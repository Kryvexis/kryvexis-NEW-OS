import ModuleTabs from '@/components/module-tabs'
import { accountingTabs } from '../tabs'

export default function AccountingPOs() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={accountingTabs} />

      <div className="kx-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">Purchase Orders</div>
            <div className="text-sm kx-muted">Create POs, approve spend, and receive stock.</div>
          </div>
          <span className="kx-chip">Coming next</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="kx-panel p-4">
            <div className="text-sm font-semibold">Draft</div>
            <div className="text-xs kx-muted mt-1">Supplier, items, expected date.</div>
          </div>
          <div className="kx-panel p-4">
            <div className="text-sm font-semibold">Approved</div>
            <div className="text-xs kx-muted mt-1">Ready to send to supplier.</div>
          </div>
          <div className="kx-panel p-4">
            <div className="text-sm font-semibold">Received</div>
            <div className="text-xs kx-muted mt-1">Convert to stock receipt.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
