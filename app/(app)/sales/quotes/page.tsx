import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'
import QuotesPage from '../../quotes/page'

export default async function SalesQuotes() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />
      <QuotesPage />
    </div>
  )
}
