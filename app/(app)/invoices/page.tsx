import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id,number,issue_date,due_date,status,total, balance_due, clients(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Invoices</div>
          <div className="text-sm text-white/60">Track what you&apos;ve billed, what&apos;s paid, and what&apos;s still due.</div>
        </div>

        <Link className="kx-button kx-button-primary" href="/invoices/new">
          New Invoice
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-sm font-semibold">All invoices</div>
          {error && <div className="text-sm text-red-200 mt-1">{error.message}</div>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="text-white/60 bg-white/5">
              <tr>
                <th className="text-left px-4 py-3">Number</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Issue</th>
                <th className="text-left px-4 py-3">Due</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-right px-4 py-3">Balance</th>
                <th className="text-right px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {(invoices ?? []).map((inv: any) => (
                <tr key={inv.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{inv.number ?? "—"}</td>
                  <td className="px-4 py-3 text-white/80">{inv.clients?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">{inv.issue_date ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">{inv.due_date ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="kx-chip">{inv.status ?? "Draft"}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/80">{fmtZar(Number(inv.total ?? 0))}</td>
                  <td className="px-4 py-3 text-right text-white/80">{fmtZar(Number(inv.balance_due ?? 0))}</td>
                  <td className="px-4 py-3 text-right">
                    <Link className="kx-button" href={`/invoices/${inv.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {!invoices?.length && (
                <tr>
                  <td className="px-4 py-6 text-white/60" colSpan={8}>
                    No invoices yet. Create your first one.
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
