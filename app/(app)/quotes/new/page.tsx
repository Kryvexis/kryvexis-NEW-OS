import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import QuoteBuilder from '@/components/quote-builder'

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
        <div className="text-2xl font-semibold tracking-tight">New Quote</div>
        <div className="text-sm text-white/60">Create a quote quickly, then convert it to an invoice.</div>
      </div>

      {(!clients?.length || !products?.length) && (
        <div className="kx-card p-4 text-sm text-white/70">
          <div className="font-semibold">Quick setup</div>
          <div className="mt-1 text-white/60">To build quotes you need at least 1 client and 1 product.</div>
        </div>
      )}

      <QuoteBuilder clients={(clients as any) || []} products={(products as any) || []} />
    </div>
  )
}
