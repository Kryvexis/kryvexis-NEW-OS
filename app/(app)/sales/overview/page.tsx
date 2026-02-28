import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'
import DashboardContent from '../../dashboard/DashboardContent'

export default async function SalesOverview() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />

      <DashboardContent title="Overview" subtitle="Command center: sales, income, and performance." />
    </div>
  )
}
