'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProductAction } from '../actions'

type Product = {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  type: 'product' | 'service'
  unit_price: number
  cost_price: number
  supplier_id: string | null
  is_active?: boolean | null
}

type SupplierOpt = { id: string; name: string }

export default function ProductEditUI({ product }: { product: Product }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierOpt[]>([])

  useEffect(() => {
    let mounted = true
    fetch('/api/suppliers/options')
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return
        if (j?.ok) setSuppliers(j.suppliers || [])
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  return (
    <form
      className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-4"
      action={async (fd) => {
        setPending(true)
        setMsg(null)

        fd.set('id', product.id)
        const res = await updateProductAction(fd)

        setPending(false)
        if (res.ok) router.refresh()
        setMsg(res.ok ? 'Saved.' : res.error ?? 'Something went wrong.')
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs kx-muted mb-1">Name</div>
          <input
            name="name"
            required
            defaultValue={product.name}
            className="w-full rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
          />
        </div>

        <div>
          <div className="text-xs kx-muted mb-1">SKU</div>
          <input
            name="sku"
            defaultValue={product.sku ?? ''}
            className="w-full rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
          />
        </div>

        <div>
          <div className="text-xs kx-muted mb-1">Barcode</div>
          <input
            name="barcode"
            defaultValue={product.barcode ?? ''}
            className="w-full rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
          />
        </div>

        <div>
          <div className="text-xs kx-muted mb-1">Type</div>
          <select
            name="type"
            defaultValue={product.type}
            className="w-full rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div>
          <div className="text-xs kx-muted mb-1">Supplier</div>
          <select
            name="supplier_id"
            defaultValue={product.supplier_id ?? ''}
            className="w-full rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
          >
            <option value="">No supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs kx-muted mb-1">Sell price</div>
          <input
            name="unit_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product.unit_price ?? 0}
            className="w-full rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
          />
        </div>

        <div>
          <div className="text-xs kx-muted mb-1">Cost price</div>
          <input
            name="cost_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product.cost_price ?? 0}
            className="w-full rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
          />
        </div>

        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-xs kx-muted">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={Boolean(product.is_active ?? true)}
              className="h-4 w-4 rounded border border-[rgba(var(--kx-border),.25)] bg-black/30"
            />
            Active
          </label>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button disabled={pending} className="kx-button">
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        {msg && <div className="text-sm kx-muted">{msg}</div>}
      </div>
    </form>
  )
}
