'use client'

import { useState } from 'react'
import { WhatsAppSendDrawer } from '@/components/whatsapp/send-drawer'
import { logInvoiceWhatsAppSentAction } from '@/app/(app)/invoices/actions'

export default function InvoiceWhatsAppLauncher({
  invoiceId,
  invoiceNumber,
  clientName,
  clientPhone,
  totalText,
  viewPath,
}: {
  invoiceId: string
  invoiceNumber?: string | null
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
        entity={{ type: 'invoice', id: invoiceId, label: 'Invoice', number: invoiceNumber, totalText }}
        defaults={{ clientName, clientPhone, viewUrl: viewPath }}
        onLogSent={async ({ id, phone, message }) => logInvoiceWhatsAppSentAction({ invoice_id: id, phone, message })}
      />
    </>
  )
}
