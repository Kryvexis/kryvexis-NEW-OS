'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import PaymentForm from '@/app/(app)/invoices/[id]/ui-payment'

export function PaymentDrawer({ invoiceId }: { invoiceId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="kx-btn kx-btn-primary" onClick={() => setOpen(true)}>
        Record payment
      </button>
      <Modal open={open} title="Record payment" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="text-sm text-white/60">
            Capture a payment and automatically update this invoice.
          </div>
          <div className="kx-card p-4">
            <PaymentForm invoiceId={invoiceId} />
          </div>
          <div className="flex justify-end gap-2">
            <button className="kx-btn kx-btn-secondary" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
