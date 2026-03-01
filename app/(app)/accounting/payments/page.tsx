import PaymentsPage from '../../payments/page'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { RightRail } from '@/components/pos/right-rail'

export default async function AccountingPayments() {
  return (
    <PosHeroShell
      title="Payments"
      subtitle="Record and review incoming payments."
      meta={}
      rail={<RightRail title="Payment activity" />}
    >
      <PaymentsPage />
    </PosHeroShell>
  )
}
