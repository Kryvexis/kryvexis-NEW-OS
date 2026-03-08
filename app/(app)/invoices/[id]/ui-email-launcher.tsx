'use client'

import { useMemo, useState } from 'react'

export default function InvoiceEmailLauncher({
  invoiceId,
  invoiceNumber,
  clientName,
  clientEmail,
}: {
  invoiceId: string
  invoiceNumber?: string | null
  clientName?: string | null
  clientEmail?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState(clientEmail || '')
  const [subject, setSubject] = useState(`Invoice ${invoiceNumber || ''} from Kryvexis`)
  const [message, setMessage] = useState(
    clientName ? `Hi ${clientName},\n\nPlease find your invoice attached below.` : 'Please find your invoice attached below.'
  )
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  const canSend = useMemo(() => !!to.trim() && !!subject.trim() && !busy, [to, subject, busy])

  async function onSend() {
    try {
      setBusy(true)
      setStatus(null)

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          to,
          subject,
          message,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to send email')
      }

      setStatus({ ok: true, text: `Email sent to ${data.recipient || to}.` })
      setOpen(false)
    } catch (e: any) {
      setStatus({ ok: false, text: e?.message || 'Failed to send email' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className="kx-button" onClick={() => setOpen(true)} title="Send invoice by email">
        Email
      </button>

      {status ? (
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            status.ok
              ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/25'
              : 'bg-rose-500/15 text-rose-200 border border-rose-400/25'
          }`}
        >
          {status.text}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-base font-semibold text-white">Send invoice email</div>
                <div className="mt-1 text-sm text-white/60">Invoice {invoiceNumber || ''}</div>
              </div>
              <button
                type="button"
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Close
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <div className="mb-1 text-sm text-white/70">To</div>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="client@example.com"
                  type="email"
                />
              </label>

              <label className="block">
                <div className="mb-1 text-sm text-white/70">Subject</div>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Invoice subject"
                />
              </label>

              <label className="block">
                <div className="mb-1 text-sm text-white/70">Message</div>
                <textarea
                  className="min-h-[150px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add an optional message"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-4">
              <button
                type="button"
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                onClick={onSend}
                disabled={!canSend}
              >
                {busy ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
