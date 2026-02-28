import ModuleTabs from '@/components/module-tabs'
import { insightsTabs } from '../tabs'
import ReportsPage from '../../reports/page'

export default async function InsightsReports() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={insightsTabs} />
      <ReportsPage />
    </div>
  )
}
