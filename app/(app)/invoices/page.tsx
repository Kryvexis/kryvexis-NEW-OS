import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import InvoiceList from "./InvoiceList";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id,number,issue_date,due_date,status,total, balance_due, clients(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(500);

  const enriched = (invoices as any[] | null)?.map((inv) => ({ ...inv, client_name: inv?.clients?.name ?? "" })) ?? [];

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

      {error && <div className="text-sm text-red-200">{error.message}</div>}
      <InvoiceList invoices={enriched as any} />
    </div>
  );
}
