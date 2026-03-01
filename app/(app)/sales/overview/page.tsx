import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { Card } from '@/components/card'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { EmptyState } from '@/components/pos/empty'

export default async function SalesOverview() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: invoices }, { data: quotes }, { data: payments }, { data: activity }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id,number,total,balance_due,status,issue_date,client_id, clients(name)')
      .eq('company_id', companyId)
      .limit(2000),
    supabase
      .from('quotes')
      .select('id,number,total,status,issue_date,client_id, clients(name)')
      .eq('company_id', companyId)
      .limit(2000),
    supabase.from('payments').select('id,amount,payment_date').eq('company_id', companyId).limit(5000),
    supabase
      .from('activity_logs')
      .select('id,action,entity_type,entity_id,created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  const totalInvoiced = (invoices || []).reduce((a: number, i: any) => a + Number(i.total || 0), 0)
  const outstanding = (invoices || []).reduce((a: number, i: any) => a + Number(i.balance_due || 0), 0)
  const collected = (payments || []).reduce((a: number, p: any) => a + Number(p.amount || 0), 0)
  const openQuotes = (quotes || []).filter((q: any) => !['Rejected', 'Expired'].includes(String(q.status || ''))).length

  const outstandingList = (invoices || [])
    .filter((i: any) => Number(i.balance_due || 0) > 0.01)
    .sort((a: any, b: any) => Number(b.balance_due || 0) - Number(a.balance_due || 0))
    .slice(0, 6)

  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />

      <PosHeroShell
        title="Sales overview"
        subtitle="Command center for quotes, invoices and daily revenue."
        meta={
          <div className="flex flex-wrap gap-2">
            <span className="kx-chip">Invoiced {fmtZar(totalInvoiced)}</span>
            <span className="kx-chip">Collected {fmtZar(collected)}</span>
            <span className="kx-chip">Outstanding {fmtZar(outstanding)}</span>
            <span className="kx-chip">Open quotes {openQuotes}</span>
          </div>
        }
        actions={
          <>
            <Link href="/sales/pos" className="kx-button">
              Open POS
            </Link>
            <Link href="/quotes/new" className="kx-button">
              New Quote
            </Link>
            <Link href="/invoices/new" className="kx-button">
              New Invoice
            </Link>
          </>
        }
        rail={
          <>
            <Card>
              <div className="text-sm font-semibold">Quick actions</div>
              <div className="mt-3 grid gap-2">
                <Link className="kx-button" href="/sales/quotes">
                  View quotes
                </Link>
                <Link className="kx-button" href="/sales/invoices">
                  View invoices
                </Link>
                <Link className="kx-button" href="/sales/clients">
                  View clients
                </Link>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <div className="text-xs kx-muted2">Revenue invoiced</div>
            <div className="mt-1 text-2xl font-semibold">{fmtZar(totalInvoiced)}</div>
          </Card>
          <Card>
            <div className="text-xs kx-muted2">Collected</div>
            <div className="mt-1 text-2xl font-semibold">{fmtZar(collected)}</div>
          </Card>
          <Card>
            <div className="text-xs kx-muted2">Outstanding</div>
            <div className="mt-1 text-2xl font-semibold">{fmtZar(outstanding)}</div>
          </Card>
          <Card>
            <div className="text-xs kx-muted2">Open quotes</div>
            <div className="mt-1 text-2xl font-semibold">{openQuotes}</div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Outstanding invoices</div>
              <div className="text-xs kx-muted2">Highest balances</div>
            </div>
            <Link href="/sales/invoices" className="kx-button">
              Open list
            </Link>
          </div>

          <div className="mt-3 overflow-hidden rounded-3xl bg-[rgba(var(--kx-fg),.045)]">
            <table className="w-full text-sm">
              <thead className="bg-[rgba(var(--kx-fg),.035)] kx-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Invoice</th>
                  <th className="px-3 py-2 text-left font-semibold">Client</th>
                  <th className="px-3 py-2 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {outstandingList.map((i: any) => (
                  <tr key={i.id} className="hover:bg-[rgba(var(--kx-fg),.04)]">
                    <td className="px-3 py-2">
                      <Link className="underline-offset-2 hover:underline" href={`/invoices/${i.id}`}>
                        {i.number || 'Invoice'}
                      </Link>
                    </td>
                    <td className="px-3 py-2 kx-muted">{i.clients?.name || '—'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmtZar(Number(i.balance_due || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!outstandingList.length ? (
              <div className="p-4">
                <EmptyState title="All good." subtitle="No outstanding invoices right now." />
              </div>
            ) : null}
          </div>
        </Card>
      </PosHeroShell>
    </div>
  )
}
