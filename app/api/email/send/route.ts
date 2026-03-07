import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

function optional(name: string) {
  return process.env[name] || ''
}

function required(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64')

async function logEmailEvent(companyId: string | null, eventType: string, meta: Record<string, unknown>) {
  if (!companyId) return
  const url = optional('NEXT_PUBLIC_SUPABASE_URL')
  const key = optional('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return
  try {
    const supabase = createClient(url, key)
    await supabase.from('email_events').insert({ company_id: companyId, event_type: eventType, meta })
  } catch {}
}

async function sendViaBrevo(opts: { to: string; subject: string; html: string; text?: string; attachment?: { name: string; content: string } | null }) {
  const apiKey = required('BREVO_API_KEY')
  const from = required('EMAIL_FROM')
  const body: any = {
    sender: { email: from, name: 'Kryvexis' },
    to: [{ email: opts.to }],
    subject: opts.subject,
    htmlContent: opts.html,
    textContent: opts.text || undefined,
  }
  if (opts.attachment) body.attachments = [opts.attachment]
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Brevo send failed (${res.status})`)
  }
}

async function sendViaSmtp(opts: { to: string; subject: string; html: string; text?: string; attachment?: { name: string; content: string } | null }) {
  const host = required('EMAIL_SMTP_HOST')
  const port = Number(optional('EMAIL_SMTP_PORT') || '587')
  const secure = String(optional('EMAIL_SMTP_SECURE') || '').toLowerCase() === 'true' || port === 465
  const user = required('EMAIL_SMTP_USER')
  const pass = required('EMAIL_SMTP_PASS')
  const from = required('EMAIL_FROM')

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    attachments: opts.attachment ? [{ filename: opts.attachment.name, content: Buffer.from(opts.attachment.content, 'base64') }] : undefined,
  })
}

async function fetchAttachment(attachmentUrl?: string | null, attachmentName?: string | null) {
  if (!attachmentUrl) return null
  const res = await fetch(attachmentUrl)
  if (!res.ok) throw new Error('Could not fetch attachment')
  const buf = Buffer.from(await res.arrayBuffer())
  return {
    name: attachmentName || 'document.pdf',
    content: buf.toString('base64'),
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const companyId = url.searchParams.get('companyId')
    const mode = url.searchParams.get('mode') || 'daily'
    const day = url.searchParams.get('day') || ''

    if (!companyId) {
      return new NextResponse(GIF, {
        headers: { 'content-type': 'image/gif', 'cache-control': 'no-store' },
      })
    }

    await logEmailEvent(companyId, 'open', { mode, day, ua: req.headers.get('user-agent') ?? '' })

    return new NextResponse(GIF, {
      headers: { 'content-type': 'image/gif', 'cache-control': 'no-store' },
    })
  } catch {
    return new NextResponse(GIF, {
      headers: { 'content-type': 'image/gif', 'cache-control': 'no-store' },
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const to = String(body?.to || '').trim()
    const subject = String(body?.subject || '').trim()
    const html = String(body?.html || '').trim()
    const text = String(body?.text || '').trim()
    const companyId = body?.companyId ? String(body.companyId) : null
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    const attachment = await fetchAttachment(body?.attachmentUrl || null, body?.attachmentName || null)
    const htmlBody = html || `<div style="font-family:Arial,sans-serif;white-space:pre-wrap">${text}</div>`

    if (optional('EMAIL_SMTP_HOST') && optional('EMAIL_SMTP_USER') && optional('EMAIL_SMTP_PASS')) {
      await sendViaSmtp({ to, subject, html: htmlBody, text, attachment })
    } else if (optional('BREVO_API_KEY')) {
      await sendViaBrevo({ to, subject, html: htmlBody, text, attachment })
    } else {
      return NextResponse.json({ ok: false, error: 'Email is not configured. Add SMTP or BREVO_API_KEY env vars.' }, { status: 500 })
    }

    await logEmailEvent(companyId, 'sent', { to, subject, attachment: !!attachment })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to send email' }, { status: 500 })
  }
}
