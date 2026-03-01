import Link from 'next/link'
import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { Card } from '@/components/card'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { EmptyState } from '@/components/pos/empty'

export default async function SalesInvoices() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: invoices }, { data: payments }, { data: activity }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id,number,total,balance_due,status,issue_date,due_date,client_id, clients(name)')
      .eq('company_id', companyId)
      .order('issue_date', { ascending: false })
      .limit(250),
    supabase.from('payments').select('id,amount').eq('company_id', companyId).limit(5000),
    supabase
      .from('activity_logs')
      .select('id,action,entity_type,entity_id,created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalInvoiced = (invoices || []).reduce((a: number, i: any) => a + Number(i.total || 0), 0)
  const outstanding = (invoices || []).reduce((a: number, i: any) => a + Number(i.balance_due || 0), 0)
  const collected = (payments || []).reduce((a: number, p: any) => a + Number(p.amount || 0), 0)

  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />

      <PosHeroShell
        title="Invoices"
        subtitle="Track receivables, follow up, and stay cash-flow positive."
        meta={
          <div className="flex flex-wrap gap-2">
            <span className="kx-chip">Invoiced {fmtZar(totalInvoiced)}</span>
            <span className="kx-chip">Collected {fmtZar(collected)}</span>
            <span className="kx-chip">Outstanding {fmtZar(outstanding)}</span>
          </div>
        }
        actions={
          <>
            <Link href="/sales/pos" className="kx-button">
              Open POS
            </Link>
            <Link href="/invoices/new" className="kx-button">
              New Invoice
            </Link>
          </>
        }
        rail={
          <>
            <Card>
              <div className="text-sm font-semibold">Collections</div>
              <div className="mt-2 text-sm kx-muted">
                Tip: sort by highest balance due, then message clients on WhatsApp directly from the invoice page.
              </div>
            </Card>
            <Card>
              <div className="text-sm font-semibold">Recent activity</div>
              <div className="mt-3 space-y-2">
                {(activity || []).map((a: any) => (
                  <div key={a.id} className="rounded-2xl bg-[rgba(var(--kx-fg),.045)] px-3 py-2">
                    <div className="text-sm">{String(a.action || 'Updated')}</div>
                    <div className="text-xs kx-muted">
                      {String(a.entity_type || 'item')} · {new Date(String(a.created_at)).toLocaleString('en-ZA')}
                    </div>
                  </div>
                ))}
                {!activity?.length ? <div className="text-sm kx-muted">No activity yet.</div> : null}
              </div>
            </Card>
          </>
        }
      >
        <Card>
          {(invoices || []).length ? (
            <div className="overflow-hidden rounded-3xl bg-[rgba(var(--kx-fg),.045)]">
              <table className="w-full text-sm">
                <thead className="bg-[rgba(var(--kx-fg),.035)] kx-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Invoice</th>
                    <th className="px-3 py-2 text-left font-semibold">Client</th>
                    <th className="hidden px-3 py-2 text-left font-semibold md:table-cell">Status</th>
                    <th className="hidden px-3 py-2 text-right font-semibold md:table-cell">Balance</th>
                    <th className="px-3 py-2 text-right font-semibold">Total</th>
                    <th className="px-3 py-2 text-right font-semibold">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoices as any[]).map((inv) => (
                    <tr key={inv.id} className="hover:bg-[rgba(var(--kx-fg),.04)]">
                      <td className="px-3 py-2">
                        <div className="font-semibold">{inv.number || 'Invoice'}</div>
                        <div className="text-xs kx-muted">
                          {inv.issue_date ? new Date(String(inv.issue_date)).toLocaleDateString('en-ZA') : '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 kx-muted">{inv.clients?.name || '—'}</td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        <span className="kx-chip">{inv.status || 'Draft'}</span>
                      </td>
                      <td className="hidden px-3 py-2 text-right font-semibold md:table-cell">
                        {fmtZar(Number(inv.balance_due || 0))}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">{fmtZar(Number(inv.total || 0))}</td>
                      <td className="px-3 py-2 text-right">
                        <Link className="kx-button" href={`/invoices/${inv.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No invoices yet"
              subtitle="Start in POS or convert an approved quote to an invoice."
              action={
                <div className="flex flex-wrap gap-2">
                  <Link href="/sales/pos" className="kx-button">
                    Open POS
                  </Link>
                  <Link href="/sales/quotes" className="kx-button">
                    View quotes
                  </Link>
                </div>
              }
            />
          )}
        </Card>
      </PosHeroShell>
    </div>
  )
}
