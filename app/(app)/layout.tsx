import Shell from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/roles";
import { requireCompanyId } from "@/lib/kx";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

// Auth-gated layout for the main app.
// Root HTML/body and global theme init live in app/layout.tsx.

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect straight to auth route to avoid redirect loops (middleware routes '/' based on auth).
    redirect("/login");
  }

  const role = await getCurrentUserRole();

  // Manager-configured module visibility (RBAC).
  // Owner/manager always see everything.
  let enabledModules: string[] | undefined = undefined;
  if (role !== 'owner' && role !== 'manager') {
    try {
      const companyId = await requireCompanyId();
      const { data, error } = await supabase
        .from('role_modules')
        .select('module, enabled')
        .eq('company_id', companyId)
        .eq('role', role)
      if (!error) {
        enabledModules = (data || []).filter((r: any) => r?.enabled).map((r: any) => String(r.module));
      }
    } catch {
      enabledModules = undefined;
    }
  }
  return (
    <Shell userEmail={user.email ?? ""} role={role} enabledModules={enabledModules}>
      {children}
    </Shell>
  );
}
