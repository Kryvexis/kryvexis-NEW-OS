import { createClient } from '@/lib/supabase/server'

/**
 * Returns the current user's company_id.
 * If the user has no company row yet (common when Auth user existed before running schema.sql),
 * we create a default company automatically.
 */
export async function requireCompanyId() {
  const supabase = await createClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) throw new Error('Not authenticated')

  const uid = userData.user.id

  const { data: company, error } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_user_id', uid)
    .maybeSingle()

  if (error) throw error
  if (company?.id) return company.id as string

  // Auto-create on first run
  const { data: created, error: createErr } = await supabase
    .from('companies')
    .insert({
      owner_user_id: uid,
      name: 'Kryvexis',
    })
    .select('id')
    .single()

  if (createErr) throw createErr
  return created.id as string
}
