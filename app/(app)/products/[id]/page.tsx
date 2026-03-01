// @ts-nocheck
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import EditProductUI from "./ui";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,name,sku,type,unit_price,cost_price,supplier_id,is_active")
    .eq("id", id)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    return (
      <div className="space-y-3">
        <div className="text-xl font-semibold">Edit product</div>
        <div className="text-sm text-red-200">{error.message}</div>
        <Link href="/products" className="kx-link">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xl font-semibold">Edit product</div>
          <div className="text-sm kx-muted">Update details and pricing.</div>
        </div>
        <Link
          href="/products"
          className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] px-3 py-2 text-sm hover:bg-[rgba(var(--kx-border),.10)]"
        >
          Back
        </Link>
      </div>

      <EditProductUI product={product as any} />
    </div>
  );
}
