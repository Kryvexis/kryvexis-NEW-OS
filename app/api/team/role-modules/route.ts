import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'

const ROLES = ['owner', 'manager', 'accounts', 'cashier', 'buyer', 'staff'] as const
const MODULES = ['sales', 'procurement', 'accounting', 'operations', 'insights', 'settings'] as const

type Role = (typeof ROLES)[number]
type Module = (typeof MODULES)[number]

function isRole(x: string): x is Role {
  return (ROLES as readonly string[]).includes(x)
}
function isModule(x: string): x is Module {
  return (MODULES as readonly string[]).includes(x)
}

export async function GET() {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let companyId: string
  try {
    companyId = await requireCompanyId()
  } catch {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 })
  }

  // Only owner/manager can view this matrix (since it influences others).
  const { data: me } = await supabase
    .from('company_users')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', u.user.id)
    .maybeSingle()
  const myRole = String(me?.role || '').toLowerCase()
  if (!['owner', 'manager'].includes(myRole)) {
    return NextResponse.json({ error: 'Manager only' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('role_modules')
    .select('role, module, enabled')
    .eq('company_id', companyId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ rows: data || [], roles: ROLES, modules: MODULES })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let companyId: string
  try {
    companyId = await requireCompanyId()
  } catch {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 })
  }

  const { data: me } = await supabase
    .from('company_users')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', u.user.id)
    .maybeSingle()
  const myRole = String(me?.role || '').toLowerCase()
  if (!['owner', 'manager'].includes(myRole)) {
    return NextResponse.json({ error: 'Manager only' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const role = String(body?.role || '').toLowerCase()
  const module = String(body?.module || '').toLowerCase()
  const enabled = Boolean(body?.enabled)

  if (!isRole(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  if (!isModule(module)) return NextResponse.json({ error: 'Invalid module' }, { status: 400 })

  // Managers can't disable owner access.
  if (myRole === 'manager' && role === 'owner') {
    return NextResponse.json({ error: 'Only owner can edit owner access' }, { status: 403 })
  }

  const { error } = await supabase
    .from('role_modules')
    .upsert(
      { company_id: companyId, role, module, enabled, updated_at: new Date().toISOString() },
      { onConflict: 'company_id,role,module' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
