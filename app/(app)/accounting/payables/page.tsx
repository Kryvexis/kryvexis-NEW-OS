import { PosHeroShell } from '@/components/pos/hero-shell'

export default function PayablesPage() {
  return (
    <PosHeroShell title="Payables" subtitle="What you owe (supplier bills & expenses).">
      <div className="kx-card p-5">
        <div className="text-sm font-semibold">Coming next</div>
        <div className="mt-2 text-sm text-white/65">
          To keep the app super simple, we’ll add payables when we introduce:
        </div>
        <ul className="mt-3 space-y-2 text-sm text-white/65">
          <li>• Supplier bills</li>
          <li>• Expense capture (cash/card)</li>
          <li>• Categories</li>
          <li>• Simple profit &amp; loss</li>
        </ul>
      </div>
    </PosHeroShell>
  )
}
