'use client'

import { useMemo, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

const STATUSES = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Void']

export default function InvoiceStatus({ invoiceId, current }: { invoiceId: string; current: string }) {
  const [value, setValue] = useState(current || 'Draft')
  const [pending, start] = useTransition()
  const supabase = useMemo(() => createClient(), [])

  async function save(next: string) {
    setValue(next)
    start(async () => {
      await supabase.from('invoices').update({ status: next }).eq('id', invoiceId)
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
