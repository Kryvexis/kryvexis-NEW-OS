import { NextResponse } from 'next/server'
import { requireCompanyId } from '@/lib/kx'
import { getAuthedServerClients } from '@/lib/server-db'

export async function GET() {
  try {
    const { supabase, admin } = await getAuthedServerClients()
    const companyId = await requireCompanyId()
    const db = admin ?? supabase
    const { data, error } = await db.from('suppliers').select('id,name').eq('company_id', companyId).order('name', { ascending: true })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, suppliers: data || [], used_admin: Boolean(admin) })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to load suppliers' }, { status: 500 })
  }
}
