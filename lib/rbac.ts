import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { normalizeRole, type AppModule, type UserRole } from '@/lib/roles/shared'

export const ALL_MODULES: readonly AppModule[] = ['sales', 'procurement', 'accounting', 'operations', 'insights', 'settings'] as const

export function defaultModulesForRole(role: UserRole): AppModule[] {
  if (role === 'owner' || role === 'manager') return [...ALL_MODULES]
  if (role === 'accounts') return ['accounting', 'sales', 'settings']
  if (role === 'buyer') return ['procurement', 'operations', 'settings']
  if (role === 'cashier') return ['sales']
  return ['sales']
}

export type AccessContext = {
  userId: string | null
  companyId: string | null
  role: UserRole
  modules: AppModule[]
}

/**
 * Resolve the signed-in user's role + enabled modules for the active company.
 *
 * Safe defaults:
 * - signed out → role=staff, modules=['sales']
 * - missing membership → role=staff, modules=['sales']
 * - missing role_modules rows → defaultModulesForRole(role)
 */
export async function getAccessContext(): Promise<AccessContext> {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  const user = u?.user
  if (!user) {
    return { userId: null, companyId: null, role: 'staff', modules: ['sales'] }
  }

  let companyId: string | null = null
  try {
    companyId = await requireCompanyId()
  } catch {
    // No valid company cookie/membership; leave null and fall back.
    return { userId: user.id, companyId: null, role: 'staff', modules: ['sales'] }
  }

  const { data: me } = await supabase
    .from('company_users')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .maybeSingle()

  const role = normalizeRole(me?.role)

  if (role === 'owner' || role === 'manager') {
    return { userId: user.id, companyId, role, modules: [...ALL_MODULES] }
  }

  const { data: rows } = await supabase
    .from('role_modules')
    .select('module, enabled')
    .eq('company_id', companyId)
    .eq('role', role)

  const enabled = (rows || [])
    .filter((r: any) => r?.enabled)
    .map((r: any) => String(r.module).toLowerCase())
    .filter(Boolean) as AppModule[]

  const modules = enabled.length ? enabled : defaultModulesForRole(role)
  return { userId: user.id, companyId, role, modules }
}
