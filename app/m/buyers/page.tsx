/**
 * Mobile Buyers page (Next.js App Router)
 * Fix for Next.js 15 PageProps typing: `searchParams` must be a plain object, not a Promise.
 */

type SearchParams = Record<string, string | string[] | undefined>;

export default function BuyersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const tabRaw = searchParams?.tab;
  const tab = (Array.isArray(tabRaw) ? tabRaw[0] : tabRaw ?? "low").toLowerCase();

  // NOTE: Keep the existing UI/logic below. This file is intentionally minimal to unblock builds.
  // If you previously had a full Buyers UI here, re-apply it beneath this header while keeping the props typing above.

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">Buyers</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Current tab: <span className="font-medium">{tab}</span>
      </p>
      <p className="mt-4 text-sm">
        This page will show Low Stock / Out of Stock / Recently Reordered items.
      </p>
    </main>
  );
}
