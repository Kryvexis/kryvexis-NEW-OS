import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import ProductsUI from './ui'

function money(n: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n)
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: products, error } = await supabase
    .from('products')
    .select('id,name,sku,type,unit_price,cost_price,supplier_id,is_active,created_at, suppliers(name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Products</div>
        <div className="text-sm text-white/60">Catalog of products and services.</div>
      </div>

      <ProductsUI />

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-sm font-semibold">All items</div>
          {error && <div className="text-sm text-red-200 mt-1">{error.message}</div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Sell</th>
                <th className="text-right px-4 py-3">Cost</th>
                <th className="text-right px-4 py-3">Margin</th>
                <th className="text-left px-4 py-3">Supplier</th>
              </tr>
            </thead>
            <tbody>
              {(products ?? []).map((p: any) => {
                const sell = Number(p.unit_price ?? 0)
                const cost = Number(p.cost_price ?? 0)
                const margin = sell - cost
                return (
                  <tr key={p.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-white/70">{p.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-white/70">{p.type}</td>
                    <td className="px-4 py-3 text-right text-white/70">{money(sell)}</td>
                    <td className="px-4 py-3 text-right text-white/70">{money(cost)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{money(margin)}</td>
                    <td className="px-4 py-3 text-white/70">{p.suppliers?.name ?? '—'}</td>
                  </tr>
                )
              })}
              {(products ?? []).length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-white/60" colSpan={7}>
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
