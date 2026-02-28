import ModuleTabs from '@/components/module-tabs'
import { insightsTabs } from '../tabs'

export default function InsightsAnalytics() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={insightsTabs} />

      <div className="kx-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">Analytics</div>
            <div className="text-sm kx-muted">Charts, trends, and exports.</div>
          </div>
          <span className="kx-chip">Coming next</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="kx-panel p-4">
            <div className="text-sm font-semibold">Monthly revenue</div>
            <div className="text-xs kx-muted mt-1">Graph + forecast.</div>
          </div>
          <div className="kx-panel p-4">
            <div className="text-sm font-semibold">Top clients</div>
            <div className="text-xs kx-muted mt-1">By revenue & margin.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
