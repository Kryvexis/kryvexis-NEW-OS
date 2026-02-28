import ModuleTabs from '@/components/module-tabs'
import { operationsTabs } from '../tabs'

export default function OperationsStock() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={operationsTabs} />

      <div className="kx-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">Stock</div>
            <div className="text-sm kx-muted">Stock on hand, reorder alerts, and adjustments.</div>
          </div>
          <span className="kx-chip">Coming next</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="kx-panel p-4">
            <div className="text-sm font-semibold">Low stock</div>
            <div className="text-xs kx-muted mt-1">Products below reorder point.</div>
          </div>
          <div className="kx-panel p-4">
            <div className="text-sm font-semibold">Movements</div>
            <div className="text-xs kx-muted mt-1">Receipts, issues, and adjustments.</div>
          </div>
          <div className="kx-panel p-4">
            <div className="text-sm font-semibold">Valuation</div>
            <div className="text-xs kx-muted mt-1">Cost & stock value.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
