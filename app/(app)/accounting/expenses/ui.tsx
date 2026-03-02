"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fmtZar } from "@/lib/format";
import { createExpenseAction } from "../actions";

type Tx = {
  id: string;
  amount: number;
  category: string | null;
  memo: string | null;
  tx_date: string | null;
  created_at: string | null;
  supplier_id?: string | null;
};

type SupplierOpt = { id: string; name: string };
type CatOpt = { id: string; name: string };

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpensesUI({
  initialTx,
  categories,
  suppliers,
  dbErrors,
}: {
  initialTx: Tx[];
  categories: CatOpt[];
  suppliers: SupplierOpt[];
  dbErrors: { transactions: string | null; categories: string | null; suppliers: string | null };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const supplierNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of suppliers || []) m.set(s.id, s.name);
    return m;
  }, [suppliers]);

  const total30 = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return (initialTx || [])
      .filter((t) => (t.tx_date ? new Date(t.tx_date) >= start : false))
      .reduce((a, t) => a + Number(t.amount || 0), 0);
  }, [initialTx]);

  async function submit(fd: FormData) {
    setPending(true);
    setMsg(null);
    const res: any = await createExpenseAction(fd);
    setPending(false);
    setMsg(res.ok ? "Expense saved." : res.error ?? "Could not save expense.");
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {dbErrors.transactions ? (
          <div className="kx-card p-5">
            <div className="text-sm font-semibold">Database upgrade required</div>
            <div className="mt-2 text-sm kx-muted">
              Expenses use the <span className="font-mono">transactions</span> table. Run <span className="font-mono">sql/upgrade_full.sql</span> and then{" "}
              <span className="font-mono">sql/060_accounting_payables.sql</span>.
            </div>
            <div className="mt-2 text-xs text-white/50">{dbErrors.transactions}</div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="kx-card p-5">
            <div className="text-xs text-white/55">Expenses (last 30 days)</div>
            <div className="mt-2 text-3xl font-semibold">{fmtZar(total30)}</div>
            <div className="mt-1 text-xs text-white/55">Cash outflows captured as expenses.</div>
          </div>

          <div className="kx-card p-5 md:col-span-2">
            <div className="text-sm font-semibold">How to use this</div>
            <div className="mt-2 text-sm kx-muted">
              Log expenses as they happen (fuel, rent, airtime, packaging). Supplier bills should be added under Payables, then marked paid to appear here.
            </div>
          </div>
        </div>

        <div className="kx-card overflow-hidden">
          <div className="grid grid-cols-6 gap-2 border-b border-[rgba(var(--kx-border),.12)] px-4 py-3 text-xs text-white/60">
            <div>Date</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Memo</div>
            <div className="text-right">Amount</div>
          </div>

          {(initialTx || []).length ? (
            (initialTx || []).map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-6 gap-2 px-4 py-3 text-sm border-b border-[rgba(var(--kx-border),.08)]"
              >
                <div className="text-white/80">{t.tx_date ? String(t.tx_date) : "—"}</div>
                <div className="col-span-2">
                  <div className="text-white/85">{t.category || "Uncategorised"}</div>
                  {t.supplier_id ? <div className="text-xs kx-muted">{supplierNameById.get(String(t.supplier_id)) || "Supplier"}</div> : null}
                </div>
                <div className="col-span-2 text-white/70 truncate">{t.memo || ""}</div>
                <div className="text-right font-medium">{fmtZar(Number(t.amount || 0))}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-sm kx-muted">No expenses captured yet.</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Add expense</div>

          <form
            className="mt-4 space-y-3"
            action={async (fd) => {
              if (!fd.get("tx_date")) fd.set("tx_date", isoToday());
              await submit(fd);
            }}
          >
            <div>
              <div className="text-xs kx-muted mb-1">Amount (ZAR)</div>
              <input name="amount" type="number" step="0.01" min="0" className="kx-input" placeholder="0.00" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs kx-muted mb-1">Date</div>
                <input name="tx_date" type="date" className="kx-input" defaultValue={isoToday()} />
              </div>
              <div>
                <div className="text-xs kx-muted mb-1">Supplier (optional)</div>
                <select name="supplier_id" className="kx-input" defaultValue="">
                  <option value="">—</option>
                  {(suppliers || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="text-xs kx-muted mb-1">Category</div>
              <input
                list="expenseCats"
                name="category"
                className="kx-input"
                placeholder="e.g. Fuel, Rent, Packaging"
                defaultValue={categories?.[0]?.name ?? ""}
              />
              <datalist id="expenseCats">
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              {dbErrors.categories ? (
                <div className="mt-1 text-xs text-white/50">Categories not ready (run SQL upgrade). You can still type a category.</div>
              ) : null}
            </div>

            <div>
              <div className="text-xs kx-muted mb-1">Memo</div>
              <input name="memo" className="kx-input" placeholder="Optional note (receipt ref, etc.)" />
            </div>

            <button className="kx-btn w-full" disabled={pending} type="submit">
              {pending ? "Saving..." : "Save expense"}
            </button>

            {msg ? <div className="text-xs text-white/70">{msg}</div> : null}
          </form>
        </div>

        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Power tip ✨</div>
          <div className="mt-2 text-sm kx-muted">
            Keep it simple: capture the expense + category. You can always add detail later — but if it’s not captured now, it’s gone.
          </div>
        </div>
      </div>
    </div>
  );
}
