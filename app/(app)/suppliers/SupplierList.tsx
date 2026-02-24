"use client";

import LimitedList from "@/components/lists/LimitedList";

type SupplierRow = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export default function SupplierList({ suppliers }: { suppliers: SupplierRow[] }) {
  return (
    <div className="kx-card p-5">
      <div className="text-sm font-semibold mb-1">Suppliers</div>
      <div className="text-xs text-white/55 mb-4">Showing max 5 by default. Use search + View more.</div>

      <LimitedList
        items={suppliers || []}
        searchKeys={["name", "email", "phone"]}
        placeholder="Type e.g. W…"
        emptyText="No suppliers yet."
        render={(s) => (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-white/90">{s.name}</div>
                <div className="text-xs text-white/60">
                  {(s.email || "—")}{s.phone ? ` · ${s.phone}` : ""}
                </div>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
