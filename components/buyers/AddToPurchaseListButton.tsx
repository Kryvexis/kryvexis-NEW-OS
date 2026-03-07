'use client'

import { useState } from 'react'
import { upsertPurchaseItem, type PurchaseListItem } from '@/components/mobile/buyers/purchase-list-store'

export default function AddToPurchaseListButton({ item }: { item: PurchaseListItem }) {
  const [added, setAdded] = useState(false)

  return (
    <button
      type="button"
      className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
      onClick={() => {
        upsertPurchaseItem(item)
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1800)
      }}
    >
      {added ? 'Added' : 'Add to Purchase List'}
    </button>
  )
}
