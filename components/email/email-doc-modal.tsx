'use client'

import { useEffect, useMemo, useState } from 'react'

export function EmailDocModal(props: {
  open: boolean
  onClose: () => void
  defaultTo?: string
  defaultSubject: string
  defaultMessage: string
  attachmentUrl?: string | null
  attachmentName?: string | null
}) {
  const { open, onClose, defaultTo, defaultSubject, defaultMessage, attachmentUrl, attachmentName } = props

  const [to, setTo] = useState(defaultTo || '')
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState(defaultMessage)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!open) return
    setTo(defaultTo || '')
    setSubject(defaultSubject)
    setMessage(defaultMessage)
    setErr(null)
    setOk(false)
  }, [open, defaultTo, defaultSubject, defaultMessage])

  const canSend = useMemo(() => !!to && !!subject && !busy, [to, subject, busy])

  async function send() {
    if (!canSend) return
    setBusy(true)
    setErr(null)
    setOk(false)
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          text: message,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial; white-space: pre-wrap">${escapeHtml(message)}</div>`,
          attachmentUrl: attachmentUrl || null,
          attachmentName: attachmentName || null,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to send')
      setOk(true)
      setTimeout(() => onClose(), 600)
    } catch (e: any) {
      setErr(e?.message || 'Failed to send')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[92vw] max-w-xl rounded-3xl border border-[rgba(var(--kx-border),.12)] bg-black/60 backdrop-blur-xl shadow-2xl">
        <div className="p-5 border-b border-[rgba(var(--kx-border),.12)]">
          <div className="text-base font-semibold">Send email</div>
          <div className="text-xs kx-muted mt-1">Uses your SMTP settings (no third‑party credits).</div>
        </div>
        <div className="p-5 space-y-3">
          <label className="block">
            <div className="text-xs kx-muted mb-1">To</div>
            <input className="kx-input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="client@email.com" />
          </label>
          <label className="block">
            <div className="text-xs kx-muted mb-1">Subject</div>
            <input className="kx-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="block">
            <div className="text-xs kx-muted mb-1">Message</div>
            <textarea className="kx-input min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>

          {attachmentUrl ? (
            <div className="text-xs kx-muted">
              Attachment: <span className="text-[rgba(var(--kx-fg),.82)]">{attachmentName || 'document.pdf'}</span>
            </div>
          ) : (
            <div className="text-xs text-[rgba(var(--kx-fg),.92)]/50">Tip: generate the PDF first to attach it automatically.</div>
          )}

          {err && <div className="text-xs text-red-300">{err}</div>}
          {ok && <div className="text-xs text-emerald-300">Sent ✅</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button className="kx-button" onClick={onClose} disabled={busy}>Cancel</button>
            <button className="kx-button kx-button-primary" onClick={send} disabled={!canSend}>
              {busy ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
