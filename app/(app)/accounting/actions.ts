"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v ?? "");
  return Number.isFinite(n) ? n : fallback;
}

function s(v: FormDataEntryValue | null) {
  const t = String(v ?? "").trim();
  return t.length ? t : null;
}

// Insert a transaction, but gracefully handle older schemas that don't yet have optional columns.
async function insertTransaction(supabase: any, payload: any) {
  const { error } = await supabase.from("transactions").insert(payload);
  if (!error) return { ok: true as const };

  // If the database hasn't been upgraded yet, retry without optional columns.
  const msg = String(error.message || "");
  const optionalCols = ["supplier_id", "bill_id"];
  if (optionalCols.some((c) => msg.includes(`column \"${c}\"`))) {
    const clean: any = { ...payload };
    for (const c of optionalCols) delete clean[c];
    const { error: e2 } = await supabase.from("transactions").insert(clean);
    if (!e2) return { ok: true as const };
    return { ok: false as const, error: e2.message as string };
  }

  return { ok: false as const, error: error.message as string };
}

export async function createExpenseAction(fd: FormData) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const amount = num(fd.get("amount"), 0);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Amount must be greater than 0." };

  const payload: any = {
    company_id: companyId,
    kind: "expense",
    amount,
    category: s(fd.get("category")),
    memo: s(fd.get("memo")),
    tx_date: s(fd.get("tx_date")),
    supplier_id: s(fd.get("supplier_id")),
  };

  const res = await insertTransaction(supabase, payload);
  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath("/accounting");
  revalidatePath("/accounting/expenses");
  revalidatePath("/accounting/dashboard");
  revalidatePath("/accounting/pnl");
  return { ok: true };
}

export async function createCategoryAction(fd: FormData) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const name = String(fd.get("name") || "").trim();
  if (!name) return { ok: false, error: "Category name is required." };

  const type = String(fd.get("type") || "expense");
  if (!["expense", "income"].includes(type)) return { ok: false, error: "Invalid category type." };

  const { error } = await supabase.from("accounting_categories").insert({
    company_id: companyId,
    name,
    type,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/accounting/categories");
  revalidatePath("/accounting/expenses");
  return { ok: true };
}

export async function deleteCategoryAction(fd: FormData) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const id = String(fd.get("id") || "").trim();
  if (!id) return { ok: false, error: "Missing category id." };

  const { error } = await supabase.from("accounting_categories").delete().eq("id", id).eq("company_id", companyId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/accounting/categories");
  revalidatePath("/accounting/expenses");
  return { ok: true };
}

export async function createSupplierBillAction(fd: FormData) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const supplier_id = s(fd.get("supplier_id"));
  if (!supplier_id) return { ok: false, error: "Supplier is required." };

  const total = num(fd.get("total"), 0);
  if (!Number.isFinite(total) || total <= 0) return { ok: false, error: "Total must be greater than 0." };

  const issue_date = s(fd.get("issue_date"));
  const due_date = s(fd.get("due_date"));

  const payload: any = {
    company_id: companyId,
    supplier_id,
    bill_number: s(fd.get("bill_number")),
    issue_date,
    due_date,
    category: s(fd.get("category")),
    notes: s(fd.get("notes")),
    total,
    balance_due: total,
    status: "unpaid",
  };

  const { error } = await supabase.from("supplier_bills").insert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/accounting/payables");
  revalidatePath("/accounting/dashboard");
  return { ok: true };
}

export async function markSupplierBillPaidAction(fd: FormData) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const id = String(fd.get("id") || "").trim();
  if (!id) return { ok: false, error: "Missing bill id." };

  // Read bill first
  const { data: bill, error: e1 } = await supabase
    .from("supplier_bills")
    .select("id,supplier_id,bill_number,category,total,status")
    .eq("id", id)
    .eq("company_id", companyId)
    .maybeSingle();

  if (e1) return { ok: false, error: e1.message };
  if (!bill) return { ok: false, error: "Bill not found." };

  if (bill.status === "paid") return { ok: true };

  // Mark paid
  const { error: e2 } = await supabase
    .from("supplier_bills")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      paid_amount: bill.total,
      balance_due: 0,
    })
    .eq("id", id)
    .eq("company_id", companyId);

  if (e2) return { ok: false, error: e2.message };

  // Record the cash-out in transactions (so it shows up in Expenses + P&L)
  const memo = bill.bill_number ? `Supplier bill ${bill.bill_number}` : "Supplier bill payment";
  const txRes = await insertTransaction(supabase, {
    company_id: companyId,
    kind: "expense",
    amount: Number(bill.total || 0),
    category: bill.category ?? "Supplier bills",
    memo,
    tx_date: new Date().toISOString().slice(0, 10),
    supplier_id: bill.supplier_id ?? null,
    bill_id: bill.id,
  });

  // If transaction insert fails, we still keep bill paid — just warn the UI.
  if (!txRes.ok) {
    return { ok: true, warning: txRes.error };
  }

  revalidatePath("/accounting/payables");
  revalidatePath("/accounting/expenses");
  revalidatePath("/accounting/dashboard");
  revalidatePath("/accounting/pnl");
  return { ok: true };
}
