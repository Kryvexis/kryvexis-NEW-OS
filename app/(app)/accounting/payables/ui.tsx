"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fmtZar } from "@/lib/format";
import { createSupplierBillAction, markSupplierBillPaidAction } from "../actions";

type Bill = {
  id: string;
  supplier_id: string;
  bill_number: string | null;
  issue_date: string | null;
  due_date: string | null;
  category: string | null;
  notes: string | null;
  total: number;
  balance_due: number;
  status: string;
  paid_at?: string | null;
};

type SupplierOpt = { id: string; name: string };
type CatOpt = { id: string; name: string };

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function statusBadge(status: string) {
  const s = String(status || "unpaid");
  if (s === "paid") return "kx-badge";
  if (s === "void") return "kx-badge";
  if (s === "partial") return "kx-badge";
  return "kx-badge";
}

export default function PayablesUI({
  initialBills,
  suppliers,
  categories,
  dbErrors,
}: {
  initialBills: Bill[];
  suppliers: SupplierOpt[];
  categories: CatOpt[];
  dbErrors: { bills: string | null; suppliers: string | null; categories: string | null };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const supplierNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of suppliers || []) m.set(s.id, s.name);
    return m;
  }, [suppliers]);

  const openBills = useMemo(() => {
    return (initialBills || []).filter((b) => !["paid", "void"].includes(String(b.status || "unpaid")));
  }, [initialBills]);

  const paidBills = useMemo(() => {
    return (initialBills || []).filter((b) => String(b.status || "") === "paid");
  }, [initialBills]);

  const outstanding = useMemo(() => {
    return openBills.reduce((a, b) => a + Number(b.balance_due ?? b.total ?? 0), 0);
  }, [openBills]);

  async function submitBill(fd: FormData) {
    setPending(true);
    setMsg(null);
    const res: any = await createSupplierBillAction(fd);
    setPending(false);
    setMsg(res.ok ? "Bill added." : res.error ?? "Could not add bill.");
    if (res.ok) router.refresh();
  }

  async function markPaid(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    setPending(true);
    setMsg(null);
    const res: any = await markSupplierBillPaidAction(fd);
    setPending(false);
    if (res.ok && res.warning) setMsg(`Bill marked paid, but expense entry failed: ${res.warning}`);
    else setMsg(res.ok ? "Marked paid." : res.error ?? "Could not mark paid.");
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {dbErrors.bills ? (
          <div className="kx-card p-5">
            <div className="text-sm font-semibold">Database upgrade required</div>
            <div className="mt-2 text-sm kx-muted">
              Payables require a one-time SQL upgrade in Supabase. Run: <span className="font-mono">sql/060_accounting_payables.sql</span>
            </div>
            <div className="mt-2 text-xs text-white/50">{dbErrors.bills}</div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="kx-card p-5">
            <div className="text-xs text-white/55">Outstanding bills</div>
            <div className="mt-2 text-3xl font-semibold">{fmtZar(outstanding)}</div>
            <div className="mt-1 text-xs text-white/55">What you still need to pay suppliers.</div>
          </div>
          <div className="kx-card p-5 md:col-span-2">
            <div className="text-sm font-semibold">Simple workflow</div>
            <ol className="mt-2 space-y-2 text-sm kx-muted">
              <li>1) Add the supplier bill under Payables.</li>
              <li>2) When you pay it, click <span className="text-white/80">Mark paid</span>.</li>
              <li>3) It automatically records an expense and updates P&amp;L.</li>
            </ol>
          </div>
        </div>

        <div className="kx-card overflow-hidden">
          <div className="grid grid-cols-6 gap-2 border-b border-[rgba(var(--kx-border),.12)] px-4 py-3 text-xs text-white/60">
            <div>Due</div>
            <div className="col-span-2">Supplier</div>
            <div className="col-span-2">Bill</div>
            <div className="text-right">Amount</div>
          </div>

          {(openBills || []).length ? (
            openBills.map((b) => (
              <div
                key={b.id}
                className="grid grid-cols-6 gap-2 px-4 py-3 text-sm border-b border-[rgba(var(--kx-border),.08)]"
              >
                <div className="text-white/80">{b.due_date ? String(b.due_date) : "—"}</div>
                <div className="col-span-2">
                  <div className="text-white/85">{supplierNameById.get(String(b.supplier_id)) || "Supplier"}</div>
                  <div className="text-xs kx-muted">{b.category || "Supplier bills"}</div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className={statusBadge(b.status)}>{String(b.status || "unpaid")}</span>
                    <span className="text-white/85">{b.bill_number || "—"}</span>
                  </div>
                  {b.notes ? <div className="text-xs kx-muted truncate">{b.notes}</div> : null}
                </div>
                <div className="text-right">
                  <div className="font-medium">{fmtZar(Number(b.balance_due ?? b.total ?? 0))}</div>
                  <button className="kx-btn kx-btn-ghost mt-1" disabled={pending} onClick={() => markPaid(b.id)} type="button">
                    Mark paid
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-sm kx-muted">No unpaid supplier bills.</div>
          )}
        </div>

        {(paidBills || []).length ? (
          <div className="kx-card overflow-hidden">
            <div className="border-b border-[rgba(var(--kx-border),.12)] px-4 py-3">
              <div className="text-sm font-semibold">Paid bills</div>
              <div className="text-xs kx-muted">Last {Math.min(10, paidBills.length)} paid bills (for quick reference).</div>
            </div>
            {paidBills.slice(0, 10).map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm border-b border-[rgba(var(--kx-border),.08)]">
                <div className="min-w-0">
                  <div className="text-white/85 truncate">{supplierNameById.get(String(b.supplier_id)) || "Supplier"}</div>
                  <div className="text-xs kx-muted truncate">
                    {b.bill_number ? `Bill ${b.bill_number}` : "Bill"} • {b.paid_at ? String(b.paid_at).slice(0, 10) : ""}
                  </div>
                </div>
                <div className="font-medium">{fmtZar(Number(b.total || 0))}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Add supplier bill</div>

          <form
            className="mt-4 space-y-3"
            action={async (fd) => {
              if (!fd.get("issue_date")) fd.set("issue_date", isoToday());
              await submitBill(fd);
            }}
          >
            <div>
              <div className="text-xs kx-muted mb-1">Supplier</div>
              <select name="supplier_id" className="kx-input" required defaultValue="">
                <option value="">Select supplier…</option>
                {(suppliers || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {dbErrors.suppliers ? <div className="mt-1 text-xs text-white/50">Suppliers table not ready yet.</div> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs kx-muted mb-1">Issue date</div>
                <input name="issue_date" type="date" className="kx-input" defaultValue={isoToday()} />
              </div>
              <div>
                <div className="text-xs kx-muted mb-1">Due date</div>
                <input name="due_date" type="date" className="kx-input" defaultValue={isoToday()} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs kx-muted mb-1">Bill #</div>
                <input name="bill_number" className="kx-input" placeholder="Optional" />
              </div>
              <div>
                <div className="text-xs kx-muted mb-1">Total (ZAR)</div>
                <input name="total" type="number" step="0.01" min="0" className="kx-input" required placeholder="0.00" />
              </div>
            </div>

            <div>
              <div className="text-xs kx-muted mb-1">Category</div>
              <input list="billCats" name="category" className="kx-input" placeholder="e.g. Inventory, Fuel, Rent" defaultValue={categories?.[0]?.name ?? ""} />
              <datalist id="billCats">
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              {dbErrors.categories ? (
                <div className="mt-1 text-xs text-white/50">Categories not ready (run SQL upgrade). You can still type a category.</div>
              ) : null}
            </div>

            <div>
              <div className="text-xs kx-muted mb-1">Notes</div>
              <input name="notes" className="kx-input" placeholder="Optional note" />
            </div>

            <button className="kx-btn w-full" disabled={pending} type="submit">
              {pending ? "Saving..." : "Add bill"}
            </button>

            {msg ? <div className="text-xs text-white/70">{msg}</div> : null}
          </form>
        </div>

        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Where expenses live</div>
          <div className="mt-2 text-sm kx-muted">
            Once a bill is marked paid, we add a matching Expense entry. That keeps your P&amp;L and cashbook reporting consistent.
          </div>
        </div>
      </div>
    </div>
  );
}
