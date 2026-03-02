import Link from "next/link";
import { cookies } from "next/headers";
import { clearPurchaseListAction } from "./actions";

type Item = { product_id: string; name: string; qty: number };

async function readList(): Promise<Item[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("kx_purchase_list")?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export default async function PurchaseListPage() {
  const items = await readList();

  const body = [
    "Hi there,",
    "",
    "Please can you assist with the following stock order:",
    "",
    ...items.map((i) => `- ${i.name}: ${i.qty}`),
    "",
    "Kind regards,",
    "Kryvexis",
  ].join("\n");

  const mailto = `mailto:?subject=${encodeURIComponent(
    "Stock Order Request - Kryvexis"
  )}&body=${encodeURIComponent(body)}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link href="/m/buyers" className="text-blue-600 hover:underline">
          ← Buyers
        </Link>
        <form action={clearPurchaseListAction}>
          <button className="text-sm text-zinc-500 hover:underline">Clear</button>
        </form>
      </div>

      <h1 className="text-xl font-semibold">Review & Order</h1>

      <div className="space-y-2">
        {items.map((i) => (
          <div
            key={i.product_id}
            className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900"
          >
            <div className="font-medium">{i.name}</div>
            <div className="text-sm text-zinc-500">Qty: {i.qty}</div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-900">
            Your purchase list is empty.
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={mailto}
          className='rounded-2xl bg-blue-600 px-4 py-3 text-center font-semibold text-white shadow-lg'
        >
          Send Email
        </a>
        <button
          className="rounded-2xl bg-zinc-900 px-4 py-3 font-semibold text-white dark:bg-zinc-800"
          onClick={() => {
            // client only; noop in server render
          }}
        >
          Copy
        </button>
      </div>

      <div className="text-xs text-zinc-500">
        Next patch: supplier grouping + Brevo send + logging to Supabase (Recently Reordered) 🧠
      </div>
    </div>
  );
}
