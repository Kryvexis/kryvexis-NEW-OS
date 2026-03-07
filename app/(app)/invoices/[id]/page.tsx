// @ts-nocheck
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { shareInvoiceUrl } from '@/lib/share'
import { fmtZar } from '@/lib/format'
import InvoiceStatus from './ui-status'
import { PaymentDrawer } from '@/components/payments/payment-drawer'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { Card } from '@/components/card'
import { EnterpriseTimeline, type EnterpriseTimelineEvent } from '@/components/enterprise/enterprise-timeline'
import InvoiceWhatsAppLauncher from './ui-whatsapp-launcher'
import MarkViewedButton from './ui-mark-viewed'
import { SaveDocButton } from '@/components/pdf/save-doc-button'
import { EmailDocButton } from '@/components/email/email-doc-button'

type PageProps = {
  params: Promise<{ id: string }>
}

function toEnterpriseEvents(logs: any[], invoice: any): EnterpriseTimelineEvent[] {
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
    if (action === 'created' || action === 'created_from_quote') push('created', 'Created', action === 'created_from_quote' ? 'Converted from quote' : 'Draft', at)
    if (action === 'sent_whatsapp') push('sent', 'Sent via WhatsApp', 'Customer message', at)
    if (action === 'viewed') push('viewed', 'Viewed', 'Customer opened / confirmed', at)
    if (a?.entity_type === 'payment' && action === 'recorded') {
      const bal = Number(invoice?.balance_due ?? 0)
      if (bal > 0.00001) push('partial', 'Partial Payment', 'Payment recorded', at)
      else push('paid', 'Paid', 'Payment recorded', at)
    }
  }

  const invStatus = String(invoice?.status || 'Draft')
  const bal = Number(invoice?.balance_due ?? 0)
  if (!seen.has('created')) push('created', 'Created', 'Draft')
  if ((invStatus === 'Sent' || invStatus === 'Paid' || invStatus === 'Partially Paid') && !seen.has('sent')) push('sent', 'Sent via WhatsApp', 'Sent')
  if (invStatus === 'Partially Paid' && !seen.has('partial')) push('partial', 'Partial Payment', 'Balance remaining')
  if ((invStatus === 'Paid' || bal <= 0.00001) && !seen.has('paid')) push('paid', 'Paid', 'Balance cleared')

  return out
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const invoiceRes = await supabase
    .from('invoices')
    .select('id,company_id,public_token,number,issue_date,due_date,status,notes,terms,subtotal,discount_total,tax_total,total,balance_due,pdf_path, clients(name,email,phone,billing_address)')
    .eq('id', id)
    .maybeSingle()
  const invoice = invoiceRes.data

  const [{ data: items }, { data: pays }, { data: logs }, { data: company }] = await Promise.all([
    supabase.from('invoice_items').select('id,description,qty,unit_price,discount,tax_rate').eq('invoice_id', id),
    supabase.from('payments').select('id,amount,payment_date,method,reference,created_at').eq('invoice_id', id).order('payment_date', { ascending: false }).limit(50),
    supabase.from('activity_logs').select('id,action,entity_type,entity_id,created_at').eq('entity_id', id).in('entity_type', ['invoice', 'payment']).order('created_at', { ascending: true }).limit(200),
    invoice?.company_id ? supabase.from('companies').select('id,name,email,phone').eq('id', invoice.company_id).maybeSingle() : Promise.resolve({ data: null }),
  ])

  if (!invoice) {
    return <div className="kx-card p-4"><div className="text-sm font-semibold">Invoice not found</div><div className="text-sm kx-muted mt-1">This invoice may have been deleted.</div></div>
  }

  const totalText = fmtZar(Number(invoice.total ?? 0))
  const balanceText = fmtZar(Number(invoice.balance_due ?? 0))
  const clientName = invoice.clients?.name ?? '—'
  const events = toEnterpriseEvents(logs || [], invoice)
  const pdfUrl = invoice.pdf_path ? supabase.storage.from('kx-docs').getPublicUrl(invoice.pdf_path).data.publicUrl : null

  return (
    <PosHeroShell
      title={`Invoice ${invoice.number ?? ''}`}
      subtitle={`Client: ${clientName}`}
      meta={<div className="flex flex-wrap gap-2"><span className="kx-chip">{invoice.status ?? 'Draft'}</span><span className="kx-chip">Balance: {balanceText}</span></div>}
      actions={<>
        <InvoiceWhatsAppLauncher invoiceId={invoice.id} invoiceNumber={invoice.number} clientName={clientName} clientPhone={invoice.clients?.phone} totalText={totalText} viewPath={invoice.public_token ? shareInvoiceUrl(invoice.public_token) : `/invoices/${invoice.id}`} />
        <Link className="kx-button" href={`/invoices/${invoice.id}/print`} target="_blank">Print</Link>
        <SaveDocButton kind="invoice" docId={invoice.id} number={invoice.number} companyName={company?.name || 'Kryvexis'} companyEmail={company?.email} companyPhone={company?.phone} clientName={clientName} issueDate={invoice.issue_date} dueOrExpiryDate={invoice.due_date} subtotal={Number(invoice.subtotal || 0)} taxTotal={Number(invoice.tax_total || 0)} discountTotal={Number(invoice.discount_total || 0)} total={Number(invoice.total || 0)} existingPath={invoice.pdf_path} items={(items || []).map((it:any)=>({description:it.description,qty:Number(it.qty||0),unit_price:Number(it.unit_price||0),line_total: Math.max(0, Number(it.qty||0)*Number(it.unit_price||0)-Number(it.discount||0))*(1+Number(it.tax_rate||0))}))} autoIfMissing />
        <EmailDocButton defaultTo={invoice.clients?.email} kindLabel="Invoice" number={invoice.number} pdfUrl={pdfUrl} companyId={invoice.company_id} entityType="invoice" entityId={invoice.id} />
        <PaymentDrawer invoiceId={invoice.id} />
      </>}
      rail={<>
        <EnterpriseTimeline title="Status timeline" events={events} />
        <Card><div className="text-sm font-semibold">Client</div><div className="mt-2 text-sm">{clientName}</div><div className="mt-1 text-xs kx-muted">{invoice.clients?.email ?? ''}</div><div className="mt-1 text-xs kx-muted">{invoice.clients?.phone ?? ''}</div></Card>
        <Card><div className="text-sm font-semibold">Status</div><div className="mt-3"><InvoiceStatus invoiceId={invoice.id} current={invoice.status ?? 'Draft'} /><div className="mt-3"><MarkViewedButton invoiceId={invoice.id} /></div></div></Card>
      </>}
    >
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-[rgba(var(--kx-fg),.045)] px-4 py-3"><div className="text-xs kx-muted">Issue date</div><div className="mt-1 font-medium">{invoice.issue_date ?? '—'}</div></div>
          <div className="rounded-2xl bg-[rgba(var(--kx-fg),.045)] px-4 py-3"><div className="text-xs kx-muted">Due date</div><div className="mt-1 font-medium">{invoice.due_date ?? '—'}</div></div>
        </div>
        <div className="mt-6"><div className="text-sm font-semibold">Line items</div><div className="mt-3 overflow-x-auto rounded-3xl bg-[rgba(var(--kx-fg),.045)]"><table className="w-full text-sm min-w-[760px]"><thead className="kx-muted bg-[rgba(var(--kx-fg),.035)]"><tr><th className="text-left px-4 py-3">Description</th><th className="text-right px-4 py-3">Qty</th><th className="text-right px-4 py-3">Unit</th><th className="text-right px-4 py-3">Discount</th><th className="text-right px-4 py-3">Tax</th><th className="text-right px-4 py-3">Line</th></tr></thead><tbody>{(items || []).map((it:any)=>{const base=Number(it.qty||0)*Number(it.unit_price||0); const disc=Math.min(Number(it.discount||0), base); const after=Math.max(0, base-disc); const tax=after*Number(it.tax_rate||0); const line=after+tax; return <tr key={it.id} className="border-t border-[rgba(var(--kx-fg),.06)]"><td className="px-4 py-3">{it.description}</td><td className="px-4 py-3 text-right">{Number(it.qty||0)}</td><td className="px-4 py-3 text-right">{fmtZar(Number(it.unit_price||0))}</td><td className="px-4 py-3 text-right">{fmtZar(Number(it.discount||0))}</td><td className="px-4 py-3 text-right">{Math.round(Number(it.tax_rate||0)*100)}%</td><td className="px-4 py-3 text-right font-semibold">{fmtZar(line)}</td></tr>})}</tbody></table></div></div>
        <div className="mt-6 grid gap-3 md:grid-cols-2"><div className="rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4"><div className="text-xs kx-muted">Notes</div><div className="mt-2 text-sm">{invoice.notes || '—'}</div></div><div className="rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4"><div className="text-xs kx-muted">Terms</div><div className="mt-2 text-sm">{invoice.terms || '—'}</div></div></div>
        <div className="mt-6 rounded-3xl bg-[rgba(var(--kx-fg),.04)] p-4"><div className="flex items-center justify-between"><div className="text-sm font-semibold">Totals</div><div className="text-lg font-semibold">{totalText}</div></div><div className="mt-3 grid gap-2 text-sm kx-muted"><div className="flex justify-between"><span>Subtotal</span><span>{fmtZar(Number(invoice.subtotal ?? 0))}</span></div><div className="flex justify-between"><span>Discount</span><span>- {fmtZar(Number(invoice.discount_total ?? 0))}</span></div><div className="flex justify-between"><span>Tax</span><span>{fmtZar(Number(invoice.tax_total ?? 0))}</span></div><div className="flex justify-between font-medium text-[rgba(var(--kx-fg),.9)]"><span>Balance due</span><span>{balanceText}</span></div></div></div>
      </Card>
    </PosHeroShell>
  )
}
