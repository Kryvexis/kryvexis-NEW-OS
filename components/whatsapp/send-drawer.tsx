'use client'

import * as React from 'react'

function normalizePhone(raw?: string | null) {
  if (!raw) return ''
  return String(raw).replace(/\D/g, '')
}

type TemplateKey = 'formal' | 'friendly' | 'reminder'

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  formal: 'Formal',
  friendly: 'Friendly',
  reminder: 'Reminder',
}

function buildMessage(opts: {
  template: TemplateKey
  clientName?: string | null
  docLabel: string
  docNumber?: string | null
  totalText?: string | null
  viewUrl?: string
  paymentLine?: string
}) {
  const name = (opts.clientName || '').trim()
  const hello =
    opts.template === 'formal'
      ? `Good day${name ? ` ${name}` : ''},`
      : opts.template === 'reminder'
        ? `Hi${name ? ` ${name}` : ''} 👋`
        : `Hi${name ? ` ${name}` : ''}!`

  const line1 =
    opts.template === 'reminder'
      ? `Just a quick reminder — your ${opts.docLabel}${opts.docNumber ? ` ${opts.docNumber}` : ''} is ready.`
      : `Your ${opts.docLabel}${opts.docNumber ? ` ${opts.docNumber}` : ''} is ready.`

  const total = opts.totalText ? `Total: ${opts.totalText}` : ''
  const link = opts.viewUrl ? `View online: ${opts.viewUrl}` : ''
  const pay = opts.paymentLine ? opts.paymentLine : ''

  return [hello, '', line1, total, link, pay ? '' : null, pay || null, '', '— Kryvexis OS']
    .filter((x): x is string => Boolean(x))
    .join('\n')
}

export function WhatsAppSendDrawer({
  open,
  onClose,
  entity,
  defaults,
  onLogSent,
}: {
  open: boolean
  onClose: () => void
  entity: { type: 'quote' | 'invoice'; id: string; label: string; number?: string | null; totalText?: string | null }
  defaults: { clientName?: string | null; clientPhone?: string | null; viewUrl?: string }
  onLogSent: (input: { id: string; phone?: string | null; message?: string | null }) => Promise<any>
}) {
  const [template, setTemplate] = React.useState<TemplateKey>('formal')
  const [phone, setPhone] = React.useState(defaults.clientPhone || '')
  const [includePayment, setIncludePayment] = React.useState(true)
  const [custom, setCustom] = React.useState<string>('')

  React.useEffect(() => {
    if (!open) return
    setTemplate('formal')
    setPhone(defaults.clientPhone || '')
    setIncludePayment(true)
    setCustom('')
  }, [open, defaults.clientPhone])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const viewUrl = defaults.viewUrl ? (defaults.viewUrl.startsWith('/') ? `${origin}${defaults.viewUrl}` : defaults.viewUrl) : ''

  const paymentLine = includePayment
    ? 'Payment options: EFT or Cash. Reply here if you want us to convert this into an invoice.'
    : ''

  const computed = React.useMemo(() => {
    const msg = buildMessage({
      template,
      clientName: defaults.clientName,
      docLabel: entity.label,
      docNumber: entity.number || undefined,
      totalText: entity.totalText || undefined,
      viewUrl: viewUrl || undefined,
      paymentLine,
    })
    return msg
  }, [template, defaults.clientName, defaults.viewUrl, entity.label, entity.number, entity.totalText, paymentLine])

  const message = custom.trim().length ? custom : computed

  const waUrl = React.useMemo(() => {
    const p = normalizePhone(phone)
    const text = encodeURIComponent(message)
    return p ? `https://wa.me/${p}?text=${text}` : `https://web.whatsapp.com/send?text=${text}`
  }, [phone, message])

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
    } catch {
      // ignore
    }
  }

  async function send() {
    // log first (enterprise timeline), then open WhatsApp
    await onLogSent({ id: entity.id, phone, message })
    window.open(waUrl, '_blank', 'noopener,noreferrer')
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label={`Send ${entity.label} via WhatsApp`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[520px] p-4">
        <div className="h-full rounded-[28px] bg-[rgba(var(--kx-bg),.92)] shadow-[0_20px_80px_rgba(0,0,0,.55)] border border-[rgba(var(--kx-fg),.08)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 flex items-start justify-between gap-3 border-b border-[rgba(var(--kx-fg),.08)] bg-[rgba(var(--kx-fg),.03)]">
            <div>
              <div className="text-sm font-semibold">Send via WhatsApp</div>
              <div className="text-xs kx-muted mt-1">
                {entity.label} {entity.number || ''} · {entity.totalText || ''}
              </div>
            </div>
            <button className="kx-icon-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
            <div className="grid gap-3">
              <label className="block">
                <div className="text-xs kx-muted mb-1">Client</div>
                <div className="kx-chip">{defaults.clientName || '—'}</div>
              </label>

              <label className="block">
                <div className="text-xs kx-muted mb-1">WhatsApp number</div>
                <input
                  className="kx-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27…"
                  inputMode="tel"
                />
                <div className="mt-1 text-[11px] kx-muted">Tip: use country code (e.g. +27). We’ll format it for WhatsApp.</div>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <div className="text-xs kx-muted mb-1">Template</div>
                  <select className="kx-input" value={template} onChange={(e) => setTemplate(e.target.value as TemplateKey)}>
                    {Object.keys(TEMPLATE_LABELS).map((k) => (
                      <option key={k} value={k}>
                        {TEMPLATE_LABELS[k as TemplateKey]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 mt-6 select-none">
                  <input type="checkbox" checked={includePayment} onChange={(e) => setIncludePayment(e.target.checked)} />
                  <span className="text-sm">Include payment line</span>
                </label>
              </div>

              <label className="block">
                <div className="text-xs kx-muted mb-1">Message preview (editable)</div>
                <textarea
                  className="kx-input min-h-[180px] resize-none"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder={computed}
                />
                <div className="mt-1 text-[11px] kx-muted">Leave blank to use the template message.</div>
              </label>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-[rgba(var(--kx-fg),.08)] bg-[rgba(var(--kx-fg),.03)] flex flex-wrap items-center justify-between gap-2">
            <button className="kx-button" type="button" onClick={copy}>
              Copy message
            </button>
            <div className="flex gap-2">
              <button className="kx-button" type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="kx-button kx-button-primary" type="button" onClick={send}>
                Send WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
