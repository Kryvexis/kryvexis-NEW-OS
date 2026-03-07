import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function required(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: process.env.KX_TIMEZONE || 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(required('NEXT_PUBLIC_SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'))
    const today = todayISO()
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id,number,company_id,clients(email,name),due_date,balance_due,status')
      .lt('due_date', today)
      .in('status', ['Sent', 'Partially Paid', 'Overdue'])
      .limit(100)

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

    const sent: string[] = []
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
    for (const inv of invoices || []) {
      const email = (inv as any)?.clients?.email
      if (!email || !baseUrl) continue
      const res = await fetch(`${baseUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          companyId: (inv as any).company_id,
          to: email,
          subject: `Invoice ${(inv as any).number || ''} is overdue`,
          text: `Hello ${(inv as any)?.clients?.name || ''},\n\nThis is a reminder that invoice ${(inv as any).number || ''} is overdue. Outstanding balance: ${(inv as any).balance_due || 0}.\n\nRegards,\nKryvexis`,
          html: `<div style="font-family:Arial,sans-serif">Hello ${(inv as any)?.clients?.name || ''},<br/><br/>This is a reminder that invoice <strong>${(inv as any).number || ''}</strong> is overdue.<br/>Outstanding balance: <strong>${(inv as any).balance_due || 0}</strong>.<br/><br/>Regards,<br/>Kryvexis</div>`
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.ok) sent.push((inv as any).id)
    }

    return NextResponse.json({ ok: true, sent: sent.length })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed' }, { status: 500 })
  }
}
