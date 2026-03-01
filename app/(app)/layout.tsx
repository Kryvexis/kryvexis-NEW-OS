import Shell from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
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
    // Home page is the login screen.
    redirect("/");
  }

  let companyName: string | undefined = undefined;
  let companyPhone: string | undefined = undefined;
  try {
    const companyId = await requireCompanyId();
    const { data: company } = await supabase
      .from('companies')
      .select('name,phone')
      .eq('id', companyId)
      .maybeSingle();
    companyName = company?.name ?? undefined;
    companyPhone = company?.phone ?? undefined;
  } catch {
    // ignore
  }

  return (
    <Shell userEmail={user.email ?? ''} workspaceName={companyName} workspacePhone={companyPhone}>
      {children}
    </Shell>
  );
}
