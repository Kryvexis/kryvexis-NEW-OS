// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import ProductsUI from './ui'
import ProductList from './ProductList'

export default async function ProductsPage() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: products, error } = await supabase
    .from('products')
    .select('id,name,sku,type,unit_price,cost_price,supplier_id,is_active,created_at, suppliers(name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Products</div>
        <div className="text-sm kx-muted">Catalog of products and services.</div>
      </div>

      <ProductsUI />

      {error && <div className="text-sm text-red-200">{error.message}</div>}

      <ProductList products={(products as any) || []} />
    </div>
  )
}
