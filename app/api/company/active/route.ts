import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setActiveCompanyId } from '@/lib/kx'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const companyId = String(body?.companyId || '')
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })

  // Ensure membership (enterprise-safe)
  const { data: membership, error } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', user.id)
    .eq('company_id', companyId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!membership?.company_id) return NextResponse.json({ error: 'Not a member of that company' }, { status: 403 })

  await setActiveCompanyId(companyId)
  return NextResponse.json({ ok: true })
}
