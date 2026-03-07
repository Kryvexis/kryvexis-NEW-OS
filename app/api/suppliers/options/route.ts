import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'

export async function GET() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()
  const { data, error } = await supabase.from('suppliers').select('id,name').eq('company_id', companyId).order('name', { ascending: true })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, suppliers: data || [] })
}
