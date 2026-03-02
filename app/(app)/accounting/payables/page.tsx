import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { fmtZar } from "@/lib/format";
import { PosHeroShell } from "@/components/pos/hero-shell";
import PayablesUI from "./ui";

export const dynamic = "force-dynamic";

type Bill = {
  id: string;
  supplier_id: string;
  bill_number: string | null;
  issue_date: string | null;
  due_date: string | null;
  category: string | null;
  notes: string | null;
  total: number;
  balance_due: number;
  status: "unpaid" | "partial" | "paid" | "void" | string;
  paid_at?: string | null;
};

type SupplierOpt = { id: string; name: string };
type CatOpt = { id: string; name: string };

export default async function PayablesPage() {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const [{ data: bills, error: billErr }, { data: suppliers, error: supErr }, { data: cats, error: catErr }] =
    await Promise.all([
      supabase
        .from("supplier_bills")
        .select("id,supplier_id,bill_number,issue_date,due_date,category,notes,total,balance_due,status,paid_at")
        .eq("company_id", companyId)
        .order("due_date", { ascending: true })
        .limit(500),
      supabase.from("suppliers").select("id,name").eq("company_id", companyId).order("name", { ascending: true }),
      supabase
        .from("accounting_categories")
        .select("id,name")
        .eq("company_id", companyId)
        .eq("type", "expense")
        .order("name", { ascending: true }),
    ]);

  const outstanding = (bills || [])
    .filter((b: any) => String(b.status || "unpaid") !== "paid" && String(b.status || "unpaid") !== "void")
    .reduce((a: number, b: any) => a + Number(b.balance_due ?? b.total ?? 0), 0);

  const now = new Date();
  const overdueCount = (bills || []).filter((b: any) => {
    if (!b.due_date) return false;
    const due = new Date(String(b.due_date));
    return due < now && String(b.status || "unpaid") !== "paid" && String(b.status || "unpaid") !== "void";
  }).length;

  return (
    <PosHeroShell
      title="Payables"
      subtitle="Supplier bills you still need to pay. Mark a bill paid and it will flow into Expenses + P&L."
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <span className="kx-badge">Outstanding: {fmtZar(outstanding)}</span>
          {overdueCount ? <span className="kx-badge">Overdue: {overdueCount}</span> : null}
        </div>
      }
    >
      <PayablesUI
        initialBills={(bills || []) as any}
        suppliers={(suppliers || []) as any}
        categories={(cats || []) as any}
        dbErrors={{
          bills: billErr?.message ?? null,
          suppliers: supErr?.message ?? null,
          categories: catErr?.message ?? null,
        }}
      />
    </PosHeroShell>
  );
}
