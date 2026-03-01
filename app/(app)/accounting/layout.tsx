import ModuleTabs from '@/components/module-tabs'
import { accountingTabs } from './tabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kx-module">
      <ModuleTabs tabs={accountingTabs} />
      <div className="kx-moduleBody">{children}</div>
    </div>
  )
}
