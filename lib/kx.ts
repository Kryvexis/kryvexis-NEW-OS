import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Active company cookie used by the Company Switcher.
 * (Set via /api/company/active)
 */
export const ACTIVE_COMPANY_COOKIE = "kx_active_company_id";

/**
 * Pick a safe, RLS-compatible company id for the current user.
 *
 * Priority:
 *  1) Cookie-selected company IF the user is a member (company_users)
 *  2) First company_users membership (oldest)
 *  3) Company owned by user (companies.owner_user_id)
 *  4) Auto-create a default company and membership (owner)
 *
 * NOTE (Next.js 15): cookies() is async.
 */
export async function requireCompanyId(): Promise<string> {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not authenticated");

  const uid = userData.user.id;

  // (1) Cookie-selected company, but only if membership exists
  const cookieStore = await cookies();
  const cookieCompanyId = cookieStore.get(ACTIVE_COMPANY_COOKIE)?.value;

  if (cookieCompanyId) {
    const { data: membership } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("company_id", cookieCompanyId)
      .eq("user_id", uid)
      .maybeSingle();

    if (membership?.company_id) return membership.company_id as string;
  }

  // (2) First membership company (the safest option for RLS)
  const { data: memberships, error: memErr } = await supabase
    .from("company_users")
    .select("company_id,created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: true })
    .limit(1);

  if (memErr) throw memErr;
  if (memberships && memberships.length && memberships[0]?.company_id) {
    return memberships[0].company_id as string;
  }

  // (3) Fallback: owned company (legacy single-tenant behaviour)
  const { data: owned, error: ownErr } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_user_id", uid)
    .maybeSingle();

  if (ownErr) throw ownErr;
  if (owned?.id) return owned.id as string;

  // (4) Auto-create (first-run) + ensure membership
  const { data: created, error: createErr } = await supabase
    .from("companies")
    .insert({
      owner_user_id: uid,
      name: "Kryvexis",
    })
    .select("id")
    .single();

  if (createErr) throw createErr;

  // Ensure company_users membership exists (owner)
  await supabase.from("company_users").insert({
    company_id: created.id,
    user_id: uid,
    role: "owner",
  });

  return created.id as string;
}

/**
 * Returns current company details (id + name).
 * Mirrors requireCompanyId selection logic.
 */
export async function requireCompany(): Promise<{ id: string; name: string }> {
  const supabase = await createClient();
  const companyId = await requireCompanyId();

  const { data: company, error } = await supabase
    .from("companies")
    .select("id,name")
    .eq("id", companyId)
    .maybeSingle();

  if (error) throw error;
  if (!company?.id) throw new Error("Workspace not found");

  return { id: company.id as string, name: (company as any).name as string };
}
