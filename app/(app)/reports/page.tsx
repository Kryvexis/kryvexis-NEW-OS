import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { Card } from '@/components/card'

function fmtZar(v: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(v)
}

export default async function Page() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id,total,balance_due,status,issue_date,client_id')
    .eq('company_id', companyId)
    .order('issue_date', { ascending: false })
    .limit(500)

  const totalInvoiced = (invoices || []).reduce((a, i) => a + Number(i.total), 0)
  const outstanding = (invoices || []).reduce((a, i) => a + Number(i.balance_due), 0)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Reports</div>
        <div className="text-sm text-white/60">Quick insights: revenue, outstanding invoices, top clients.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <div className="text-xs text-white/55">Total invoiced</div>
          <div className="text-xl font-semibold mt-1">{fmtZar(totalInvoiced)}</div>
        </Card>
        <Card>
          <div className="text-xs text-white/55">Outstanding</div>
          <div className="text-xl font-semibold mt-1">{fmtZar(outstanding)}</div>
        </Card>
        <Card>
          <div className="text-xs text-white/55">Invoices</div>
          <div className="text-xl font-semibold mt-1">{(invoices || []).length}</div>
        </Card>
      </div>

      <Card>
        <div className="text-sm text-white/60 mb-2">Shortcuts</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/invoices" className="kx-btn">View invoices</Link>
          <Link href="/payments" className="kx-btn">View payments</Link>
          <Link href="/clients" className="kx-btn">View clients</Link>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-white/60">Coming next</div>
        <ul className="mt-2 text-sm text-white/70 list-disc pl-5 space-y-1">
          <li>Monthly revenue graph</li>
          <li>Top clients by revenue</li>
          <li>Export to CSV/PDF</li>
        </ul>
      </Card>
    </div>
  )
}
