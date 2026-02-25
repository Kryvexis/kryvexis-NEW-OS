import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import QuoteList from "./QuoteList";

export default async function QuotesPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("id,number,issue_date,expiry_date,status,total, clients(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(500);

  const enriched = (quotes as any[] | null)?.map((q) => ({ ...q, client_name: q?.clients?.name ?? "" })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Quotes</div>
          <div className="text-sm kx-muted">Create, send, and convert quotes into invoices.</div>
        </div>

        <Link className="kx-button kx-button-primary" href="/quotes/new">
          New Quote
        </Link>
      </div>

      {error && <div className="text-sm text-red-200">{error.message}</div>}
      <QuoteList quotes={enriched as any} />
    </div>
  );
}
