import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import EditProductUI from "./ui";

type Params = { id: string };

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="kx-card p-6">
        <div className="text-lg font-semibold">Product not found</div>
        <div className="mt-2 text-sm kx-muted">
          {error ? error.message : "This product may have been deleted or you don't have access."}
        </div>
      </div>
    );
  }

  const product: any = {
    id: data.id,
    name: data.name ?? "",
    sku: data.sku ?? null,
    type: (data.type ?? "product") as "product" | "service",
    unit_price: Number(data.unit_price ?? 0),
    cost_price: Number(data.cost_price ?? 0),
    supplier_id: data.supplier_id ?? null,
    is_active: data.is_active ?? true,
  };

  return <EditProductUI product={product} />;
}
