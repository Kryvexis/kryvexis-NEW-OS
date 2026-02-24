'use client'

import { useEffect, useState } from 'react'
import { bulkImportProductsAction, createProductAction } from './actions'

type SupplierOpt = { id: string; name: string }

export default function ProductsUI() {
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierOpt[]>([])
  const [importPending, setImportPending] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  function parseCSV(text: string) {
    // Simple CSV parser (supports commas + quoted fields). First row is headers.
    const rows: string[][] = []
    let cur = ''
    let row: string[] = []
    let inQuotes = false
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      const next = text[i + 1]
      if (ch === '"') {
        if (inQuotes && next === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
        continue
      }
      if (!inQuotes && (ch === ',' || ch === '\n' || ch === '\r')) {
        if (ch === ',') {
          row.push(cur.trim())
          cur = ''
        } else {
          if (ch === '\r' && next === '\n') {
            // windows newline
            i++
          }
          row.push(cur.trim())
          cur = ''
          if (row.some((v) => v.length > 0)) rows.push(row)
          row = []
        }
        continue
      }
      cur += ch
    }
    row.push(cur.trim())
    if (row.some((v) => v.length > 0)) rows.push(row)

    if (rows.length < 2) return []
    const headers = rows[0].map((h) => h.toLowerCase())
    const idx = (name: string) => headers.indexOf(name)
    const out: any[] = []
    for (const r of rows.slice(1)) {
      const name = r[idx('name')] ?? ''
      if (!name) continue
      out.push({
        name,
        sku: r[idx('sku')] || null,
        type: (r[idx('type')] as any) || 'product',
        unit_price: Number(r[idx('unit_price')] ?? r[idx('sell')] ?? 0) || 0,
        cost_price: Number(r[idx('cost_price')] ?? r[idx('cost')] ?? 0) || 0,
      })
    }
    return out
  }

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
    <div className="space-y-4">
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

      <form
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
        action={async (fd) => {
          setImportPending(true)
          setImportMsg(null)
          const res: any = await bulkImportProductsAction(fd)
          setImportPending(false)
          setImportMsg(res.ok ? `Imported ${res.inserted ?? 0} item(s).` : (res.error ?? 'Import failed.'))
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Bulk import (CSV)</div>
            <div className="text-xs text-white/60 mt-0.5">Columns: name, sku, type, unit_price, cost_price</div>
          </div>
          <a
            className="text-xs text-cyan-200/90 hover:text-cyan-200"
            href="data:text/csv;charset=utf-8,name,sku,type,unit_price,cost_price%0ASpanner,SPN-01,product,120,80%0ALabour,LAB-01,service,450,0"
            download="kryvexis-products-template.csv"
          >
            Download template
          </a>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/60">Upload CSV</div>
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:px-3 file:py-2 file:text-xs file:text-white/80 hover:file:bg-white/10"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const text = await f.text()
                const rows = parseCSV(text)
                const el = document.getElementById('kx_products_rows') as HTMLInputElement | null
                if (el) el.value = JSON.stringify(rows)
                setImportMsg(rows.length ? `${rows.length} row(s) ready to import.` : 'No valid rows found.')
              }}
            />
            <div className="mt-2 text-xs text-white/50">Tip: Keep type as “product” or “service”.</div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Or paste CSV here</div>
            <textarea
              placeholder="name,sku,type,unit_price,cost_price\nSpanner,SPN-01,product,120,80"
              className="h-[120px] w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
              onBlur={(e) => {
                const rows = parseCSV(e.target.value)
                const el = document.getElementById('kx_products_rows') as HTMLInputElement | null
                if (el) el.value = JSON.stringify(rows)
                setImportMsg(rows.length ? `${rows.length} row(s) ready to import.` : 'No valid rows found.')
              }}
            />
          </div>
        </div>

        <input id="kx_products_rows" name="rows" type="hidden" />

        <div className="mt-3 flex items-center gap-3">
          <button disabled={importPending} className="kx-button">
            {importPending ? 'Importing…' : 'Import'}
          </button>
          {importMsg && <div className="text-sm text-white/70">{importMsg}</div>}
        </div>
      </form>
    </div>
  )
}
