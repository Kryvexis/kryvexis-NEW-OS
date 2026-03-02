import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { PosHeroShell } from "@/components/pos/hero-shell";
import CategoriesUI from "./ui";

export const dynamic = "force-dynamic";

type Cat = { id: string; name: string; type: "expense" | "income" };

export default async function CategoriesPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data, error } = await supabase
    .from("accounting_categories")
    .select("id,name,type")
    .eq("company_id", companyId)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  const categories: Cat[] = (data || []) as any;

  return (
    <PosHeroShell
      title="Categories"
      subtitle="Keep your expense & income categories tidy. Used for Expenses, Bills, and P&L breakdowns."
    >
      <CategoriesUI initialCategories={categories} dbError={error?.message ?? null} />
    </PosHeroShell>
  );
}
