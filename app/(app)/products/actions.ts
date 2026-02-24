'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'

const ProductSchema = z.object({
  name: z.string().min(2),
  sku: z.string().optional().or(z.literal('')),
  type: z.enum(['product', 'service']).default('product'),
  unit_price: z.coerce.number().min(0),
  cost_price: z.coerce.number().min(0).default(0),
  supplier_id: z.string().uuid().optional().or(z.literal('')),
})

export async function createProductAction(formData: FormData) {
  const parsed = ProductSchema.safeParse({
    name: formData.get('name'),
    sku: formData.get('sku'),
    type: formData.get('type'),
    unit_price: formData.get('unit_price'),
    cost_price: formData.get('cost_price'),
    supplier_id: formData.get('supplier_id'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { error } = await supabase.from('products').insert({
    company_id: companyId,
    name: parsed.data.name,
    sku: parsed.data.sku || null,
    type: parsed.data.type,
    unit_price: parsed.data.unit_price,
    cost_price: parsed.data.cost_price ?? 0,
    supplier_id: (parsed.data.supplier_id ? parsed.data.supplier_id : null),
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/products')
  return { ok: true }
}

export async function updateProductAction(formData: FormData) {
  const id = String(formData.get('id') || '')
  if (!id) return { ok: false, error: 'Missing product id' }

  const parsed = ProductSchema.safeParse({
    name: formData.get('name'),
    sku: formData.get('sku'),
    type: formData.get('type'),
    unit_price: formData.get('unit_price'),
    cost_price: formData.get('cost_price'),
    supplier_id: formData.get('supplier_id'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { error } = await supabase
    .from('products')
    .update({
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      type: parsed.data.type,
      unit_price: parsed.data.unit_price,
      cost_price: parsed.data.cost_price ?? 0,
      supplier_id: parsed.data.supplier_id ? parsed.data.supplier_id : null,
    })
    .eq('company_id', companyId)
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  return { ok: true }
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get('id') || '')
  if (!id) return { ok: false, error: 'Missing product id' }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('company_id', companyId)
    .eq('id', id)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/products')
  return { ok: true }
}

type ImportRow = {
  name: string
  sku?: string | null
  type?: 'product' | 'service'
  unit_price?: number
  cost_price?: number
  supplier_id?: string | null
}

const ImportSchema = z.array(
  z.object({
    name: z.string().min(2),
    sku: z.string().optional().nullable(),
    type: z.enum(['product', 'service']).optional(),
    unit_price: z.coerce.number().min(0).optional(),
    cost_price: z.coerce.number().min(0).optional(),
    supplier_id: z.string().uuid().optional().nullable(),
  })
)

export async function bulkImportProductsAction(formData: FormData) {
  const raw = String(formData.get('rows') || '')
  if (!raw) return { ok: false, error: 'No rows provided' }

  let rows: ImportRow[] = []
  try {
    rows = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Invalid import payload' }
  }

  const parsed = ImportSchema.safeParse(rows)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid import data' }
  }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const payload = parsed.data.map((r) => ({
    company_id: companyId,
    name: r.name,
    sku: r.sku || null,
    type: r.type ?? 'product',
    unit_price: r.unit_price ?? 0,
    cost_price: r.cost_price ?? 0,
    supplier_id: r.supplier_id ?? null,
  }))

  const { error } = await supabase.from('products').insert(payload)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/products')
  return { ok: true, inserted: payload.length }
}


// explicit re-export for bundlers
export { updateProductAction };
