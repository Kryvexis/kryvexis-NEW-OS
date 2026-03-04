import Shell from '@/components/shell'
import { createClient } from '@/lib/supabase/server'
import { getAccessContext } from '@/lib/rbac'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const access = await getAccessContext()

  return (
    <Shell userEmail={user.email ?? ''} role={access.role} modules={access.modules}>
      {children}
    </Shell>
  )
}
