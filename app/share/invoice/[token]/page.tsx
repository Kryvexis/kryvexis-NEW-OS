import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import ShareShell from '@/components/share/share-shell'
import { Card } from '@/components/card'
import { StatusBadge } from '@/components/share/status-badge'

export const dynamic = 'force-dynamic'

export default async function ShareInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;


  const admin = createAdminClient()
  if (!admin) {
    return (
      <ShareShell company={null} title="Share link not enabled" subtitle="Missing server configuration. Add SUPABASE_SERVICE_ROLE_KEY to enable public share links.">
        <Card>
          <div className="text-sm text-white/70">
            This share page needs a server-only Supabase service role key (or public RLS policies) to load documents for anonymous users.
          </div>
          <div className="mt-4 text-sm text-white/60">
            Fix: add <span className="text-white/80">SUPABASE_SERVICE_ROLE_KEY</span> in Vercel Environment Variables.
          </div>
        </Card>
      </ShareShell>
    )
  }

  const { data: invoice, error } = await admin
    .from('invoices')
    .select('id,number,status,issue_date,due_date,notes,terms,subtotal,discount_total,tax_total,total,balance_due, company_id, clients(name,email,phone), companies(name,logo_url,email,phone)')
    .eq('public_token', token)
    .maybeSingle()

  if (error || !invoice) return notFound()

  const { data: items } = await admin
    .from('invoice_items')
    .select('id,description,qty,unit_price,discount,line_total')
    .eq('invoice_id', invoice.id)

  const company = (invoice as any).companies ?? null
  const client = (invoice as any).clients ?? null

  return (
    <ShareShell
      company={company}
      title={`Invoice ${invoice.number ?? ''}`}
      subtitle={`Issued to ${client?.name ?? 'Client'}`}
    >
      <div className="grid gap-6 md:grid-cols-[1.6fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-white/60 text-sm">Balance due</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight text-white">R {Number(invoice.balance_due ?? 0).toFixed(2)}</div>
              <div className="mt-3">
                <StatusBadge status={invoice.status ?? 'Draft'} />
              </div>
            </div>

            <div className="text-right text-xs text-white/55">
              <div>Issue date: <span className="text-white/75">{invoice.issue_date ?? '-'}</span></div>
              <div className="mt-1">Due: <span className="text-white/75">{invoice.due_date ?? '-'}</span></div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Item</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Unit</th>
                  <th className="px-4 py-3 text-right font-medium">Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(items ?? []).map((it: any) => (
                  <tr key={it.id} className="text-white/80">
                    <td className="px-4 py-3">{it.description}</td>
                    <td className="px-4 py-3 text-right">{it.qty}</td>
                    <td className="px-4 py-3 text-right">R {Number(it.unit_price ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">R {Number(it.line_total ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(invoice.notes || invoice.terms) ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {invoice.notes ? (
                <div>
                  <div className="text-xs text-white/55">Notes</div>
                  <div className="mt-2 text-sm text-white/75 whitespace-pre-wrap">{invoice.notes}</div>
                </div>
              ) : null}
              {invoice.terms ? (
                <div>
                  <div className="text-xs text-white/55">Terms</div>
                  <div className="mt-2 text-sm text-white/75 whitespace-pre-wrap">{invoice.terms}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="text-sm text-white/60">Client</div>
            <div className="mt-2 text-white font-medium">{client?.name ?? '-'}</div>
            <div className="mt-2 text-sm text-white/65">{client?.email ?? ''}</div>
            <div className="mt-1 text-sm text-white/65">{client?.phone ?? ''}</div>
          </Card>

          <Card>
            <div className="text-sm text-white/60">Need help?</div>
            <div className="mt-2 text-sm text-white/75">{company?.email ?? 'kryvexissolutions@gmail.com'}</div>
            <div className="mt-1 text-sm text-white/75">WhatsApp +27 68 628 2874</div>
            <div className="mt-4">
              <Link href="/" className="kx-btn kx-btn-primary w-full justify-center">Open Kryvexis</Link>
            </div>
          </Card>
        </div>
      </div>
    </ShareShell>
  )
}
