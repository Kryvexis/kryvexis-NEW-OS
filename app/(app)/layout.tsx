import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireCompany } from '@/lib/kx'
import Shell from '@/components/shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect('/login')

  const company = await requireCompany()

  // Member type badge (staff / accounts / manager). Best-effort; defaults to manager.
  let memberType: string | undefined = 'manager'
  try {
    const { data: cu } = await supabase
      .from('company_users')
      .select('role')
      .eq('user_id', data.user.id)
      .maybeSingle()
    const r = (cu as any)?.role
    if (typeof r === 'string' && r.trim()) memberType = r
  } catch {
    // ignore (RLS / missing table)
    memberType = 'manager'
  }

  return (
    <Shell userEmail={data.user.email ?? 'user'} workspaceName={company?.name ?? 'Workspace'} memberType={memberType}>
      <div className="kx-page">{children}</div>
    </Shell>
  )
}
