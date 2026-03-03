import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      {children}
    </div>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const s = (status ?? "").toLowerCase();
  const cls =
    s === "paid"
      ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"
      : s === "unpaid" || s === "overdue"
      ? "bg-amber-600/10 text-amber-700 dark:text-amber-300"
      : "bg-zinc-600/10 text-zinc-700 dark:text-zinc-300";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${cls}`}>{status ?? "—"}</span>;
}

export default async function MobileTransactions({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const supabase = await createClient();
  const companyId = await requireCompanyId();

  // Treat invoices as "transactions" (sales)
  let invQuery = supabase
    .from("invoices")
    .select("id,total,issue_date,status,client_id")
    .eq("company_id", companyId)
    .order("issue_date", { ascending: false })
    .limit(30);

  // We'll search by invoice id fragment OR status; client name search needs join -> do a second query map
  if (q) {
    invQuery = invQuery.or(`id.ilike.%${q}%,status.ilike.%${q}%`);
  }

  const { data: invoices } = await invQuery;

  // hydrate client names (best-effort, small batch)
  const clientIds = Array.from(new Set((invoices ?? []).map((i) => i.client_id).filter(Boolean)));
  let clientMap: Record<string, { name: string; email?: string | null }> = {};
  if (clientIds.length) {
    const { data: clients } = await supabase
      .from("clients")
      .select("id,name,email")
      .eq("company_id", companyId)
      .in("id", clientIds);
    (clients ?? []).forEach((c) => (clientMap[c.id] = { name: c.name, email: c.email }));
  }

  const items = (invoices ?? []).map((i) => ({
    ...i,
    clientName: i.client_id ? clientMap[i.client_id]?.name : undefined,
  }));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold tracking-tight">Transactions</div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-zinc-900"
          aria-label="Filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Search */}
      <form className="relative" action="/m/transactions" method="get">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search invoices or status"
          className="w-full rounded-2xl border border-black/10 bg-white px-10 py-3 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-900"
        />
      </form>

      {/* List */}
      <div className="space-y-2">
        {items.map((i) => (
          <Link key={i.id} href={`/invoices/${i.id}`} className="block">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold">{i.clientName ?? "Walk-in"}</div>
                    <StatusPill status={i.status} />
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {(i.issue_date ?? "").toString().slice(0, 10)} • #{String(i.id).slice(0, 8)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{fmtZar(i.total ?? 0)}</div>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {items.length === 0 && (
          <Card>
            <div className="text-sm font-medium">No transactions found</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Try a different search.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
