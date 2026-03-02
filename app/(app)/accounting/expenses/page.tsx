import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { PosHeroShell } from "@/components/pos/hero-shell";
import ExpensesUI from "./ui";

export const dynamic = "force-dynamic";

type Tx = {
  id: string;
  amount: number;
  category: string | null;
  memo: string | null;
  tx_date: string | null;
  created_at: string | null;
  supplier_id?: string | null;
};

type SupplierOpt = { id: string; name: string };
type CatOpt = { id: string; name: string };

export default async function ExpensesPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const [{ data: tx, error: txErr }, { data: cats, error: catErr }, { data: suppliers, error: supErr }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("id,amount,category,memo,tx_date,created_at,supplier_id")
        .eq("company_id", companyId)
        .eq("kind", "expense")
        .order("tx_date", { ascending: false })
        .limit(250),
      supabase
        .from("accounting_categories")
        .select("id,name")
        .eq("company_id", companyId)
        .eq("type", "expense")
        .order("name", { ascending: true }),
      supabase.from("suppliers").select("id,name").eq("company_id", companyId).order("name", { ascending: true }),
    ]);

  return (
    <PosHeroShell title="Expenses" subtitle="Fast expense capture. Keeps P&L and payables clean.">
      <ExpensesUI
        initialTx={(tx || []) as any}
        categories={(cats || []) as any}
        suppliers={(suppliers || []) as any}
        dbErrors={{
          transactions: txErr?.message ?? null,
          categories: catErr?.message ?? null,
          suppliers: supErr?.message ?? null,
        }}
      />
    </PosHeroShell>
  );
}
