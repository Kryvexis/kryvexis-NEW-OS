import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { PosHeroShell } from '@/components/pos/hero-shell'

export default async function CashbookPage() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: payments } = await supabase
    .from('payments')
    .select('id,amount,paid_at,method,reference,invoice_id')
    .eq('company_id', companyId)
    .order('paid_at', { ascending: false })
    .limit(200)

  return (
    <PosHeroShell title="Cashbook" subtitle="A simple list of money received (and later: expenses).">
      <div className="kx-card overflow-hidden">
        <div className="grid grid-cols-4 gap-2 border-b border-[rgba(var(--kx-border),.12)] px-4 py-3 text-xs text-white/60">
          <div>Date</div>
          <div>Method</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        {(payments || []).map((p: any) => (
          <div key={p.id} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm border-b border-[rgba(var(--kx-border),.08)]">
            <div className="text-white/80">{String(p.paid_at || '').slice(0, 10)}</div>
            <div className="text-white/70">{p.method || '—'}</div>
            <div className="col-span-2 text-right text-white/90">{fmtZar(Number(p.amount || 0))}</div>
          </div>
        ))}
        {!payments?.length && <div className="p-5 text-sm text-white/55">No payments recorded yet.</div>}
      </div>
    </PosHeroShell>
  )
}
