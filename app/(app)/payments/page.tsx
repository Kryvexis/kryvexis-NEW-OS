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

  const { data: payments } = await supabase
    .from('payments')
    .select('id,amount,payment_date,method,reference,invoice_id,created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(300)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Payments</div>
        <div className="text-sm text-white/60">All payments across invoices.</div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/50">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-medium">Date</th>
                <th className="py-2 text-left font-medium">Method</th>
                <th className="py-2 text-left font-medium">Reference</th>
                <th className="py-2 text-right font-medium">Amount</th>
                <th className="py-2 text-right font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {(payments || []).map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 text-white/70">{p.payment_date}</td>
                  <td className="py-2 text-white/70">{p.method || '—'}</td>
                  <td className="py-2 text-white/70">{p.reference || '—'}</td>
                  <td className="py-2 text-right font-medium">{fmtZar(Number(p.amount))}</td>
                  <td className="py-2 text-right">
                    <Link className="kx-btn" href={`/invoices/${p.invoice_id}`}>Open</Link>
                  </td>
                </tr>
              ))}
              {!payments?.length && (
                <tr>
                  <td className="py-6 text-white/50" colSpan={5}>
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
