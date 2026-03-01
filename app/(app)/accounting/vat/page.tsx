import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { PosHeroShell } from '@/components/pos/hero-shell'

export default async function VatPage() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id,issue_date,tax_total,total')
    .eq('company_id', companyId)
    .limit(5000)

  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const monthInvoices = (invoices || []).filter((i: any) => {
    const d = i.issue_date ? new Date(i.issue_date) : null
    return d ? d >= start && d < end : false
  })

  const vatOut = monthInvoices.reduce((a: number, i: any) => a + Number(i.tax_total || 0), 0)
  const sales = monthInvoices.reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  return (
    <PosHeroShell title="VAT" subtitle="VAT OUT (sales VAT) for the current month.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Sales (this month)</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(sales)}</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">VAT OUT (this month)</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(vatOut)}</div>
          <div className="mt-1 text-xs text-white/55">Based on invoice tax totals.</div>
        </div>
      </div>

      <div className="kx-card p-5 mt-4">
        <div className="text-sm font-semibold">Note</div>
        <div className="mt-2 text-sm text-white/65">
          Input VAT (VAT on expenses) will appear here once we add expenses &amp; supplier bills.
        </div>
      </div>
    </PosHeroShell>
  )
}
