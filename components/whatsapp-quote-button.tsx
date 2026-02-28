'use client'

import * as React from 'react'

function normalizePhone(raw?: string | null) {
  if (!raw) return ''
  // Keep digits only. WhatsApp expects country code, no leading +.
  const digits = String(raw).replace(/\D/g, '')
  return digits
}

export default function WhatsAppQuoteButton({
  quoteId,
  quoteNumber,
  clientName,
  clientPhone,
  total,
}: {
  quoteId: string
  quoteNumber?: string | null
  clientName?: string | null
  clientPhone?: string | null
  total?: string | null
}) {
  const onClick = React.useCallback(() => {
    const phone = normalizePhone(clientPhone)

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const viewUrl = origin ? `${origin}/quotes/${quoteId}` : ''

    const msg = [
      `Hi ${clientName || ''}`.trim(),
      '',
      `Here is your quote${quoteNumber ? ` #${quoteNumber}` : ''}${total ? ` (${total})` : ''}.`,
      viewUrl ? `View online: ${viewUrl}` : '',
      '',
      '— Kryvexis OS',
    ]
      .filter(Boolean)
      .join('\n')

    const text = encodeURIComponent(msg)

    // If we have a phone, use wa.me (best for mobile + desktop). Otherwise fall back to WhatsApp Web compose.
    const url = phone
      ? `https://wa.me/${phone}?text=${text}`
      : `https://web.whatsapp.com/send?text=${text}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }, [clientName, clientPhone, quoteId, quoteNumber, total])

  return (
    <button type="button" className="kx-button" onClick={onClick} title="Send via WhatsApp">
      WhatsApp
    </button>
  )
}
