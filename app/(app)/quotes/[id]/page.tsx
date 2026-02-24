import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtZar } from "@/lib/format";
import QuoteStatus from "./ui-status";
import ConvertButton from "./ui-convert";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuotePage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: quote }, { data: items }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id,number,issue_date,expiry_date,status,notes,terms,subtotal,discount_total,tax_total,total, clients(name,email,phone,billing_address)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("quote_items").select("id,description,qty,unit_price,discount,tax_rate").eq("quote_id", id),
  ]);

  if (!quote) {
    return (
      <div className="kx-card p-4">
        <div className="text-sm font-semibold">Quote not found</div>
        <div className="text-sm text-white/60 mt-1">This quote may have been deleted.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xl font-semibold tracking-tight">Quote {quote.number ?? ""}</div>
          <div className="text-sm text-white/60">
            Client: <span className="text-white/85">{quote.clients?.name ?? "—"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link className="kx-button" href={`/quotes/${quote.id}/print`} target="_blank">
            Print / PDF
          </Link>
          <ConvertButton quoteId={quote.id} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="kx-card p-4 lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Issue date</div>
                <div className="mt-1 font-medium">{quote.issue_date ?? "—"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Expiry date</div>
                <div className="mt-1 font-medium">{quote.expiry_date ?? "—"}</div>
              </div>
            </div>

            <div className="w-full md:w-[220px]">
              <QuoteStatus quoteId={quote.id} current={quote.status ?? "Draft"} />
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold">Line items</div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/4 overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead className="text-white/60 bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3">Description</th>
                    <th className="text-right px-4 py-3">Qty</th>
                    <th className="text-right px-4 py-3">Unit</th>
                    <th className="text-right px-4 py-3">Discount</th>
                    <th className="text-right px-4 py-3">Tax</th>
                    <th className="text-right px-4 py-3">Line</th>
                  </tr>
                </thead>
                <tbody>
                  {(items ?? []).map((it: any) => {
                    const base = Number(it.qty ?? 0) * Number(it.unit_price ?? 0);
                    const disc = Math.min(Number(it.discount ?? 0), base);
                    const after = Math.max(0, base - disc);
                    const tax = after * Number(it.tax_rate ?? 0);
                    const line = after + tax;
                    return (
                      <tr key={it.id} className="border-t border-white/10">
                        <td className="px-4 py-3 font-medium">{it.description ?? "—"}</td>
                        <td className="px-4 py-3 text-right text-white/80">{Number(it.qty ?? 0)}</td>
                        <td className="px-4 py-3 text-right text-white/80">{fmtZar(Number(it.unit_price ?? 0))}</td>
                        <td className="px-4 py-3 text-right text-white/70">{fmtZar(Number(it.discount ?? 0))}</td>
                        <td className="px-4 py-3 text-right text-white/70">{Math.round(Number(it.tax_rate ?? 0) * 100)}%</td>
                        <td className="px-4 py-3 text-right text-white/85">{fmtZar(line)}</td>
                      </tr>
                    );
                  })}

                  {!items?.length && (
                    <tr>
                      <td className="px-4 py-6 text-white/60" colSpan={6}>
                        No items on this quote.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {(quote.notes || quote.terms) && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {quote.notes && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Notes</div>
                    <div className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{quote.notes}</div>
                  </div>
                )}
                {quote.terms && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Terms</div>
                    <div className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{quote.terms}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="kx-card p-4">
          <div className="text-sm font-semibold">Summary</div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span className="text-white/85">{fmtZar(Number(quote.subtotal ?? 0))}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Discounts</span>
              <span className="text-white/85">- {fmtZar(Number(quote.discount_total ?? 0))}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Tax</span>
              <span className="text-white/85">{fmtZar(Number(quote.tax_total ?? 0))}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{fmtZar(Number(quote.total ?? 0))}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Client details</div>
            <div className="mt-1 text-sm text-white/80">{quote.clients?.name ?? "—"}</div>
            {quote.clients?.email && <div className="text-sm text-white/70 mt-1">{quote.clients.email}</div>}
            {quote.clients?.phone && <div className="text-sm text-white/70">{quote.clients.phone}</div>}
            {quote.clients?.billing_address && (
              <div className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{quote.clients.billing_address}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
