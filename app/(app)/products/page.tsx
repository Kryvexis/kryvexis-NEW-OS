import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import ProductsUI from './ui'
import ProductList from './ProductList'
import { Page } from '@/components/ui/page'

export default async function ProductsPage() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: products, error }, { data: suppliers }] = await Promise.all([
    supabase
      .from('products')
      .select('id,name,sku,type,unit_price,cost_price,supplier_id,preferred_supplier_id,is_active,created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('suppliers')
      .select('id,name')
      .eq('company_id', companyId)
      .limit(2000),
  ])

  const supplierMap = new Map((suppliers || []).map((s: any) => [s.id, s.name]))
  const normalized = (products || []).map((p: any) => ({
    ...p,
    supplier_name: supplierMap.get(p.supplier_id || p.preferred_supplier_id || '') || null,
  }))

  return (
    <Page title="Products" subtitle="Catalog of products and services.">
      <ProductsUI />
      {error && <div className="text-sm" style={{ color: 'rgb(220 38 38)' }}>{error.message}</div>}
      <ProductList products={normalized as any} />
    </Page>
  )
}
