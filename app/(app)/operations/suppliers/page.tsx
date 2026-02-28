import ModuleTabs from '@/components/module-tabs'
import { operationsTabs } from '../tabs'
import SuppliersPage from '../../suppliers/page'

export default async function OperationsSuppliers() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={operationsTabs} />
      <SuppliersPage />
    </div>
  )
}
