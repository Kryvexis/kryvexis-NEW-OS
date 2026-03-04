<<<<<<< HEAD
import Shell from '@/components/shell'
import { createClient } from '@/lib/supabase/server'
import { getAccessContext } from '@/lib/rbac'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
=======
import Shell from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
>>>>>>> 580a72d (RBAC modules + sidebar/nav filtering + middleware PWA exclusions + safer company routing)

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const access = await getAccessContext()

<<<<<<< HEAD
  return (
    <Shell userEmail={user.email ?? ''} role={access.role} modules={access.modules}>
=======
  // DB-backed RBAC (role + enabled modules per role).
  // If membership data is missing, we keep the UI stable and let the user reach Account Center.
  let role = 'staff' as const;
  let modules = ['sales'] as any;
  try {
    const access = await getCurrentAccess();
    role = access.role;
    modules = access.modules;
  } catch {
    // fallback: staff/sales
  }
  return (
    <Shell userEmail={user.email ?? ""} role={role} modules={modules}>
>>>>>>> 580a72d (RBAC modules + sidebar/nav filtering + middleware PWA exclusions + safer company routing)
      {children}
    </Shell>
  )
}
