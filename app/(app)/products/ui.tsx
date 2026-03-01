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
        className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-4"
        action={async (fd) => {
          setPending(true);
          setMsg(null);
          const res = await createProductAction(fd);
          setPending(false);
          setMsg(res.ok ? "Product saved." : res.error ?? "Something went wrong.");
          if (res.ok) router.refresh();
        }}
      >
        <div className="text-sm font-semibold">Add product / service</div>

        <div className="mt-3 grid gap-2 md:grid-cols-6">
          <input
            name="name"
            required
            placeholder="Name"
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
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
            defaultValue="product"
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
          <input
            name="unit_price"
            inputMode="decimal"
            placeholder="Price (ZAR)"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
          <select
            name="supplier_id"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
            defaultValue=""
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
            inputMode="numeric"
            placeholder="Stock on hand"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
          <input
            name="low_stock_threshold"
            inputMode="numeric"
            placeholder="Reorder point"
            className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[rgba(var(--kx-accent),.6)]"
          />
          <label className="flex items-center gap-2 rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked />
            Active
          </label>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[rgba(var(--kx-accent),.18)] px-4 py-2 text-sm font-semibold hover:bg-[rgba(var(--kx-accent),.26)] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {msg && <div className="text-sm text-[rgba(var(--kx-muted),1)]">{msg}</div>}
        </div>
      </form>

      <div className="text-xs text-[rgba(var(--kx-muted),1)]">
        Tip: If you have many products, use <b>Operations → Import</b> to upload a CSV.
      </div>
    </div>
  );
}