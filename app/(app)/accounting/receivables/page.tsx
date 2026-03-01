import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { PosHeroShell } from '@/components/pos/hero-shell'

export default async function ReceivablesPage() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id,invoice_number,client_name,issue_date,due_date,balance_due,total,status')
    .eq('company_id', companyId)
    .gt('balance_due', 0)
    .order('due_date', { ascending: true })
    .limit(500)

  const totalDue = (invoices || []).reduce((a: number, i: any) => a + Number(i.balance_due || 0), 0)

  return (
    <PosHeroShell title="Receivables" subtitle="Clients who still owe you money.">
      <div className="kx-card p-5">
        <div className="text-xs text-white/55">Total outstanding</div>
        <div className="mt-2 text-3xl font-semibold">{fmtZar(totalDue)}</div>
      </div>

      <div className="kx-card overflow-hidden mt-4">
        <div className="grid grid-cols-12 gap-2 border-b border-[rgba(var(--kx-border),.12)] px-4 py-3 text-xs text-white/60">
          <div className="col-span-4">Client</div>
          <div className="col-span-3">Invoice</div>
          <div className="col-span-2">Due</div>
          <div className="col-span-3 text-right">Balance</div>
        </div>
        {(invoices || []).map((i: any) => (
          <div key={i.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-[rgba(var(--kx-border),.08)]">
            <div className="col-span-4 text-white/85 truncate">{i.client_name || '—'}</div>
            <div className="col-span-3 text-white/70 truncate">{i.invoice_number || i.id}</div>
            <div className="col-span-2 text-white/70">{String(i.due_date || i.issue_date || '').slice(0,10)}</div>
            <div className="col-span-3 text-right text-white/90">{fmtZar(Number(i.balance_due || 0))}</div>
          </div>
        ))}
        {!invoices?.length && <div className="p-5 text-sm text-white/55">All good — no outstanding invoices.</div>}
      </div>
    </PosHeroShell>
  )
}
