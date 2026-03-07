import { NextResponse } from 'next/server'
import { serviceSupabase, logEmailEvent } from '@/lib/automation/log'
import { sendAppEmail } from '@/lib/automation/mailer'
import { shareInvoiceUrl } from '@/lib/share'

export const runtime = 'nodejs'

function todayISO(timeZone = 'Africa/Johannesburg') {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970'
  const m = parts.find((p) => p.type === 'month')?.value ?? '01'
  const d = parts.find((p) => p.type === 'day')?.value ?? '01'
  return `${y}-${m}-${d}`
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = serviceSupabase()
    const today = todayISO(process.env.KX_TIMEZONE || 'Africa/Johannesburg')
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id,company_id,number,due_date,balance_due,total,public_token,clients(name,email),companies(name)')
      .lt('due_date', today)
      .in('status', ['Sent', 'Partially Paid', 'Overdue'])
      .not('clients.email', 'is', null)
      .limit(200)

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

    let sent = 0
    let failed = 0
    const failures: Array<{ invoiceId: string; error: string }> = []

    for (const inv of invoices || []) {
      try {
        const client = (inv as any).clients || {}
        const company = (inv as any).companies || {}
        const viewPath = inv.public_token ? shareInvoiceUrl(inv.public_token) : `/invoices/${inv.id}`
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
        const fullUrl = baseUrl ? `${baseUrl}${viewPath}` : viewPath
        const subject = `Reminder: Invoice ${inv.number} is overdue`
        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
            <h2 style="margin:0 0 12px">Invoice ${inv.number} is overdue</h2>
            <p>Hi ${(client.name || 'there')},</p>
            <p>This is a friendly reminder that invoice <strong>${inv.number}</strong> is overdue.</p>
            <p><strong>Balance due:</strong> R ${Number(inv.balance_due ?? inv.total ?? 0).toFixed(2)}</p>
            <p><a href="${fullUrl}">Open invoice</a></p>
            <p>Kind regards,<br/>${company.name || 'Kryvexis'}</p>
          </div>`
        const text = `Hi ${(client.name || 'there')},\n\nInvoice ${inv.number} is overdue. Balance due: R ${Number(inv.balance_due ?? inv.total ?? 0).toFixed(2)}\nOpen invoice: ${fullUrl}\n\nKind regards,\n${company.name || 'Kryvexis'}`
        await sendAppEmail({ to: String(client.email), subject, html, text })
        await logEmailEvent({ companyId: inv.company_id, eventType: 'overdue_reminder', recipient: String(client.email), entityType: 'invoice', entityId: inv.id, meta: { number: inv.number, due_date: inv.due_date } })
        sent++
      } catch (e: any) {
        failed++
        failures.push({ invoiceId: String(inv.id), error: e?.message || 'send failed' })
      }
    }

    return NextResponse.json({ ok: true, sent, failed, failures })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
