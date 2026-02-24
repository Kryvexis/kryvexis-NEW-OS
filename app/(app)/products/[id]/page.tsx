import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import EditProductUI from './ui'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: product } = await supabase
    .from('products')
    .select('id,name,sku,type,unit_price,cost_price,supplier_id,is_active')
    .eq('company_id', companyId)
    .eq('id', params.id)
    .maybeSingle()

  if (!product) return notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Edit product</div>
          <div className="text-sm text-white/60">Update details, prices, and supplier.</div>
        </div>
        <Link href="/products" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
          Back
        </Link>
      </div>

      <EditProductUI product={product} />
    </div>
  )
}
