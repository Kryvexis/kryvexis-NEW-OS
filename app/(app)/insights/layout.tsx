import ModuleTabs from '@/components/module-tabs'
import { insightsTabs } from './tabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kx-module">
      <ModuleTabs tabs={insightsTabs} />
      <div className="kx-moduleBody">{children}</div>
    </div>
  )
}
