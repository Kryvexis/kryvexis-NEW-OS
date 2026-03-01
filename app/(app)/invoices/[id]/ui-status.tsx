'use client'

import { useState, useTransition } from 'react'
import { updateInvoiceStatusAction } from '@/app/(app)/invoices/actions'

const STATUSES = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Void']

export default function InvoiceStatus({ invoiceId, current }: { invoiceId: string; current: string }) {
  const [value, setValue] = useState(current || 'Draft')
  const [pending, start] = useTransition()

  async function save(next: string) {
    setValue(next)
    start(async () => {
      const res = await updateInvoiceStatusAction(invoiceId, next)
      if (!res?.ok) {
        setValue(current || 'Draft')
        alert(res?.error || 'Failed to update status')
      }
    })
  }

  return (
    <label className="block">
      <div className="text-xs kx-muted mb-1">Status</div>
      <select className="kx-input" value={value} onChange={(e) => save(e.target.value)} disabled={pending}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  )
}
