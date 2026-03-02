"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, deleteCategoryAction } from "../actions";

type Cat = { id: string; name: string; type: "expense" | "income" };

function groupByType(items: Cat[]) {
  const out: Record<string, Cat[]> = { expense: [], income: [] };
  for (const c of items || []) out[c.type]?.push(c);
  return out;
}

export default function CategoriesUI({
  initialCategories,
  dbError,
}: {
  initialCategories: Cat[];
  dbError: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const grouped = useMemo(() => groupByType(initialCategories || []), [initialCategories]);

  async function onAdd(fd: FormData) {
    setPending(true);
    setMsg(null);
    const res = await createCategoryAction(fd);
    setPending(false);
    setMsg(res.ok ? "Category added." : res.error ?? "Could not add category.");
    if (res.ok) router.refresh();
  }

  async function onDelete(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    setPending(true);
    setMsg(null);
    const res = await deleteCategoryAction(fd);
    setPending(false);
    setMsg(res.ok ? "Category removed." : res.error ?? "Could not remove category.");
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {dbError ? (
          <div className="kx-card p-5">
            <div className="text-sm font-semibold">Database upgrade required</div>
            <div className="mt-2 text-sm kx-muted">
              Categories require a one-time SQL upgrade in Supabase. Run: <span className="font-mono">sql/060_accounting_payables.sql</span>
            </div>
            <div className="mt-2 text-xs text-white/50">{dbError}</div>
          </div>
        ) : null}

        <div className="kx-card overflow-hidden">
          <div className="border-b border-[rgba(var(--kx-border),.12)] px-4 py-3">
            <div className="text-sm font-semibold">Expense categories</div>
            <div className="text-xs kx-muted">Used for expenses, supplier bills and P&amp;L breakdown.</div>
          </div>
          {(grouped.expense || []).length ? (
            (grouped.expense || []).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-4 py-3 text-sm border-b border-[rgba(var(--kx-border),.08)]"
              >
                <div className="text-white/85">{c.name}</div>
                <button
                  className="kx-btn kx-btn-ghost"
                  disabled={pending}
                  onClick={() => onDelete(c.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-sm kx-muted">No expense categories yet.</div>
          )}
        </div>

        <div className="kx-card overflow-hidden">
          <div className="border-b border-[rgba(var(--kx-border),.12)] px-4 py-3">
            <div className="text-sm font-semibold">Income categories</div>
            <div className="text-xs kx-muted">Optional — helps with reporting.</div>
          </div>
          {(grouped.income || []).length ? (
            (grouped.income || []).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-4 py-3 text-sm border-b border-[rgba(var(--kx-border),.08)]"
              >
                <div className="text-white/85">{c.name}</div>
                <button
                  className="kx-btn kx-btn-ghost"
                  disabled={pending}
                  onClick={() => onDelete(c.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-sm kx-muted">No income categories yet.</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Add category</div>
          <form
            className="mt-4 space-y-3"
            action={async (fd) => {
              await onAdd(fd);
            }}
          >
            <div>
              <div className="text-xs kx-muted mb-1">Type</div>
              <select name="type" className="kx-input" defaultValue="expense">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <div className="text-xs kx-muted mb-1">Name</div>
              <input name="name" placeholder="e.g. Fuel, Rent, Packaging" className="kx-input" required />
            </div>

            <button className="kx-btn w-full" disabled={pending} type="submit">
              {pending ? "Saving..." : "Add category"}
            </button>

            {msg ? <div className="text-xs text-white/70">{msg}</div> : null}
          </form>
        </div>

        <div className="kx-card p-5">
          <div className="text-sm font-semibold">Tip</div>
          <div className="mt-2 text-sm kx-muted">
            Keep categories broad. Your future P&amp;L stays clean when you avoid having 50 micro-categories.
          </div>
        </div>
      </div>
    </div>
  );
}
