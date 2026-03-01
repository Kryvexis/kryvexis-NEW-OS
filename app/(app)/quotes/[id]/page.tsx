// @ts-nocheck
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fmtZar } from '@/lib/format'
import QuoteStatus from './ui-status'
import ConvertButton from './ui-convert'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { Card } from '@/components/card'
import { StatusTimeline, type TimelineEvent } from '@/components/timeline/status-timeline'
import QuoteWhatsAppLauncher from './ui-whatsapp-launcher'

type PageProps = {
  params: Promise<{ id: string }>
}

function toEvent(a: any): TimelineEvent | null {
  const action = String(a?.action || '')
  const at = a?.created_at ? new Date(String(a.created_at)).toLocaleString('en-ZA') : ''
  if (action === 'created') return { id: a.id, title: 'Quote created', meta: 'Draft', kind: 'info', at }
  if (action === 'sent_whatsapp') return { id: a.id, title: 'Sent via WhatsApp', meta: 'Customer message', kind: 'good', at }
  if (action.startsWith('status:')) {
    const txt = action.replace('status:', '')
    return { id: a.id, title: 'Status updated', meta: txt, kind: 'info', at }
  }
  if (!action) return null
  return { id: a.id, title: action.replaceAll('_', ' '), meta: a.entity_type, kind: 'info', at }
}

export default async function QuotePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: quote }, { data: items }, { data: logs }] = await Promise.all([
    supabase
      .from('quotes')
      .select(
        'id,company_id,number,issue_date,expiry_date,status,notes,terms,subtotal,discount_total,tax_total,total, clients(name,email,phone,billing_address)'
      )
      .eq('id', id)
      .maybeSingle(),
    supabase.from('quote_items').select('id,description,qty,unit_price,discount,tax_rate').eq('quote_id', id),
    supabase
      .from('activity_logs')
      .select('id,action,entity_type,entity_id,created_at')
      .eq('entity_id', id)
      .in('entity_type', ['quote'])
      .order('created_at', { ascending: true })
      .limit(200),
  ])

  if (!quote) {
    return (
      <div className="kx-card p-4">
        <div className="text-sm font-semibold">Quote not found</div>
        <div className="text-sm kx-muted mt-1">This quote may have been deleted.</div>
      </div>
    )
  }

  const totalText = fmtZar(Number(quote.total ?? 0))
  const events = (logs || []).map(toEvent).filter(Boolean) as TimelineEvent[]

  return (
    <PosHeroShell
      title={`Quote ${quote.number ?? ''}`}
      subtitle={`Client: ${quote.clients?.name ?? '—'}`}
      meta={
        <div className="flex flex-wrap gap-2">
          <span className="kx-chip">{quote.status ?? 'Draft'}</span>
          <span className="kx-chip">{totalText}</span>
        </div>
      }
      actions={
        <>
          <QuoteWhatsAppLauncher
            quoteId={quote.id}
            quoteNumber={quote.number}
            clientName={quote.clients?.name}
            clientPhone={quote.clients?.phone}
            totalText={totalText}
            viewPath={`/quotes/${quote.id}`}
          />
          <Link className="kx-button" href={`/quotes/${quote.id}/print`} target="_blank">
            Print / PDF
          </Link>
          <ConvertButton quoteId={quote.id} />
        </>
      }
      rail={
        <>
          <StatusTimeline title="Status timeline" events={events} />
          <Card>
            <div className="text-sm font-semibold">Client</div>
            <div className="mt-2 text-sm">{quote.clients?.name ?? '—'}</div>
            <div className="mt-1 text-xs kx-muted">{quote.clients?.email ?? ''}</div>
            <div className="mt-1 text-xs kx-muted">{quote.clients?.phone ?? ''}</div>
          </Card>
          <Card>
            <div className="text-sm font-semibold">Status</div>
            <div className="mt-3">
              <QuoteStatus quoteId={quote.id} current={quote.status ?? 'Draft'} />
            </div>
          </Card>
        </>
      }
    >
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-[rgba(var(--kx-fg),.045)] px-4 py-3">
            <div className="text-xs kx-muted">Issue date</div>
            <div className="mt-1 font-medium">{quote.issue_date ?? '—'}</div>
          </div>
          <div className="rounded-2xl bg-[rgba(var(--kx-fg),.045)] px-4 py-3">
            <div className="text-xs kx-muted">Expiry date</div>
            <div className="mt-1 font-medium">{quote.expiry_date ?? '—'}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold">Line items</div>
          <div className="mt-3 overflow-x-auto rounded-3xl bg-[rgba(var(--kx-fg),.045)]">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="kx-muted bg-[rgba(var(--kx-fg),.035)]">
                <tr>
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-right px-4 py-3">Qty</th>
                  <th className="text-right px-4 py-3">Unit</th>
                  <th className="text-right px-4 py-3">Discount</th>
                  <th className="text-right px-4 py-3">Tax</th>
                  <th className="text-right px-4 py-3">Line</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).map((it: any) => {
                  const base = Number(it.qty || 0) * Number(it.unit_price || 0)
                  const disc = Math.min(Number(it.discount || 0), base)
                  const after = Math.max(0, base - disc)
                  const tax = after * Number(it.tax_rate || 0)
                  const line = after + tax
                  return (
                    <tr key={it.id} className="border-t border-[rgba(var(--kx-fg),.06)]">
                      <td className="px-4 py-3">{it.description}</td>
                      <td className="px-4 py-3 text-right">{Number(it.qty || 0)}</td>
                      <td className="px-4 py-3 text-right">{fmtZar(Number(it.unit_price || 0))}</td>
                      <td className="px-4 py-3 text-right">{fmtZar(Number(it.discount || 0))}</td>
                      <td className="px-4 py-3 text-right">{Math.round(Number(it.tax_rate || 0) * 100)}%</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmtZar(line)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4">
            <div className="text-xs kx-muted">Notes</div>
            <div className="mt-2 text-sm">{quote.notes || '—'}</div>
          </div>
          <div className="rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4">
            <div className="text-xs kx-muted">Terms</div>
            <div className="mt-2 text-sm">{quote.terms || '—'}</div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Totals</div>
            <div className="text-lg font-semibold">{totalText}</div>
          </div>
          <div className="mt-3 grid gap-2 text-sm kx-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmtZar(Number(quote.subtotal ?? 0))}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>- {fmtZar(Number(quote.discount_total ?? 0))}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{fmtZar(Number(quote.tax_total ?? 0))}</span>
            </div>
          </div>
        </div>
      </Card>
    </PosHeroShell>
  )
}
