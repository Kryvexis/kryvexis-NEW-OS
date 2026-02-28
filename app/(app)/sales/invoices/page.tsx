import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'
import InvoicesPage from '../../invoices/page'

export default async function SalesInvoices() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />
      <InvoicesPage />
    </div>
  )
}
