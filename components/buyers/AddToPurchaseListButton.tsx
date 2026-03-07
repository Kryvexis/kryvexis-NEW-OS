'use client'

import { useState } from 'react'
import { upsertPurchaseItem } from '@/components/mobile/buyers/purchase-list-store'

type Props = {
  productId: string
  name: string
  sku?: string | null
  suggestedQty: number
  unitPrice?: number | null
}

export default function AddToPurchaseListButton(props: Props) {
  const [added, setAdded] = useState(false)

  return (
    <button
      className="rounded-xl border border-emerald-500/20 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
      onClick={() => {
        upsertPurchaseItem({
          product_id: props.productId,
          name: props.name,
          sku: props.sku ?? null,
          suggested_qty: Math.max(1, Number(props.suggestedQty || 1)),
          unit_price: props.unitPrice ?? null,
        })
        setAdded(true)
        window.dispatchEvent(new CustomEvent('kx:purchase-list-updated'))
      }}
      type="button"
    >
      {added ? 'Added to purchase list' : 'Add to purchase list'}
    </button>
  )
}
