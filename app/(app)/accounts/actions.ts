'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'

const TxSchema = z.object({
  kind: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive(),
  category: z.string().optional().or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
  tx_date: z.string().optional().or(z.literal('')),
})

export async function createTransactionAction(formData: FormData) {
  const parsed = TxSchema.safeParse({
    kind: formData.get('kind'),
    amount: formData.get('amount'),
    category: formData.get('category'),
    memo: formData.get('memo'),
    tx_date: formData.get('tx_date'),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { error } = await supabase.from('transactions').insert({
    company_id: companyId,
    kind: parsed.data.kind,
    amount: parsed.data.amount,
    category: parsed.data.category || null,
    memo: parsed.data.memo || null,
    tx_date: parsed.data.tx_date ? parsed.data.tx_date : null,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return { ok: true }
}
