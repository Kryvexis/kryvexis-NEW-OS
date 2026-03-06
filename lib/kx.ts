import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
export async function getCompanyIdOrNull(): Promise<string | null> {
  const supabase = await createClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) return null

  const uid = userData.user.id
  const cookieCompanyId = await readActiveCompanyCookie()

  // Membership list (preferred)
  // IMPORTANT: do NOT join companies here. In a fresh tenant setup, RLS on companies
  // can block the join and cause an error, which would incorrectly make companyId null.
  // We only need company_id to choose an active workspace.
  const { data: memberships, error: mErr } = await supabase
    .from('company_users')
    .select('company_id, role')
    .eq('user_id', uid)

  if (mErr) {
    // As a last resort, try a minimal query (some setups may restrict column-level access)
    const { data: memberships2, error: mErr2 } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', uid)
    if (mErr2) return null
    const ids2 = (memberships2 || []).map((m: any) => m.company_id as string).filter(Boolean)
    if (cookieCompanyId && ids2.includes(cookieCompanyId)) return cookieCompanyId
    if (ids2.length > 0) return ids2[0]
    return null
  }

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

  if (oErr) return null
  if (owned && owned.length > 0) return owned[0].id as string

  return null
}

export async function requireCompanyId() {
  const companyId = await getCompanyIdOrNull()
  if (!companyId) redirect('/account-center?setup=1')
  return companyId
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

