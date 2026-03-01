'use client'

import { useTransition } from 'react'
import { logInvoiceViewedAction } from '@/app/(app)/invoices/actions'

export default function MarkViewedButton({ invoiceId }: { invoiceId: string }) {
  const [pending, start] = useTransition()

  return (
    <button
      type="button"
      className="kx-btn kx-btn-secondary w-full"
      disabled={pending}
      onClick={() => {
        start(async () => {
          const res = await logInvoiceViewedAction({ invoice_id: invoiceId })
          if (!res?.ok) alert(res?.error || 'Failed to log viewed')
        })
      }}
    >
      Mark as viewed
    </button>
  )
}
