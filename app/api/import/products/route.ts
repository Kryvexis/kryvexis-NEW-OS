import { NextResponse } from "next/server";
import { requireCompanyId } from "@/lib/kx";
import { getAuthedServerClients, detectProductSupplierKey } from "@/lib/server-db";

export const dynamic = "force-dynamic";

function toBool(v: any) {
  const s = String(v ?? "").trim().toLowerCase();
  if (!s) return null;
  if (["true","1","yes","y"].includes(s)) return true;
  if (["false","0","no","n"].includes(s)) return false;
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (!rows.length) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

    const { supabase, admin } = await getAuthedServerClients();
    const companyId = await requireCompanyId();
    const db = admin ?? supabase;
    const supplierKey = await detectProductSupplierKey();

    const { data: existing } = await db.from("products").select("id,name,sku").eq("company_id", companyId).limit(3000);
    const { data: suppliers } = await db.from("suppliers").select("id,name,email").eq("company_id", companyId).limit(2000);
    const supplierByName = new Map((suppliers || []).map((s: any) => [String(s.name || '').trim().toLowerCase(), s.id]));

    const existingNames = new Set((existing || []).map((p: any) => String(p?.name || "").trim().toLowerCase()).filter(Boolean));
    const existingSkus = new Set((existing || []).map((p: any) => String(p?.sku || "").trim().toLowerCase()).filter(Boolean));

    const errors: string[] = [];
    let skipped = 0;
    const seenNames = new Set<string>();
    const seenSkus = new Set<string>();

    const payload = rows.map((r: any, idx: number) => {
      const row = r || {};
      const name = String(row.name || "").trim();
      if (!name) {
        errors.push(`Row ${idx + 2}: missing name`);
        return null;
      }
      const sku = String(row.sku || "").trim();
      const nameKey = name.toLowerCase();
      const skuKey = sku ? sku.toLowerCase() : "";
      const isDupExisting = skuKey ? existingSkus.has(skuKey) : existingNames.has(nameKey);
      const isDupLocal = skuKey ? seenSkus.has(skuKey) : seenNames.has(nameKey);
      if (isDupExisting || isDupLocal) {
        skipped++;
        return null;
      }
      if (skuKey) seenSkus.add(skuKey); else seenNames.add(nameKey);
      const type = String(row.type || "product").toLowerCase() === "service" ? "service" : "product";
      const unit = row.unit_price === "" || row.unit_price == null ? 0 : Number(row.unit_price);
      if (!Number.isFinite(unit)) {
        errors.push(`Row ${idx + 2}: invalid unit_price`);
        return null;
      }
      const soh = row.stock_on_hand === "" || row.stock_on_hand == null ? null : Number(row.stock_on_hand);
      if (soh != null && !Number.isFinite(soh)) {
        errors.push(`Row ${idx + 2}: invalid stock_on_hand`);
        return null;
      }
      const low = row.low_stock_threshold === "" || row.low_stock_threshold == null ? null : Number(row.low_stock_threshold);
      if (low != null && !Number.isFinite(low)) {
        errors.push(`Row ${idx + 2}: invalid low_stock_threshold`);
        return null;
      }
      const supplierName = String(row.preferred_supplier_name || row.supplier_name || '').trim().toLowerCase();
      const supplierId = supplierName ? supplierByName.get(supplierName) || null : null;
      const rec: any = {
        company_id: companyId,
        name,
        sku: sku || null,
        type,
        unit_price: unit,
        stock_on_hand: soh,
        low_stock_threshold: low,
        is_active: toBool(row.is_active) ?? true,
      };
      if (supplierId) rec[supplierKey] = supplierId;
      return rec;
    }).filter(Boolean) as any[];

    if (!payload.length) return NextResponse.json({ inserted: 0, skipped, errors: errors.length ? errors : ["No valid rows to import."] }, { status: 200 });

    const { error } = await db.from("products").insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ inserted: payload.length, skipped, errors, used_admin: Boolean(admin), supplierKey });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Import failed" }, { status: 500 });
  }
}
