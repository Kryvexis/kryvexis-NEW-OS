import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  const user = u.user
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let companyId: string
  try {
    companyId = await requireCompanyId()
  } catch {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const targetUserId = String(body?.user_id || '').trim()
  const role = String(body?.role || '').trim().toLowerCase()

  if (!targetUserId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  if (!["owner", "manager", "accounts", "cashier", "buyer", "staff"].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Only owner/manager may change roles.
  const { data: me } = await supabase
    .from('company_users')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .maybeSingle()

  const myRole = String(me?.role || '').toLowerCase()
  if (!['owner', 'manager'].includes(myRole)) {
    return NextResponse.json({ error: 'Manager only' }, { status: 403 })
  }

  // Managers can't promote to owner.
  if (myRole === 'manager' && role === 'owner') {
    return NextResponse.json({ error: 'Only owner can assign owner role' }, { status: 403 })
  }

  const { error } = await supabase
    .from('company_users')
    .update({ role })
    .eq('company_id', companyId)
    .eq('user_id', targetUserId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
