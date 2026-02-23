import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'

function csvEscape(v: any) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()
  const { data, error } = await supabase
    .from('transactions')
    .select('kind,amount,category,memo,tx_date,created_at')
    .eq('company_id', companyId)
    .order('tx_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

  const rows = data || []
  const header = ['kind','amount','category','memo','tx_date','created_at']
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(header.map((k)=>csvEscape((r as any)[k])).join(','))
  }
  const csv = lines.join('\n')
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="kryvexis-transactions.csv"',
    },
  })
}
