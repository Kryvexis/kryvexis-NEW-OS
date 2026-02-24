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

    const payload = rows.map((r: any) => {
      const row = r || {};
      
      const ct = String(row.client_type||'account').toLowerCase(); const tags = ct==='cash' ? ['cash'] : ['account']; return { company_id: companyId, name: String(row.name||'').trim(), email: row.email||null, phone: row.phone||null, tags_json: tags };
      
    }).filter((r: any) => r.name);

    if (!payload.length) return NextResponse.json({ error: "No valid rows (missing name)" }, { status: 400 });

    const { error } = await supabase.from("clients").insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ inserted: payload.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Import failed" }, { status: 500 });
  }
}
