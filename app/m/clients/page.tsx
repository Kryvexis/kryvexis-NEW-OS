import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { Search, UserPlus, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      {children}
    </div>
  );
}

export default async function MobileClients({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const supabase = await createClient();
  const companyId = await requireCompanyId();

  let query = supabase
    .from("clients")
    .select("id,name,email,phone,created_at")
    .eq("company_id", companyId)
    .order("name", { ascending: true })
    .limit(50);

  if (q) {
    // Simple OR search across name/email/phone
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: clients } = await query;

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold tracking-tight">Clients</div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm active:scale-[0.99]"
        >
          <UserPlus className="h-4 w-4" />
          New
        </Link>
      </div>

      {/* Search */}
      <form className="relative" action="/m/clients" method="get">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, or phone"
          className="w-full rounded-2xl border border-black/10 bg-white px-10 py-3 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-900"
        />
      </form>

      {/* List */}
      <div className="space-y-2">
        {(clients ?? []).map((c) => (
          <Link key={c.id} href={`/clients/${c.id}`} className="block">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{c.name}</div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {[c.email, c.phone].filter(Boolean).join(" • ")}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </div>
            </Card>
          </Link>
        ))}

        {(clients ?? []).length === 0 && (
          <Card>
            <div className="text-sm font-medium">No clients found</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Try a different search, or add a new client.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
