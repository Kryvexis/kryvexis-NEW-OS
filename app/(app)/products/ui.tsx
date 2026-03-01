"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "./actions";

type SupplierOpt = { id: string; name: string };

export default function ProductsUI() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierOpt[]>([]);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetch("/api/suppliers/options")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        if (j?.ok) setSuppliers(j.suppliers || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <form
        key={formKey}
        className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-4"
        action={async (fd) => {
          setPending(true);
          setMsg(null);

          const res = await createProductAction(fd);

          setPending(false);

          if (res?.ok) {
            setMsg("Product saved.");
            setFormKey((k) => k + 1);
            router.refresh();
          } else {
            setMsg(res?.error ?? "Something went wrong.");
          }
        }}
      >
        <div className="text-sm font-semibold">Add product / service</div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
          <input
            name="sku"
            placeholder="SKU (optional)"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
          <input
            name="barcode"
            placeholder="Barcode (optional)"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
          <select
            name="type"
            defaultValue="product"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>

          <input
            name="unit_price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Sell price"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />

          <select
            name="supplier_id"
            defaultValue=""
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          >
            <option value="">Supplier (optional)</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            name="stock_on_hand"
            type="number"
            step="1"
            min="0"
            placeholder="Stock on hand"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
          <input
            name="low_stock_threshold"
            type="number"
            step="1"
            min="0"
            placeholder="Low stock threshold"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs kx-muted">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
              className="h-4 w-4 rounded border border-[rgba(var(--kx-border),.25)] bg-black/30"
            />
            Active
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button disabled={pending} className="kx-button">
            {pending ? "Saving…" : "Save"}
          </button>
          {msg && <div className="text-sm kx-muted">{msg}</div>}
        </div>
      </form>
    </div>
  );
}
