import { PosHeroShell } from '@/components/pos/hero-shell'
import { RightRail } from '@/components/pos/right-rail'
import Link from 'next/link'

export default function AccountingPOs() {
  return (
    <PosHeroShell
      title="Purchase Orders"
      subtitle="Create POs, track approvals and receiving."
      meta={null}
      actions={<Link href="/operations/suppliers" className="kx-btn kx-btn-secondary">Suppliers</Link>}
      rail={<RightRail title="PO activity" />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card p-6">
          <div className="text-sm font-semibold">Draft POs</div>
          <div className="mt-2 text-sm text-white/60">No POs yet.</div>
          <div className="mt-4 flex gap-2">
            <button className="kx-btn kx-btn-primary">New PO</button>
            <button className="kx-btn kx-btn-secondary">Import POs</button>
          </div>
        </div>

        <div className="kx-card p-6">
          <div className="text-sm font-semibold">Receiving</div>
          <div className="mt-2 text-sm text-white/60">
            Mark POs as received to update stock (coming next).
          </div>
        </div>
      </div>
    </PosHeroShell>
  )
}
