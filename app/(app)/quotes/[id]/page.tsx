// @ts-nocheck
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { shareQuoteUrl } from '@/lib/share'
import { fmtZar } from '@/lib/format'
import QuoteStatus from './ui-status'
import ConvertButton from './ui-convert'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { Card } from '@/components/card'
import { EnterpriseTimeline, type EnterpriseTimelineEvent } from '@/components/enterprise/enterprise-timeline'
import QuoteWhatsAppLauncher from './ui-whatsapp-launcher'
import MarkViewedButton from './ui-mark-viewed'
import { SaveDocButton } from '@/components/pdf/save-doc-button'
import { EmailDocButton } from '@/components/email/email-doc-button'

type PageProps = { params: Promise<{ id: string }> }

function toEnterpriseEvents(logs: any[]): EnterpriseTimelineEvent[] {
  const out: EnterpriseTimelineEvent[] = []
  const seen = new Set<string>()
  function push(status: EnterpriseTimelineEvent['status'], title: string, meta?: string, at?: string) {
    if (seen.has(status)) return
    seen.add(status)
    out.push({ id: status, status, title, meta, at })
  }
  for (const a of logs || []) {
    const action = String(a?.action || '')
    const at = a?.created_at ? new Date(String(a.created_at)).toLocaleString('en-ZA') : ''
    if (action === 'created') push('created', 'Created', 'Draft', at)
    if (action === 'sent_whatsapp') push('sent', 'Sent via WhatsApp', 'Customer message', at)
    if (action === 'viewed') push('viewed', 'Viewed', 'Customer opened / confirmed', at)
  }
  if (!seen.has('created')) push('created', 'Created', 'Draft')
  return out
}

export default async function QuotePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const quoteRes = await supabase.from('quotes').select('id,company_id,public_token,number,issue_date,expiry_date,status,notes,terms,subtotal,discount_total,tax_total,total,pdf_path, clients(name,email,phone,billing_address)').eq('id', id).maybeSingle()
  const quote = quoteRes.data
  const [{ data: items }, { data: logs }, { data: company }] = await Promise.all([
    supabase.from('quote_items').select('id,description,qty,unit_price,discount,tax_rate').eq('quote_id', id),
    supabase.from('activity_logs').select('id,action,entity_type,entity_id,created_at').eq('entity_id', id).in('entity_type', ['quote']).order('created_at', { ascending: true }).limit(200),
    quote?.company_id ? supabase.from('companies').select('id,name,email,phone').eq('id', quote.company_id).maybeSingle() : Promise.resolve({ data: null }),
  ])
  if (!quote) return <div className="kx-card p-4"><div className="text-sm font-semibold">Quote not found</div><div className="text-sm kx-muted mt-1">This quote may have been deleted.</div></div>
  const totalText = fmtZar(Number(quote.total ?? 0))
  const events = toEnterpriseEvents(logs || [])
  const pdfUrl = quote.pdf_path ? supabase.storage.from('kx-docs').getPublicUrl(quote.pdf_path).data.publicUrl : null
  return (
    <PosHeroShell
      title={`Quote ${quote.number ?? ''}`}
      subtitle={`Client: ${quote.clients?.name ?? '—'}`}
      meta={<div className="flex flex-wrap gap-2"><span className="kx-chip">{quote.status ?? 'Draft'}</span><span className="kx-chip">{totalText}</span></div>}
      actions={<>
        <QuoteWhatsAppLauncher quoteId={quote.id} quoteNumber={quote.number} clientName={quote.clients?.name} clientPhone={quote.clients?.phone} totalText={totalText} viewPath={quote.public_token ? shareQuoteUrl(quote.public_token) : `/quotes/${quote.id}`} />
        <Link className="kx-button" href={`/quotes/${quote.id}/print`} target="_blank">Print</Link>
        <SaveDocButton kind="quote" docId={quote.id} number={quote.number} companyName={company?.name || 'Kryvexis'} companyEmail={company?.email} companyPhone={company?.phone} clientName={quote.clients?.name} issueDate={quote.issue_date} dueOrExpiryDate={quote.expiry_date} subtotal={Number(quote.subtotal || 0)} taxTotal={Number(quote.tax_total || 0)} discountTotal={Number(quote.discount_total || 0)} total={Number(quote.total || 0)} existingPath={quote.pdf_path} items={(items || []).map((it:any)=>({description:it.description,qty:Number(it.qty||0),unit_price:Number(it.unit_price||0),line_total: Math.max(0, Number(it.qty||0)*Number(it.unit_price||0)-Number(it.discount||0))*(1+Number(it.tax_rate||0))}))} autoIfMissing />
        <EmailDocButton defaultTo={quote.clients?.email} kindLabel="Quote" number={quote.number} pdfUrl={pdfUrl} companyId={quote.company_id} entityType="quote" entityId={quote.id} />
        <ConvertButton quoteId={quote.id} />
      </>}
      rail={<><EnterpriseTimeline title="Status timeline" events={events} /><Card><div className="text-sm font-semibold">Client</div><div className="mt-2 text-sm">{quote.clients?.name ?? '—'}</div><div className="mt-1 text-xs kx-muted">{quote.clients?.email ?? ''}</div><div className="mt-1 text-xs kx-muted">{quote.clients?.phone ?? ''}</div></Card><Card><div className="text-sm font-semibold">Status</div><div className="mt-3"><QuoteStatus quoteId={quote.id} current={quote.status ?? 'Draft'} /><div className="mt-3"><MarkViewedButton quoteId={quote.id} /></div></div></Card></>}
    >
      <Card>
        <div className="grid gap-3 md:grid-cols-2"><div className="rounded-2xl bg-[rgba(var(--kx-fg),.045)] px-4 py-3"><div className="text-xs kx-muted">Issue date</div><div className="mt-1 font-medium">{quote.issue_date ?? '—'}</div></div><div className="rounded-2xl bg-[rgba(var(--kx-fg),.045)] px-4 py-3"><div className="text-xs kx-muted">Expiry date</div><div className="mt-1 font-medium">{quote.expiry_date ?? '—'}</div></div></div>
        <div className="mt-6"><div className="text-sm font-semibold">Line items</div><div className="mt-3 overflow-x-auto rounded-3xl bg-[rgba(var(--kx-fg),.045)]"><table className="w-full text-sm min-w-[760px]"><thead className="kx-muted bg-[rgba(var(--kx-fg),.035)]"><tr><th className="text-left px-4 py-3">Description</th><th className="text-right px-4 py-3">Qty</th><th className="text-right px-4 py-3">Unit</th><th className="text-right px-4 py-3">Discount</th><th className="text-right px-4 py-3">Tax</th><th className="text-right px-4 py-3">Line</th></tr></thead><tbody>{(items || []).map((it:any)=>{const base=Number(it.qty||0)*Number(it.unit_price||0); const disc=Math.min(Number(it.discount||0), base); const after=Math.max(0, base-disc); const tax=after*Number(it.tax_rate||0); const line=after+tax; return <tr key={it.id} className="border-t border-[rgba(var(--kx-fg),.06)]"><td className="px-4 py-3">{it.description}</td><td className="px-4 py-3 text-right">{Number(it.qty||0)}</td><td className="px-4 py-3 text-right">{fmtZar(Number(it.unit_price||0))}</td><td className="px-4 py-3 text-right">{fmtZar(Number(it.discount||0))}</td><td className="px-4 py-3 text-right">{Math.round(Number(it.tax_rate||0)*100)}%</td><td className="px-4 py-3 text-right font-semibold">{fmtZar(line)}</td></tr>})}</tbody></table></div></div>
        <div className="mt-6 grid gap-3 md:grid-cols-2"><div className="rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4"><div className="text-xs kx-muted">Notes</div><div className="mt-2 text-sm">{quote.notes || '—'}</div></div><div className="rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4"><div className="text-xs kx-muted">Terms</div><div className="mt-2 text-sm">{quote.terms || '—'}</div></div></div>
        <div className="mt-6 rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4"><div className="flex items-center justify-between"><div className="text-sm font-semibold">Totals</div><div className="text-lg font-semibold">{totalText}</div></div><div className="mt-3 grid gap-2 text-sm kx-muted"><div className="flex justify-between"><span>Subtotal</span><span>{fmtZar(Number(quote.subtotal ?? 0))}</span></div><div className="flex justify-between"><span>Discount</span><span>- {fmtZar(Number(quote.discount_total ?? 0))}</span></div><div className="flex justify-between"><span>Tax</span><span>{fmtZar(Number(quote.tax_total ?? 0))}</span></div></div></div>
      </Card>
    </PosHeroShell>
  )
}
