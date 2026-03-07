"use server";

import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v ?? "");
  return Number.isFinite(n) ? n : fallback;
}

export async function createProductAction(fd: FormData) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const name = String(fd.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name is required." };

  const payload: any = {
    company_id: companyId,
    name,
    sku: String(fd.get("sku") || "").trim() || null,
    barcode: String(fd.get("barcode") || "").trim() || null,
    type: String(fd.get("type") || "product"),
    unit_price: num(fd.get("unit_price"), 0),
    supplier_id: String(fd.get("supplier_id") || "").trim() || null,
    stock_on_hand: Math.max(0, Math.trunc(num(fd.get("stock_on_hand"), 0))),
    low_stock_threshold: Math.max(0, Math.trunc(num(fd.get("low_stock_threshold"), 0))),
    is_active: fd.get("is_active") ? true : false,
  };

  const { error } = await supabase.from("products").insert(payload);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function updateProductAction(fd: FormData) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const productId = String(fd.get("id") || "").trim();
  if (!productId) return { ok: false, error: "Missing product id." };

  const name = String(fd.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name is required." };

  const payload: any = {
    name,
    sku: String(fd.get("sku") || "").trim() || null,
    type: String(fd.get("type") || "product"),
    unit_price: num(fd.get("unit_price"), 0),
    cost_price: num(fd.get("cost_price"), 0),
    supplier_id: String(fd.get("supplier_id") || "").trim() || null,
  };

  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .eq("company_id", companyId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function adjustStockAction(productId: string, delta: number) {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const d = Math.trunc(Number(delta));
  if (!Number.isFinite(d) || d === 0) return { ok: false, error: "Enter a valid quantity." };

  // Fetch current stock so we can clamp at 0 (prevents negatives)
  const { data: p, error: e1 } = await supabase
    .from("products")
    .select("id, stock_on_hand")
    .eq("id", productId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (e1) return { ok: false, error: e1.message };
  if (!p) return { ok: false, error: "Product not found." };

  const next = Math.max(0, Math.trunc(Number(p.stock_on_hand || 0)) + d);

  const { error: e2 } = await supabase
    .from("products")
    .update({ stock_on_hand: next })
    .eq("id", productId)
    .eq("company_id", companyId);

  if (e2) return { ok: false, error: e2.message };
  return { ok: true, next };
}

export async function deleteProductAction(fd: FormData): Promise<void> {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const productId = String(fd.get("id") || "").trim();
  if (!productId) throw new Error("Missing product id.");

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("company_id", companyId);

  if (error) throw new Error(error.message);
}
