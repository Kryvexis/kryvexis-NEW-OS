import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAppEmail } from '@/lib/automation/mailer'
import { logEmailEvent } from '@/lib/automation/log'

export const runtime = 'nodejs'

function env(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64')

async function fetchAttachment(url: string, fallbackName = 'document.pdf') {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Attachment fetch failed (${res.status})`)
  const ab = await res.arrayBuffer()
  const filename = decodeURIComponent(url.split('/').pop() || fallbackName)
  return {
    filename,
    content: Buffer.from(ab),
    contentType: res.headers.get('content-type') || 'application/pdf',
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const companyId = url.searchParams.get('companyId')
    const mode = url.searchParams.get('mode') || 'daily'
    const day = url.searchParams.get('day') || ''

    if (!companyId) {
      return new NextResponse(GIF, { headers: { 'content-type': 'image/gif', 'cache-control': 'no-store' } })
    }

    const supabase = createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'))

    await supabase.from('email_events').insert({
      company_id: companyId,
      event_type: 'open',
      meta: { mode, day, ua: req.headers.get('user-agent') ?? '' },
    })

    return new NextResponse(GIF, { headers: { 'content-type': 'image/gif', 'cache-control': 'no-store' } })
  } catch {
    return new NextResponse(GIF, { headers: { 'content-type': 'image/gif', 'cache-control': 'no-store' } })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const to = String(body?.to || '').trim()
    const subject = String(body?.subject || '').trim()
    const html = String(body?.html || '').trim()
    const text = String(body?.text || '').trim()
    const attachmentUrl = body?.attachmentUrl ? String(body.attachmentUrl) : null
    const attachmentName = body?.attachmentName ? String(body.attachmentName) : 'document.pdf'
    const companyId = body?.companyId ? String(body.companyId) : null
    const entityType = body?.entityType ? String(body.entityType) : null
    const entityId = body?.entityId ? String(body.entityId) : null

    if (!to || !to.includes('@')) return NextResponse.json({ ok: false, error: 'Valid recipient required' }, { status: 400 })
    if (!subject) return NextResponse.json({ ok: false, error: 'Subject is required' }, { status: 400 })
    if (!html && !text) return NextResponse.json({ ok: false, error: 'Message content is required' }, { status: 400 })

    const attachments = [] as any[]
    if (attachmentUrl) {
      const attachment = await fetchAttachment(attachmentUrl, attachmentName)
      attachment.filename = attachmentName || attachment.filename
      attachments.push(attachment)
    }

    await sendAppEmail({
      to,
      subject,
      html: html || `<div style="white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif">${text}</div>`,
      text: text || undefined,
      attachments,
    })

    await logEmailEvent({
      companyId,
      eventType: 'sent',
      recipient: to,
      entityType,
      entityId,
      meta: { subject, attachment: attachmentName },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to send email' }, { status: 500 })
  }
}
