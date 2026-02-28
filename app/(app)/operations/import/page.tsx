import ModuleTabs from '@/components/module-tabs'
import { operationsTabs } from '../tabs'
import ImportPage from '../../import-station/page'

export default async function OperationsImport() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={operationsTabs} />
      <ImportPage />
    </div>
  )
}
