'use client'

import { useState, useTransition } from 'react'
import { recordPaymentAction } from '@/app/(app)/invoices/actions'
import { isoDate } from '@/lib/format'

export default function PaymentForm({ invoiceId }: { invoiceId: string }) {
  const [pending, start] = useTransition()
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(isoDate())
  const [method, setMethod] = useState('EFT')
  const [reference, setReference] = useState('')

  async function submit() {
    const amt = Number(amount)
    if (!amt || amt <= 0) return alert('Enter an amount')

    start(async () => {
      const res = await recordPaymentAction({
        invoice_id: invoiceId,
        amount: amt,
        payment_date: paymentDate,
        method,
        reference,
      })
      if (!res.ok) alert(res.error || 'Payment failed')
      else {
        setAmount('')
        setReference('')
      }
    })
  }

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-4">
      <label className="block">
        <div className="text-xs text-white/60 mb-1">Amount</div>
        <input className="kx-input" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" placeholder="0.00" />
      </label>
      <label className="block">
        <div className="text-xs text-white/60 mb-1">Date</div>
        <input className="kx-input" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} type="date" />
      </label>
      <label className="block">
        <div className="text-xs text-white/60 mb-1">Method</div>
        <select className="kx-input" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>EFT</option>
          <option>Cash</option>
          <option>Card</option>
          <option>Other</option>
        </select>
      </label>
      <label className="block">
        <div className="text-xs text-white/60 mb-1">Reference</div>
        <input className="kx-input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="INV ref" />
      </label>

      <div className="md:col-span-4">
        <button className="kx-button kx-button-primary" onClick={submit} disabled={pending}>
          {pending ? 'Saving…' : 'Record payment'}
        </button>
      </div>
    </div>
  )
}
