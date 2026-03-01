import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import ProductEditUI from "./ui";

type Params = { id: string };

export default async function Page({ params }: { params: Params }) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,name,sku,barcode,type,unit_price,cost_price,supplier_id,is_active")
    .eq("id", params.id)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    // Let Next.js error boundary catch this (gives a clear error in logs)
    throw new Error(error.message);
  }
  if (!product) return notFound();

  return <ProductEditUI product={product} />;
}
