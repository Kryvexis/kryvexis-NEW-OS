import Shell from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyId } from "@/lib/kx";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  let companyId: string | undefined = undefined;
  let companyName: string | undefined = undefined;
  let companyPhone: string | undefined = undefined;
  let companies: { id: string; name: string | null }[] = [];

  try {
    companyId = await requireCompanyId();

    // Fetch active company details
    const { data: company } = await supabase
      .from("companies")
      .select("id,name,phone")
      .eq("id", companyId)
      .maybeSingle();

    companyName = company?.name ?? undefined;
    companyPhone = (company as any)?.phone ?? undefined;

    // Fetch membership companies for switcher
    const { data: memberships } = await supabase
      .from("company_users")
      .select("company_id, companies!inner(id,name)")
      .eq("user_id", user.id);

    companies =
      (memberships ?? [])
        .map((m: any) => ({ id: m.company_id as string, name: m.companies?.name ?? null }))
        .filter((x) => !!x.id) || [];
  } catch {
    // ignore
  }

  return (
    <Shell
      userEmail={user.email ?? ""}
      workspaceName={companyName}
      workspacePhone={companyPhone}
      currentCompanyId={companyId}
      companies={companies}
    >
      {children}
    </Shell>
  );
}
