import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import InvoiceBuilder from '@/components/invoice-builder'

export default async function Page() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: clients }, { data: products }] = await Promise.all([
    supabase.from('clients').select('id,name').eq('company_id', companyId).order('name'),
    supabase.from('products').select('id,name,unit_price,sku').eq('company_id', companyId).eq('is_active', true).order('name'),
  ])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">New Invoice</div>
        <div className="text-sm kx-muted">Create an invoice, record payments, and print to PDF.</div>
      </div>

      {(!clients?.length || !products?.length) && (
        <div className="kx-card p-4 text-sm kx-muted">
          <div className="font-semibold">Quick setup</div>
          <div className="mt-1 kx-muted">To build invoices you need at least 1 client and 1 product.</div>
        </div>
      )}

      <InvoiceBuilder clients={(clients as any) || []} products={(products as any) || []} />
    </div>
  )
}
