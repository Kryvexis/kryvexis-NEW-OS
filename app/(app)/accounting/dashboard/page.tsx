import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { PosHeroShell } from '@/components/pos/hero-shell'

export default async function AccountingOverview() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: invoices }, { data: payments }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id,total,balance_due,issue_date,status')
      .eq('company_id', companyId)
      .limit(5000),
    supabase
      .from('payments')
      .select('id,amount,paid_at,method,invoice_id')
      .eq('company_id', companyId)
      .limit(5000),
  ])

  const outstanding = (invoices || []).reduce((a: number, i: any) => a + Number(i.balance_due || 0), 0)

  const now = new Date()
  const start30 = new Date(now)
  start30.setDate(start30.getDate() - 30)
  const collected30 = (payments || [])
    .filter((p: any) => (p.paid_at ? new Date(p.paid_at) >= start30 : false))
    .reduce((a: number, p: any) => a + Number(p.amount || 0), 0)

  const invoiced30 = (invoices || [])
    .filter((i: any) => (i.issue_date ? new Date(i.issue_date) >= start30 : false))
    .reduce((a: number, i: any) => a + Number(i.total || 0), 0)

  return (
    <PosHeroShell title="Accounting" subtitle="Simple accounting: cash-in, amounts owed, and VAT.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Outstanding (owed to you)</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(outstanding)}</div>
          <div className="mt-1 text-xs text-white/55">Unpaid invoice balances.</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Invoiced (last 30 days)</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(invoiced30)}</div>
          <div className="mt-1 text-xs text-white/55">Value of invoices issued.</div>
        </div>
        <div className="kx-card p-5">
          <div className="text-xs text-white/55">Collected (last 30 days)</div>
          <div className="mt-2 text-3xl font-semibold">{fmtZar(collected30)}</div>
          <div className="mt-1 text-xs text-white/55">Payments recorded.</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="kx-card p-5">
          <div className="text-sm font-semibold">What this is</div>
          <div className="mt-2 text-sm text-white/65">
            Not a complicated accounting package — just the practical parts you need every day.
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            <li>• Cashbook (payments in/out)</li>
            <li>• Receivables (who owes you)</li>
            <li>• Payables (what you owe)</li>
            <li>• VAT summary (15% default on quotes/invoices)</li>
          </ul>
        </div>

        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Next upgrades</div>
          <div className="mt-2 text-sm text-white/65">
            We can add: expenses, supplier bills, categories, and a simple P&amp;L.
          </div>
        </div>
      </div>
    </PosHeroShell>
  )
}
