import { NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/automation/log'
import { recommendOrderQty } from '@/lib/buyers/recommend'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const companyId = String(body?.companyId || '')
    if (!companyId) return NextResponse.json({ ok: false, error: 'companyId required' }, { status: 400 })

    const supabase = serviceSupabase()
    const [{ data: products, error: pErr }, { data: suppliers, error: sErr }, { data: sales, error: saleErr }] = await Promise.all([
      supabase
        .from('products')
        .select('id,name,sku,stock_on_hand,low_stock_threshold,preferred_supplier_id,target_stock,pack_size,min_order_qty,company_id')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .limit(5000),
      supabase.from('suppliers').select('id,name,email,company_id').eq('company_id', companyId),
      supabase.from('invoice_items').select('product_id,qty,created_at').limit(50000),
    ])

    if (pErr) throw new Error(pErr.message)
    if (sErr) throw new Error(sErr.message)
    if (saleErr) throw new Error(saleErr.message)

    const supplierMap = new Map((suppliers || []).map((s: any) => [s.id, s]))
    const since = Date.now() - 14 * 864e5
    const sold = new Map<string, number>()
    for (const row of sales || []) {
      const pid = (row as any).product_id
      if (!pid) continue
      const t = Date.parse(String((row as any).created_at || ''))
      if (!Number.isFinite(t) || t < since) continue
      sold.set(pid, (sold.get(pid) || 0) + Number((row as any).qty || 0))
    }

    const grouped = new Map<string, { supplier: any; items: any[] }>()
    for (const p of products || []) {
      const onHand = Number((p as any).stock_on_hand || 0)
      const reorderLevel = Number((p as any).low_stock_threshold || 0)
      if (onHand > reorderLevel) continue
      const rec = recommendOrderQty({
        product: p as any,
        sales: { product_id: (p as any).id, qty: sold.get((p as any).id) || 0, days: 14 },
        leadTimeDays: 4,
        safetyDays: 2,
      })
      if (rec.suggestedQty <= 0) continue
      const supplierId = (p as any).preferred_supplier_id
      const supplier = supplierMap.get(supplierId)
      if (!supplier) continue
      const key = String(supplierId)
      const entry = grouped.get(key) || { supplier, items: [] }
      entry.items.push({
        product_id: (p as any).id,
        description: String((p as any).name || 'Item'),
        qty: Number(rec.suggestedQty),
      })
      grouped.set(key, entry)
    }

    const created: string[] = []
    for (const [, group] of grouped) {
      const subject = `Purchase Order - ${group.supplier.name}`
      const message = ['Hi,', '', 'Please supply the following items:', '', ...group.items.map((i) => `- ${i.description}: ${i.qty}`), '', 'Regards,', 'Kryvexis'].join('\n')
      const { data: po, error: poErr } = await supabase
        .from('purchase_orders')
        .insert({ company_id: companyId, supplier_id: group.supplier.id, subject, to_email: group.supplier.email, message, status: 'draft' })
        .select('id')
        .single()
      if (poErr) throw new Error(poErr.message)
      const rows = group.items.map((i) => ({ company_id: companyId, purchase_order_id: po.id, product_id: i.product_id, description: i.description, qty: i.qty }))
      const { error: itemErr } = await supabase.from('purchase_order_items').insert(rows)
      if (itemErr) throw new Error(itemErr.message)
      created.push(po.id)
    }

    return NextResponse.json({ ok: true, createdCount: created.length, purchaseOrderIds: created })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to generate purchase orders' }, { status: 500 })
  }
}
