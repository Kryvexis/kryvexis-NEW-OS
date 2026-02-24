import ImportStation from "@/components/import/ImportStation";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kx-h1">Import Station</div>
          <div className="kx-sub">Bulk import Products, Clients, and Suppliers (CSV). Imports run per-company.</div>
        </div>
      </div>
      <ImportStation />
    </div>
  );
}
