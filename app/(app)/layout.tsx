import Shell from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserModules, getCurrentUserRole } from "@/lib/roles";
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
  const enabledModules = await getCurrentUserModules(role);
  return (
    <Shell userEmail={user.email ?? ""} role={role} enabledModules={enabledModules}>
      {children}
    </Shell>
  );
}
