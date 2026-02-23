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
