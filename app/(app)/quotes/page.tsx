import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";

export default async function QuotesPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("id,number,issue_date,expiry_date,status,total, clients(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Quotes</div>
          <div className="text-sm text-white/60">Create, send, and convert quotes into invoices.</div>
        </div>

        <Link className="kx-button kx-button-primary" href="/quotes/new">
          New Quote
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-sm font-semibold">All quotes</div>
          {error && <div className="text-sm text-red-200 mt-1">{error.message}</div>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="text-white/60 bg-white/5">
              <tr>
                <th className="text-left px-4 py-3">Number</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Issue</th>
                <th className="text-left px-4 py-3">Expiry</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-right px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {(quotes ?? []).map((q: any) => (
                <tr key={q.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{q.number ?? "—"}</td>
                  <td className="px-4 py-3 text-white/80">{q.clients?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">{q.issue_date ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">{q.expiry_date ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="kx-chip">{q.status ?? "Draft"}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/80">{fmtZar(Number(q.total ?? 0))}</td>
                  <td className="px-4 py-3 text-right">
                    <Link className="kx-button" href={`/quotes/${q.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {!quotes?.length && (
                <tr>
                  <td className="px-4 py-6 text-white/60" colSpan={7}>
                    No quotes yet. Create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
