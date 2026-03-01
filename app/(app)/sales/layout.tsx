import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from './tabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kx-module">
      <ModuleTabs tabs={salesTabs} />
      <div className="kx-moduleBody">{children}</div>
    </div>
  )
}
