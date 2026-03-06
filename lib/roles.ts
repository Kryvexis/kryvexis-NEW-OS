import { createClient } from '@/lib/supabase/server'
import { getCompanyIdOrNull } from '@/lib/kx'
import { normalizeRole, type UserRole } from '@/lib/roles/shared'

// Server-only role resolver for the current signed-in user.
export async function getCurrentUserRole(): Promise<UserRole> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data?.user) return 'staff'

  // IMPORTANT: Do NOT redirect from the role resolver.
  // This function is called from the (app) layout (which also wraps /account-center).
  // Redirecting here causes ERR_TOO_MANY_REDIRECTS for users who haven't selected/created a company yet.
  const companyId = await getCompanyIdOrNull()
  if (!companyId) return 'staff'

  const { data: row } = await supabase
    .from('company_users')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', data.user.id)
    .maybeSingle()

  return normalizeRole(row?.role)
}
