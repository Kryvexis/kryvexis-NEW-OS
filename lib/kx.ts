import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const ACTIVE_COMPANY_COOKIE = 'kx_company_id'

async function resolveFirstMembershipCompanyId(supabase: any, uid: string) {
  const { data, error } = await supabase
    .from('company_users')
    .select('company_id,role,created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw error
  return data?.[0]?.company_id as string | undefined
}

async function ensureDefaultCompany(supabase: any, uid: string) {
  // Create a default company + membership for brand new users
  const { data: created, error: createErr } = await supabase
    .from('companies')
    .insert({
      owner_user_id: uid,
      name: 'Kryvexis',
    })
    .select('id')
    .single()

  if (createErr) throw createErr

  // Link user as owner in company_users (best-effort; older schemas may not have unique constraint)
  await supabase.from('company_users').insert({ company_id: created.id, user_id: uid, role: 'owner' })

  return created.id as string
}

/**
 * Returns the current user's active company_id.
 *
 * Enterprise-safe behaviour:
 * - Prefer cookie-selected company if the user is a member (company_users).
 * - Otherwise fall back to the first company_users membership.
 * - If the user has no membership yet, we fall back to owner_user_id company.
 * - If none exists, we auto-create a default company + membership.
 *
 * This fixes cases where a user has multiple companies and RLS is enforced by membership.
 */
export async function requireCompanyId() {
  const supabase = await createClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) throw new Error('Not authenticated')

  const uid = userData.user.id

  // 1) Cookie-selected company, if valid membership
  const cookieStore = await cookies()
  const cookieCompanyId = cookieStore.get(ACTIVE_COMPANY_COOKIE)?.value

  if (cookieCompanyId) {
    const { data: membership, error: mErr } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', uid)
      .eq('company_id', cookieCompanyId)
      .maybeSingle()

    if (!mErr && membership?.company_id) {
      return membership.company_id as string
    }
  }

  // 2) First membership
  const firstMembershipCompanyId = await resolveFirstMembershipCompanyId(supabase, uid)
  if (firstMembershipCompanyId) {
    return firstMembershipCompanyId
  }

  // 3) Legacy fallback: owner_user_id (older installs)
  const { data: ownedCompany, error: ownedErr } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_user_id', uid)
    .maybeSingle()
  if (ownedErr) throw ownedErr
  if (ownedCompany?.id) {
    cookieStore.set(ACTIVE_COMPANY_COOKIE, ownedCompany.id as string, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
    })
    return ownedCompany.id as string
  }

  // 4) Auto-create on first run
  const createdId = await ensureDefaultCompany(supabase, uid)
  cookieStore.set(ACTIVE_COMPANY_COOKIE, createdId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true,
  })
  return createdId
}

/**
 * Returns the current user's company details (active company).
 */
export async function requireCompany() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: company, error } = await supabase
    .from('companies')
    .select('id,name')
    .eq('id', companyId)
    .maybeSingle()

  if (error) throw error
  if (!company?.id) throw new Error('Company not found')

  return { id: company.id as string, name: (company as any).name as string }
}

/**
 * Optional helper: set active company explicitly (server-side).
 * Useful later for a company switcher.
 */
export async function setActiveCompanyId(companyId: string) {
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_COMPANY_COOKIE, companyId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true,
  })
}
