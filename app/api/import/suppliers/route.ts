import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";

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

    const supabase = await createClient();
    const companyId = await requireCompanyId();

    const { data: existing } = await supabase
      .from("suppliers")
      .select("id,name,email")
      .eq("company_id", companyId)
      .limit(2000);
    const existingNames = new Set((existing || []).map((s: any) => String(s?.name || "").trim().toLowerCase()).filter(Boolean));
    const existingEmails = new Set((existing || []).map((s: any) => String(s?.email || "").trim().toLowerCase()).filter(Boolean));

    const errors: string[] = [];
    let skipped = 0;
    const seenNames = new Set<string>();
    const seenEmails = new Set<string>();

    const payload = rows
      .map((r: any, idx: number) => {
        const row = r || {};
        const name = String(row.name || "").trim();
        if (!name) {
          errors.push(`Row ${idx + 2}: missing name`);
          return null;
        }
        const email = String(row.email || "").trim();
        const nameKey = name.toLowerCase();
        const emailKey = email ? email.toLowerCase() : "";

        if (existingNames.has(nameKey) || (emailKey && existingEmails.has(emailKey))) {
          skipped++;
          return null;
        }
        if (seenNames.has(nameKey) || (emailKey && seenEmails.has(emailKey))) {
          skipped++;
          return null;
        }
        seenNames.add(nameKey);
        if (emailKey) seenEmails.add(emailKey);

        return {
          company_id: companyId,
          name,
          email: email || null,
          phone: String(row.phone || "").trim() || null,
          notes: String(row.notes || "").trim() || null,
        };
      })
      .filter(Boolean) as any[];

    if (!payload.length) {
      return NextResponse.json(
        { inserted: 0, skipped, errors: errors.length ? errors : ["No valid rows to import."] },
        { status: 200 }
      );
    }

    const { error } = await supabase.from("suppliers").insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ inserted: payload.length, skipped, errors });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Import failed" }, { status: 500 });
  }
}
