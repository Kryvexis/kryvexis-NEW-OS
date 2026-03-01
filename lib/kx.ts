import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const COOKIE_KEYS = [
  'kx_active_company',
  'kx_active_company_id',
  'active_company_id',
  'ACTIVE_COMPANY_ID',
]

async function readActiveCompanyCookie(): Promise<string | null> {
  try {
    const store = await cookies()
    for (const key of COOKIE_KEYS) {
      const v = store.get(key)?.value
      if (v) return v
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * Returns the current user's company_id (enterprise-safe).
 *
 * Selection order:
 * 1) Cookie-selected company_id IF the user is a member (company_users)
 * 2) First membership company_id (company_users)
 * 3) First owned company (companies.owner_user_id) as a fallback
 *
 * This avoids RLS insert failures by ensuring we return a company the user belongs to.
 * IMPORTANT: We do not set cookies here (Server Components can't reliably set cookies).
 * Cookie is set via /api/company/active (client action).
 */
export async function requireCompanyId() {
  const supabase = await createClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) throw new Error('Not authenticated')

  const uid = userData.user.id
  const cookieCompanyId = await readActiveCompanyCookie()

  // Membership list (preferred)
  const { data: memberships, error: mErr } = await supabase
    .from('company_users')
    .select('company_id, role, companies(name)')
    .eq('user_id', uid)

  if (mErr) throw mErr

  const memberCompanyIds = (memberships || [])
    .map((m: any) => m.company_id as string)
    .filter(Boolean)

  if (cookieCompanyId && memberCompanyIds.includes(cookieCompanyId)) {
    return cookieCompanyId
  }

  if (memberCompanyIds.length > 0) {
    return memberCompanyIds[0]
  }

  // Fallback: owned companies (older schema / legacy users)
  const { data: owned, error: oErr } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_user_id', uid)
    .limit(1)

  if (oErr) throw oErr
  if (owned && owned.length > 0) return owned[0].id as string

  // Nothing found — user needs to create a company
  throw new Error('No company found for user. Please create a company in Account Center.')
}

export async function requireCompany() {
  const supabase = await createClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) throw new Error('Not authenticated')

  const uid = userData.user.id
  const companyId = await requireCompanyId()

  // Try fetch company name
  const { data: company, error } = await supabase
    .from('companies')
    .select('id,name')
    .eq('id', companyId)
    .maybeSingle()

  if (error) throw error
  if (company?.id) return { id: company.id as string, name: (company as any).name as string }

  // Fallback name
  return { id: companyId, name: 'Kryvexis' }
}


export async function setActiveCompanyId(companyId: string) {
  const store = await cookies()
  // Write a single canonical cookie (others kept for backward compatibility)
  store.set('kx_active_company_id', companyId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  })
  // Back-compat keys (non-breaking)
  store.set('kx_active_company', companyId, { path: '/', httpOnly: true, sameSite: 'lax', secure: true })
  store.set('active_company_id', companyId, { path: '/', httpOnly: true, sameSite: 'lax', secure: true })
}

