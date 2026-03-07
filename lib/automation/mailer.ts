import nodemailer from 'nodemailer'

export type MailAttachment = {
  filename: string
  content: Buffer | string
  contentType?: string
}

function env(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function hasSmtpEnv() {
  return !!process.env.EMAIL_SMTP_HOST && !!process.env.EMAIL_SMTP_PORT && !!process.env.EMAIL_FROM
}

async function sendViaSmtp(opts: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: MailAttachment[]
}) {
  const transporter = nodemailer.createTransport({
    host: env('EMAIL_SMTP_HOST'),
    port: Number(process.env.EMAIL_SMTP_PORT || 587),
    secure: String(process.env.EMAIL_SMTP_SECURE || 'false') === 'true',
    auth: process.env.EMAIL_SMTP_USER
      ? {
          user: env('EMAIL_SMTP_USER'),
          pass: env('EMAIL_SMTP_PASS'),
        }
      : undefined,
  })

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    attachments: opts.attachments,
  })
}

async function sendViaBrevo(opts: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: MailAttachment[]
}) {
  const apiKey = env('BREVO_API_KEY')
  const fromEmail = env('EMAIL_FROM')
  const to = (Array.isArray(opts.to) ? opts.to : [opts.to]).map((email) => ({ email }))
  const attachments = (opts.attachments || []).map((a) => ({
    name: a.filename,
    content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : Buffer.from(a.content).toString('base64'),
  }))

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: 'Kryvexis' },
      to,
      subject: opts.subject,
      htmlContent: opts.html,
      textContent: opts.text,
      attachments,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Brevo send failed (${res.status}): ${text || res.statusText}`)
  }

  return { ok: true }
}

export async function sendAppEmail(opts: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: MailAttachment[]
}) {
  if (hasSmtpEnv()) return sendViaSmtp(opts)
  if (process.env.BREVO_API_KEY && process.env.EMAIL_FROM) return sendViaBrevo(opts)
  throw new Error('Email is not configured. Set SMTP env vars or BREVO_API_KEY + EMAIL_FROM.')
}
