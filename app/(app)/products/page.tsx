// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { detectProductSupplierKey } from '@/lib/server-db'
import ProductsUI from './ui'
import ProductList from './ProductList'
import { Page } from '@/components/ui/page'

export default async function ProductsPage() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()
  const supplierKey = await detectProductSupplierKey()
  const productSelect = supplierKey === 'supplier_id'
    ? 'id,name,sku,type,unit_price,cost_price,supplier_id,is_active,created_at'
    : 'id,name,sku,type,unit_price,cost_price,preferred_supplier_id,is_active,created_at'

  const [{ data: products, error }, { data: suppliers }] = await Promise.all([
    supabase.from('products').select(productSelect).eq('company_id', companyId).order('created_at', { ascending: false }).limit(500),
    supabase.from('suppliers').select('id,name').eq('company_id', companyId).limit(2000),
  ])

  const supplierMap = new Map((suppliers || []).map((s: any) => [s.id, s.name]))
  const rows = ((products as any[]) || []).map((p) => {
    const linkedSupplierId = supplierKey === 'supplier_id' ? p.supplier_id ?? null : p.preferred_supplier_id ?? null
    return {
      ...p,
      supplier_id: linkedSupplierId,
      suppliers: linkedSupplierId ? { name: supplierMap.get(linkedSupplierId) || null } : null,
    }
  })

  return (
    <Page title="Products" subtitle="Catalog of products and services.">
      <ProductsUI />
      {error && <div className="text-sm" style={{ color: 'rgb(220 38 38)' }}>{error.message}</div>}
      <ProductList products={rows || []} />
    </Page>
  )
}
