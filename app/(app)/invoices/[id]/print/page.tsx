// @ts-nocheck
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { fmtZar } from '@/lib/format'


type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = params;
  const supabase = await createClient()
  const [{ data: invoice }, { data: items }, { data: company }] = await Promise.all([
    supabase.from('invoices').select('*, clients(name,email,phone,billing_address)').eq('id', id).maybeSingle(),
    supabase.from('invoice_items').select('*').eq('invoice_id', id),
    supabase.from('companies').select('id,name,address,phone,email,tax_id').maybeSingle(),
  ])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-black/10 bg-black/5 flex items-center justify-center overflow-hidden">
              <Image src="/kryvexis-logo.png" alt="Kryvexis" width={64} height={64} className="h-10 w-10 object-contain" priority />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">{company?.name || 'Kryvexis'}</div>
              <div className="text-xs text-black/60">Invoice</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-semibold">{invoice?.number || ''}</div>
            <div className="text-sm text-black/60">Issue: {invoice?.issue_date || '—'}</div>
            <div className="text-sm text-black/60">Due: {invoice?.due_date || '—'}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="rounded-2xl border border-black/10 p-4">
            <div className="text-xs font-semibold text-black/60">From</div>
            <div className="mt-1 font-medium">{company?.name || 'Kryvexis'}</div>
            {company?.address && <div className="text-sm text-black/70 mt-1">{company.address}</div>}
            <div className="text-sm text-black/70 mt-1">{company?.email || ''}</div>
            <div className="text-sm text-black/70">{company?.phone || ''}</div>
            {company?.tax_id && <div className="text-sm text-black/70 mt-1">Tax: {company.tax_id}</div>}
          </div>

          <div className="rounded-2xl border border-black/10 p-4">
            <div className="text-xs font-semibold text-black/60">Bill To</div>
            <div className="mt-1 font-medium">{(invoice as any)?.clients?.name || '—'}</div>
            {(invoice as any)?.clients?.billing_address && <div className="text-sm text-black/70 mt-1">{(invoice as any).clients.billing_address}</div>}
            <div className="text-sm text-black/70 mt-1">{(invoice as any)?.clients?.email || ''}</div>
            <div className="text-sm text-black/70">{(invoice as any)?.clients?.phone || ''}</div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-black/10">
          <table className="w-full text-sm">
            <thead className="bg-black/5">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Description</th>
                <th className="px-4 py-2 text-right font-semibold">Qty</th>
                <th className="px-4 py-2 text-right font-semibold">Unit</th>
                <th className="px-4 py-2 text-right font-semibold">Line</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((it) => (
                <tr key={it.id} className="border-t border-black/10">
                  <td className="px-4 py-2">{it.description}</td>
                  <td className="px-4 py-2 text-right">{Number(it.qty)}</td>
                  <td className="px-4 py-2 text-right">{fmtZar(Number(it.unit_price))}</td>
                  <td className="px-4 py-2 text-right font-medium">{fmtZar(Number(it.line_total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="space-y-3">
            {invoice?.notes && (
              <div className="rounded-2xl border border-black/10 p-4">
                <div className="text-xs font-semibold text-black/60">Notes</div>
                <div className="text-sm text-black/80 mt-1 whitespace-pre-wrap">{invoice.notes}</div>
              </div>
            )}
            {invoice?.terms && (
              <div className="rounded-2xl border border-black/10 p-4">
                <div className="text-xs font-semibold text-black/60">Terms</div>
                <div className="text-sm text-black/80 mt-1 whitespace-pre-wrap">{invoice.terms}</div>
              </div>
            )}
            <div className="rounded-2xl border border-black/10 p-4">
              <div className="text-xs font-semibold text-black/60">Status</div>
              <div className="mt-1 text-sm">{invoice?.status || '—'}</div>
              <div className="mt-1 text-sm text-black/70">Balance due: <span className="font-medium">{fmtZar(Number(invoice?.balance_due || 0))}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 p-4 h-fit">
            <div className="flex items-center justify-between text-sm"><span className="text-black/60">Subtotal</span><span>{fmtZar(Number(invoice?.subtotal || 0))}</span></div>
            <div className="flex items-center justify-between text-sm mt-2"><span className="text-black/60">Discount</span><span>- {fmtZar(Number(invoice?.discount_total || 0))}</span></div>
            <div className="flex items-center justify-between text-sm mt-2"><span className="text-black/60">Tax</span><span>{fmtZar(Number(invoice?.tax_total || 0))}</span></div>
            <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold">{fmtZar(Number(invoice?.total || 0))}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-black/50">
          Tip: Use your browser print dialog to <span className="font-medium">Save as PDF</span>.
        </div>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}