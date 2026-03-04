import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole, type UserRole } from '@/lib/roles/shared'
import { MODULES, type AppModule } from '@/lib/rbac-shared'

export type AccessContext = {
  userId: string | null
  companyId: string | null
  role: UserRole
  modules: AppModule[]
}

const COOKIE_KEYS = ['kx_active_company_id', 'kx_active_company', 'active_company_id', 'ACTIVE_COMPANY_ID']

function defaultModulesForRole(role: UserRole): AppModule[] {
  if (role === 'owner' || role === 'manager') return [...MODULES]
  if (role === 'cashier' || role === 'staff') return ['sales', 'settings']
  if (role === 'buyer') return ['procurement', 'operations', 'settings']
  if (role === 'accounts') return ['accounting', 'settings']
  return ['sales', 'settings']
}

async function readCookieCompanyId() {
  const store = await cookies()
  for (const key of COOKIE_KEYS) {
    const value = store.get(key)?.value
    if (value) return value
  }
  return null
}

export async function getAccessContext(): Promise<AccessContext> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) {
    return { userId: null, companyId: null, role: 'staff', modules: defaultModulesForRole('staff') }
  }

  let companyId: string | null = null
  const cookieCompanyId = await readCookieCompanyId()

  const { data: memberships } = await supabase
    .from('company_users')
    .select('company_id, role')
    .eq('user_id', user.id)

  if (memberships && memberships.length > 0) {
    const validCompanyIds = memberships.map((m: any) => m.company_id as string).filter(Boolean)
    companyId = cookieCompanyId && validCompanyIds.includes(cookieCompanyId) ? cookieCompanyId : validCompanyIds[0]
  } else {
    // Auto-join single-tenant workspace fallback.
    const { data: companies } = await supabase.from('companies').select('id').limit(2)
    if (companies && companies.length === 1) {
      companyId = companies[0].id as string
      await supabase.from('company_users').upsert({ company_id: companyId, user_id: user.id, role: 'staff' }, { onConflict: 'company_id,user_id' })
    }
  }

  if (!companyId) {
    return { userId: user.id, companyId: null, role: 'staff', modules: defaultModulesForRole('staff') }
  }

  const myMembership = (memberships || []).find((m: any) => m.company_id === companyId)
  const role = normalizeRole(myMembership?.role)

  const { data: moduleRows } = await supabase
    .from('role_modules')
    .select('module, enabled')
    .eq('company_id', companyId)
    .eq('role', role)

  const enabled = (moduleRows || [])
    .filter((r: any) => !!r.enabled)
    .map((r: any) => String(r.module))
    .filter((x): x is AppModule => (MODULES as readonly string[]).includes(x))

  return {
    userId: user.id,
    companyId,
    role,
    modules: enabled.length ? enabled : defaultModulesForRole(role),
  }
}

