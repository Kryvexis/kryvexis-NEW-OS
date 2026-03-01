import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import StockUI from "./ui";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: products } = await supabase
    .from("products")
    .select(
      "id,name,sku,barcode,type,unit_price,stock_on_hand,low_stock_threshold,is_active,created_at"
    )
    .eq("company_id", companyId)
    .order("name", { ascending: true })
    .limit(500);

  return <StockUI products={products || []} />;
}
