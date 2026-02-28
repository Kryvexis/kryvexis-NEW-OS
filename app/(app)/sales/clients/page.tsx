import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'
import ClientsPage from '../../clients/page'

export default async function SalesClients() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />
      <ClientsPage />
    </div>
  )
}
