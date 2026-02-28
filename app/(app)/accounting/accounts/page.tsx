import ModuleTabs from '@/components/module-tabs'
import { accountingTabs } from '../tabs'
import AccountsPage from '../../accounts/page'

export default async function AccountingAccounts() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={accountingTabs} />
      <AccountsPage />
    </div>
  )
}
