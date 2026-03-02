// Hotfix: Next.js 15.5 PageProps typing expects params as a Promise in this project.
// Keep this page minimal to unblock Vercel builds; UI enhancements continue in next patch.

import Link from "next/link";

export default async function BuyerItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Link href="/m/buyers" className="text-sm text-muted-foreground">
          ← Back
        </Link>
        <div className="text-sm font-medium">Item Details</div>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="text-base font-semibold">Item</div>
        <div className="mt-1 text-sm text-muted-foreground">
          ID: <span className="font-mono">{id}</span>
        </div>

        <div className="mt-4 text-sm">
          This screen will show stock, supplier, price history, and the recommended order quantity.
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href="/m/buyers/purchase-list"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Review &amp; Order
          </Link>
          <Link
            href="/m/buyers"
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium"
          >
            Buyers
          </Link>
        </div>
      </div>
    </div>
  );
}
