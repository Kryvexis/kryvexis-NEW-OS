import { PosHeroShell } from '@/components/pos/hero-shell'
import { RightRail } from '@/components/pos/right-rail'

export default function AccountingAccounts() {
  return (
    <PosHeroShell
      title="Accounts"
      subtitle="Client balances, statements and account history."
      meta={}
      rail={<RightRail title="Balances" />}
    >
      <div className="kx-card p-6">
        <div className="text-sm font-semibold">Client balances</div>
        <div className="mt-2 text-sm text-white/60">
          This is where you’ll see account customers, balances, and statement exports.
        </div>
      </div>

      <div className="kx-card p-6">
        <div className="text-sm font-semibold">Coming next</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-white/60 space-y-1">
          <li>Statements (PDF/email/WhatsApp)</li>
          <li>Credit limits and aging</li>
          <li>Account activity timeline</li>
        </ul>
      </div>
    </PosHeroShell>
  )
}
