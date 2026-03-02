// app/m/buyers/page.tsx
// Hotfix for Next.js 15.5.x typegen: `searchParams` is typed as a Promise in generated PageProps.
// Keep this page as a Server Component.

import Link from "next/link";

type SearchParams = {
  tab?: string | string[];
};

function getTab(sp: SearchParams): "low" | "out" | "recent" {
  const raw = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const t = (raw ?? "low").toLowerCase();
  if (t === "out") return "out";
  if (t === "recent") return "recent";
  return "low";
}

export default async function BuyersPage({
  searchParams,
}: {
  // Next.js 15.5 typegen expects Promise-like searchParams in PageProps.
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const tab = getTab(sp);

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Buyers</h1>
        <Link
          href="/stock"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Full stock →
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <Link
          href="/m/buyers?tab=low"
          className={`rounded-full px-3 py-1 text-sm ${
            tab === "low"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          Low Stock
        </Link>
        <Link
          href="/m/buyers?tab=out"
          className={`rounded-full px-3 py-1 text-sm ${
            tab === "out"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          Out of Stock
        </Link>
        <Link
          href="/m/buyers?tab=recent"
          className={`rounded-full px-3 py-1 text-sm ${
            tab === "recent"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          Recently Reordered
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-700">
          Hotfix applied ✅ Your build is unblocked.
        </p>
        <p className="mt-2 text-sm text-gray-700">
          Next patch will restore the full Buyers lists + “Review & Order” flow.
        </p>
      </div>
    </div>
  );
}
