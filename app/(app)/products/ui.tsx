'use client'

import { useEffect, useState } from 'react'
import { createProductAction } from './actions'

type SupplierOpt = { id: string; name: string }

export default function ProductsUI() {
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
    return () => { mounted = false }
  }, [])

  return (
    <form
      className="rounded-2xl border border-white/10 bg-white/5 p-4"
      action={async (fd) => {
        setPending(true)
        setMsg(null)
        const res = await createProductAction(fd)
        setPending(false)
        setMsg(res.ok ? 'Product added.' : (res.error ?? 'Something went wrong.'))
      }}
    >
      <div className="text-sm font-semibold">Add product / service</div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <input name="name" required placeholder="Name" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40" />
        <input name="sku" placeholder="SKU" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40" />
        <select name="type" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40">
          <option value="product">Product</option>
          <option value="service">Service</option>
        </select>
        <input name="unit_price" placeholder="Sell price" type="number" step="0.01" min="0" defaultValue="0" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40" />
        <input name="cost_price" placeholder="Cost price" type="number" step="0.01" min="0" defaultValue="0" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40" />
        <select name="supplier_id" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40">
          <option value="">Supplier (optional)</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button disabled={pending} className="kx-button">
          {pending ? 'Saving…' : 'Create'}
        </button>
        {msg && <div className="text-sm text-white/70">{msg}</div>}
      </div>
    </form>
  )
}
