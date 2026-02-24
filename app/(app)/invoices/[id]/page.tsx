import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtZar } from "@/lib/format";
import InvoiceStatus from "./ui-status";
import PaymentForm from "./ui-payment";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: invoice }, { data: items }, { data: pays }] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "id,number,issue_date,due_date,status,notes,terms,subtotal,discount_total,tax_total,total,balance_due, clients(name,email,phone,billing_address)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("invoice_items").select("id,description,qty,unit_price,discount,tax_rate").eq("invoice_id", id),
    supabase
      .from("payments")
      .select("id,amount,payment_date,method,reference,created_at")
      .eq("invoice_id", id)
      .order("payment_date", { ascending: false })
      .limit(50),
  ]);

  if (!invoice) {
    return (
      <div className="kx-card p-4">
        <div className="text-sm font-semibold">Invoice not found</div>
        <div className="text-sm text-white/60 mt-1">This invoice may have been deleted.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xl font-semibold tracking-tight">Invoice {invoice.number ?? ""}</div>
          <div className="text-sm text-white/60">
            Client: <span className="text-white/85">{invoice.clients?.name ?? "—"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link className="kx-button" href={`/invoices/${invoice.id}/print`} target="_blank">
            Print / PDF
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="kx-card p-4 lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Issue date</div>
                <div className="mt-1 font-medium">{invoice.issue_date ?? "—"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Due date</div>
                <div className="mt-1 font-medium">{invoice.due_date ?? "—"}</div>
              </div>
            </div>

            <div className="w-full md:w-[240px]">
              <InvoiceStatus invoiceId={invoice.id} current={invoice.status ?? "Draft"} />
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
                        No items on this invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {(invoice.notes || invoice.terms) && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {invoice.notes && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Notes</div>
                    <div className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{invoice.notes}</div>
                  </div>
                )}
                {invoice.terms && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Terms</div>
                    <div className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{invoice.terms}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Payments</div>
              <div className="text-xs text-white/60">{pays?.length ?? 0} recorded</div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="text-white/60">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Method</th>
                    <th className="text-left px-3 py-2">Reference</th>
                    <th className="text-right px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(pays ?? []).map((p: any) => (
                    <tr key={p.id} className="border-t border-white/10">
                      <td className="px-3 py-2 text-white/80">{p.payment_date ?? "—"}</td>
                      <td className="px-3 py-2 text-white/70">{p.method ?? "—"}</td>
                      <td className="px-3 py-2 text-white/70">{p.reference ?? "—"}</td>
                      <td className="px-3 py-2 text-right text-white/85">{fmtZar(Number(p.amount ?? 0))}</td>
                    </tr>
                  ))}
                  {!pays?.length && (
                    <tr>
                      <td className="px-3 py-3 text-white/60" colSpan={4}>
                        No payments recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaymentForm invoiceId={invoice.id} />
          </div>
        </div>

        <div className="kx-card p-4">
          <div className="text-sm font-semibold">Summary</div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span className="text-white/85">{fmtZar(Number(invoice.subtotal ?? 0))}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Discounts</span>
              <span className="text-white/85">- {fmtZar(Number(invoice.discount_total ?? 0))}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Tax</span>
              <span className="text-white/85">{fmtZar(Number(invoice.tax_total ?? 0))}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{fmtZar(Number(invoice.total ?? 0))}</span>
            </div>
            <div className="mt-2 flex justify-between text-white/70">
              <span>Balance due</span>
              <span className="text-white/90">{fmtZar(Number(invoice.balance_due ?? 0))}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Client details</div>
            <div className="mt-1 text-sm text-white/80">{invoice.clients?.name ?? "—"}</div>
            {invoice.clients?.email && <div className="text-sm text-white/70 mt-1">{invoice.clients.email}</div>}
            {invoice.clients?.phone && <div className="text-sm text-white/70">{invoice.clients.phone}</div>}
            {invoice.clients?.billing_address && (
              <div className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{invoice.clients.billing_address}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
