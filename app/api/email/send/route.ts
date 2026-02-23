import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type Payload = {
  to: string
  subject: string
  text?: string
  html?: string
  attachmentUrl?: string | null
  attachmentName?: string | null
}

function requiredEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload
    if (!body?.to || !body?.subject) {
      return NextResponse.json({ ok: false, error: 'Missing to/subject' }, { status: 400 })
    }

    // SMTP config (set these in .env.local)
    const host = requiredEnv('SMTP_HOST')
    const port = Number(requiredEnv('SMTP_PORT'))
    const user = requiredEnv('SMTP_USER')
    const pass = requiredEnv('SMTP_PASS')
    const from = process.env.SMTP_FROM || user

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    const attachments: any[] = []
    if (body.attachmentUrl) {
      // best-effort: fetch the PDF and attach it
      const res = await fetch(body.attachmentUrl)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        attachments.push({
          filename: body.attachmentName || 'document.pdf',
          content: buf,
          contentType: 'application/pdf',
        })
      }
    }

    await transport.sendMail({
      from,
      to: body.to,
      subject: body.subject,
      text: body.text || undefined,
      html: body.html || undefined,
      attachments: attachments.length ? attachments : undefined,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to send' }, { status: 500 })
  }
}
