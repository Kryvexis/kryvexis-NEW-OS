'use client'

import { useTransition } from 'react'
import { logQuoteViewedAction } from '@/app/(app)/quotes/actions'

export default function MarkViewedButton({ quoteId }: { quoteId: string }) {
  const [pending, start] = useTransition()

  return (
    <button
      type="button"
      className="kx-btn kx-btn-secondary w-full"
      disabled={pending}
      onClick={() => {
        start(async () => {
          const res = await logQuoteViewedAction({ quote_id: quoteId })
          if (!res?.ok) alert(res?.error || 'Failed to log viewed')
        })
      }}
    >
      Mark as viewed
    </button>
  )
}
