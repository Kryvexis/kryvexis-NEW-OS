import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'
import DashboardPage from '../../dashboard/page'

export default async function SalesOverview() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />

      <DashboardPage />
    </div>
  )
}
