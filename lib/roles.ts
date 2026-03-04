import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { normalizeRole, resolveEnabledModules, type AppModule, type UserRole } from '@/lib/roles/shared'

// Server-only role resolver for the current signed-in user.
export async function getCurrentUserRole(): Promise<UserRole> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data?.user) return 'staff'

  const companyId = await requireCompanyId()
  const { data: row } = await supabase
    .from('company_users')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', data.user.id)
    .maybeSingle()

  return normalizeRole(row?.role)
}

export async function getCurrentUserModules(role: UserRole): Promise<AppModule[]> {
  if (role === 'owner' || role === 'manager') return resolveEnabledModules(role)

  const supabase = await createClient()
  const companyId = await requireCompanyId()
  const { data } = await supabase
    .from('role_modules')
    .select('module, enabled')
    .eq('company_id', companyId)
    .eq('role', role)

  return resolveEnabledModules(role, data || [])
}
