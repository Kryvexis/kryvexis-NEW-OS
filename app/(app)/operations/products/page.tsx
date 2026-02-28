import ModuleTabs from '@/components/module-tabs'
import { operationsTabs } from '../tabs'
import ProductsPage from '../../products/page'

export default async function OperationsProducts() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={operationsTabs} />
      <ProductsPage />
    </div>
  )
}
