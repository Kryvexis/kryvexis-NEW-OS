import ModuleTabs from '@/components/module-tabs'
import { accountingTabs } from '../tabs'
import PaymentsPage from '../../payments/page'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { RightRail } from '@/components/pos/right-rail'

export default async function AccountingPayments() {
  return (
    <PosHeroShell
      title="Payments"
      subtitle="Record and review incoming payments."
      meta={<ModuleTabs tabs={accountingTabs} />}
      rail={<RightRail title="Payment activity" />}
    >
      <PaymentsPage />
    </PosHeroShell>
  )
}
