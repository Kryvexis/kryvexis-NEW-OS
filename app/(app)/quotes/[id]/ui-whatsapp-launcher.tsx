'use client'

import { useState } from 'react'
import { WhatsAppSendDrawer } from '@/components/whatsapp/send-drawer'
import { logQuoteWhatsAppSentAction } from '@/app/(app)/quotes/actions'

export default function QuoteWhatsAppLauncher({
  quoteId,
  quoteNumber,
  clientName,
  clientPhone,
  totalText,
  viewPath,
}: {
  quoteId: string
  quoteNumber?: string | null
  clientName?: string | null
  clientPhone?: string | null
  totalText?: string | null
  viewPath: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="kx-button" onClick={() => setOpen(true)} title="Send via WhatsApp">
        WhatsApp
      </button>

      <WhatsAppSendDrawer
        open={open}
        onClose={() => setOpen(false)}
        entity={{ type: 'quote', id: quoteId, label: 'Quote', number: quoteNumber, totalText }}
        defaults={{ clientName, clientPhone, viewUrl: viewPath }}
        onLogSent={async ({ id, phone, message }) => logQuoteWhatsAppSentAction({ quote_id: id, phone, message })}
      />
    </>
  )
}
