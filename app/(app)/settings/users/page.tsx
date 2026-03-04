import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/card'
import { getCurrentUserRole } from '@/lib/roles'
import { canManageUsers, roleLabel, type UserRole } from '@/lib/roles/shared'
import UsersClient from './users-client'
import RoleModulesClient from './role-modules-client'
import { Page } from '@/components/ui/page'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    return <Page title="Team & roles" subtitle="Please sign in first."><Card>Please sign in.</Card></Page>
  }

  const myRole = await getCurrentUserRole()
  if (!canManageUsers(myRole)) {
    return <Page title="Team & roles" subtitle="Only manager/owner can edit roles."><Card>Access denied.</Card></Page>
  }

  const { data: members } = await supabase.from('company_users').select('user_id, role')

  const rows = (members || []).map((m: any) => ({
    user_id: m.user_id as string,
    role: (m.role as UserRole) || 'staff',
    email: '',
    full_name: '',
  }))

  return (
    <Page title="Team & roles" subtitle="Manager controls what everyone sees.">
      <Card>
        <div className="text-sm font-semibold">Your access</div>
        <div className="mt-1 text-sm kx-muted">Signed in as {roleLabel(myRole)}.</div>
      </Card>
      <UsersClient initialMembers={rows} />
      <RoleModulesClient />
    </Page>
  )
}
