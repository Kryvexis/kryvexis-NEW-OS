import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let companyId: string;
  try {
    companyId = await requireCompanyId();
  } catch {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  const role = String(body?.role || "staff").trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!["owner", "manager", "accounts", "cashier", "buyer", "staff"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Ensure caller is owner/manager
  const { data: me } = await supabase
    .from("company_users")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!me?.role || !["owner", "manager"].includes(String(me.role))) {
    return NextResponse.json({ error: "Manager only" }, { status: 403 });
  }

  // Record invite row
  const { data: invite, error: invErr } = await supabase
    .from("company_invites")
    .insert({
      company_id: companyId,
      email,
      role,
      invited_by: user.id,
      status: "pending",
    })
    .select("*")
    .maybeSingle();

  if (invErr) {
    return NextResponse.json({ error: invErr.message }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && service) {
    try {
      const admin = createAdminClient(url, service, { auth: { persistSession: false } });
      // @ts-ignore
      await admin.auth.admin.inviteUserByEmail(email);
      return NextResponse.json({ ok: true, invite, invited: true });
    } catch (e: any) {
      return NextResponse.json({ ok: true, invite, invited: false, warning: e?.message || "Invite email failed" });
    }
  }

  return NextResponse.json({ ok: true, invite, invited: false, warning: "Service role key not set (no invite email sent)." });
}
