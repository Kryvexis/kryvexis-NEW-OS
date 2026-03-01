import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { fmtZar } from '@/lib/format'
import { Card } from '@/components/card'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { EmptyState } from '@/components/pos/empty'

export default async function SalesQuotes() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: quotes }, { data: activity }] = await Promise.all([
    supabase
      .from('quotes')
      .select('id,number,total,status,issue_date,client_id, clients(name)')
      .eq('company_id', companyId)
      .order('issue_date', { ascending: false })
      .limit(250),
    supabase
      .from('activity_logs')
      .select('id,action,entity_type,entity_id,created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const openCount = (quotes || []).filter((q: any) => !['Rejected', 'Expired'].includes(String(q.status || '')))
    .length

  return (
    <div className="space-y-4">      <PosHeroShell
        title="Quotes"
        subtitle="Create, send (WhatsApp) and convert quotes to invoices."
        meta={
          <div className="flex flex-wrap gap-2">
            <span className="kx-chip">Total {quotes?.length || 0}</span>
            <span className="kx-chip">Open {openCount}</span>
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
          </>
        }
        rail={
          <>
            <Card>
              <div className="text-sm font-semibold">Pro tip</div>
              <div className="mt-2 text-sm kx-muted">
                Use WhatsApp on the quote page to send a professional message with the quote number and total.
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
          {(quotes || []).length ? (
            <div className="overflow-hidden rounded-3xl bg-[rgba(var(--kx-fg),.045)]">
              <table className="w-full text-sm">
                <thead className="bg-[rgba(var(--kx-fg),.035)] kx-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Quote</th>
                    <th className="px-3 py-2 text-left font-semibold">Client</th>
                    <th className="hidden px-3 py-2 text-left font-semibold md:table-cell">Status</th>
                    <th className="px-3 py-2 text-right font-semibold">Total</th>
                    <th className="px-3 py-2 text-right font-semibold">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {(quotes as any[]).map((q) => (
                    <tr key={q.id} className="hover:bg-[rgba(var(--kx-fg),.04)]">
                      <td className="px-3 py-2">
                        <div className="font-semibold">{q.number || 'Quote'}</div>
                        <div className="text-xs kx-muted">
                          {q.issue_date ? new Date(String(q.issue_date)).toLocaleDateString('en-ZA') : '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 kx-muted">{q.clients?.name || '—'}</td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        <span className="kx-chip">{q.status || 'Draft'}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">{fmtZar(Number(q.total || 0))}</td>
                      <td className="px-3 py-2 text-right">
                        <Link className="kx-button" href={`/quotes/${q.id}`}>
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
              title="No quotes yet"
              subtitle="Create your first quote or start a sale in POS."
              action={
                <div className="flex flex-wrap gap-2">
                  <Link href="/quotes/new" className="kx-button">
                    New Quote
                  </Link>
                  <Link href="/sales/pos" className="kx-button">
                    Open POS
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
