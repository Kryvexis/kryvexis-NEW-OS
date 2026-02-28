import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'
import POSClient from './pos-client'

export default function SalesPOS() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />
      <POSClient />
    </div>
  )
}
