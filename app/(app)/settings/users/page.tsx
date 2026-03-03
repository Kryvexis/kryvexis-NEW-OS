import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { Card } from '@/components/card'
import { getCurrentUserRole } from '@/lib/roles'
import { canManageUsers, roleLabel, type UserRole } from '@/lib/roles/shared'
import UsersClient from './users-client'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold">Team & roles</div>
        <div className="text-sm kx-muted">Please sign in.</div>
      </div>
    )
  }

  const myRole = await getCurrentUserRole()
  if (!canManageUsers(myRole)) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold">Team & roles</div>
        <div className="text-sm kx-muted">Only managers can change roles.</div>
      </div>
    )
  }

  const companyId = await requireCompanyId()

  const { data: members } = await supabase
    .from('company_users')
    .select('user_id, role')
    .eq('company_id', companyId)

  const rows = (members || []).map((m: any) => ({
    user_id: m.user_id as string,
    role: (m.role as UserRole) || 'staff',
    email: '',
    full_name: '',
  }))

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Team & roles</div>
        <div className="text-sm kx-muted">Manager controls what each role sees.</div>
      </div>

      <Card>
        <div className="text-sm font-semibold">Your access</div>
        <div className="mt-1 text-sm kx-muted">Signed in as {roleLabel(myRole)}.</div>
      </Card>

      <UsersClient initialMembers={rows} />
    </div>
  )
}
