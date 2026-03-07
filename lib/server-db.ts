import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function getAuthedServerClients() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Not authenticated')
  return { supabase, admin: createAdminClient(), user: data.user }
}

export async function detectProductSupplierKey() {
  const admin = createAdminClient()
  if (!admin) return 'preferred_supplier_id' as const
  const { data, error } = await admin.rpc('kx_list_columns', { p_table: 'products' }).single()
  if (!error && Array.isArray((data as any)?.columns)) {
    const cols = (data as any).columns as string[]
    if (cols.includes('supplier_id')) return 'supplier_id' as const
    if (cols.includes('preferred_supplier_id')) return 'preferred_supplier_id' as const
  }
  return 'preferred_supplier_id' as const
}
