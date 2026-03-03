import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { Card } from '@/components/card'
import { Page as PageLayout } from '@/components/ui/page'

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
    <PageLayout title="Payments" subtitle="All payments across invoices.">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[rgba(var(--kx-fg),.92)]/50">
              <tr className="border-b border-[rgba(var(--kx-border),.12)]">
                <th className="py-2 text-left font-medium">Date</th>
                <th className="py-2 text-left font-medium">Method</th>
                <th className="py-2 text-left font-medium">Reference</th>
                <th className="py-2 text-right font-medium">Amount</th>
                <th className="py-2 text-right font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {(payments || []).map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-[rgba(var(--kx-border),.06)]">
                  <td className="py-2 kx-muted">{p.payment_date}</td>
                  <td className="py-2 kx-muted">{p.method || '—'}</td>
                  <td className="py-2 kx-muted">{p.reference || '—'}</td>
                  <td className="py-2 text-right font-medium">{fmtZar(Number(p.amount))}</td>
                  <td className="py-2 text-right">
                    <Link className="kx-btn" href={`/invoices/${p.invoice_id}`}>Open</Link>
                  </td>
                </tr>
              ))}
              {!payments?.length && (
                <tr>
                  <td className="py-6 text-[rgba(var(--kx-fg),.92)]/50" colSpan={5}>
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageLayout>
  )
}
