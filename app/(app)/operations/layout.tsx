import ModuleTabs from '@/components/module-tabs'
import { operationsTabs } from './tabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kx-module">
      <ModuleTabs tabs={operationsTabs} />
      <div className="kx-moduleBody">{children}</div>
    </div>
  )
}
