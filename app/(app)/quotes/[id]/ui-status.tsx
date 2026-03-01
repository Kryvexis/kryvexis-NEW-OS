'use client'

import { useState, useTransition } from 'react'
import { updateQuoteStatusAction } from '@/app/(app)/quotes/actions'

const STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired']

export default function QuoteStatus({ quoteId, current }: { quoteId: string; current: string }) {
  const [value, setValue] = useState(current || 'Draft')
  const [pending, start] = useTransition()

  async function save(next: string) {
    setValue(next)
    start(async () => {
      const res = await updateQuoteStatusAction(quoteId, next)
      if (!res?.ok) {
        // revert on failure
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
