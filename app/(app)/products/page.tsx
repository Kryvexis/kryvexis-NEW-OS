// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import ProductsUI from './ui'
import ProductList from './ProductList'
import { Page } from '@/components/ui/page'

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
    <Page title="Products" subtitle="Catalog of products and services.">
      <ProductsUI />
      {error && <div className="text-sm" style={{ color: 'rgb(220 38 38)' }}>{error.message}</div>}
      <ProductList products={(products as any) || []} />
    </Page>
  )
}
