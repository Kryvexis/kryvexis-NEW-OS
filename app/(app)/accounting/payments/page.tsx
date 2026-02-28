import ModuleTabs from '@/components/module-tabs'
import { accountingTabs } from '../tabs'
import PaymentsPage from '../../payments/page'

export default async function AccountingPayments() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={accountingTabs} />
      <PaymentsPage />
    </div>
  )
}
