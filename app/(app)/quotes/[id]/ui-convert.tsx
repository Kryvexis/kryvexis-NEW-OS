'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { convertQuoteToInvoiceAction } from '@/app/(app)/quotes/actions'

export default function ConvertButton({ quoteId }: { quoteId: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <button
      className="kx-button kx-button-primary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await convertQuoteToInvoiceAction(quoteId)
          if (res.ok && res.invoiceId) router.push(`/invoices/${res.invoiceId}`)
          else alert(res.error || 'Convert failed')
        })
      }
    >
      {pending ? 'Converting…' : 'Convert → Invoice'}
    </button>
  )
}
