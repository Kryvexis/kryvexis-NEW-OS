import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setActiveCompanyId } from '@/lib/kx'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || 'Kryvexis Workspace').slice(0, 120)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in env' },
      { status: 500 }
    )
  }

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const admin = createAdminClient(url, service, { auth: { persistSession: false } })

  // If membership already exists, pick first company and activate it.
  const { data: existingMembership } = await admin
    .from('company_users')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existingMembership?.company_id) {
    await setActiveCompanyId(existingMembership.company_id as string)
    return NextResponse.json({ ok: true, companyId: existingMembership.company_id })
  }

  // Create company
  const { data: company, error: cErr } = await admin
    .from('companies')
    .insert({ name, owner_user_id: user.id })
    .select('id')
    .maybeSingle()

  if (cErr || !company?.id) {
    return NextResponse.json({ error: cErr?.message || 'Failed to create company' }, { status: 400 })
  }

  const companyId = company.id as string

  // Create membership
  const { error: mErr } = await admin.from('company_users').insert({
    company_id: companyId,
    user_id: user.id,
    role: 'owner',
  })

  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 400 })
  }

  await setActiveCompanyId(companyId)
  return NextResponse.json({ ok: true, companyId })
}
