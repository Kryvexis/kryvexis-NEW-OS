"use client";

import Link from "next/link";
import { useState } from "react";
import { upsertPurchaseItem, PurchaseListItem } from "./purchase-list-store";

export default function ItemActions({ product }: { product: PurchaseListItem }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            upsertPurchaseItem(product);
            setSaved(true);
            setTimeout(() => setSaved(false), 1200);
          }}
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
        >
          {saved ? "Added ✅" : "Add to Purchase List"}
        </button>

        <Link
          href="/m/buyers/purchase-list"
          className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-900"
        >
          Review & Order
        </Link>
      </div>
    </div>
  );
}
